// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AuthRequestV2, ResultResolver } from '@subwallet/extension-base/background/KoniTypes';
import { AuthorizeRequest, RequestAuthorizeTab, Resolver } from '@subwallet/extension-base/background/types';
import { ChainService } from '@subwallet/extension-base/services/chain-service';
import { _isChainEnabled, _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import RequestService from '@subwallet/extension-base/services/request-service';
import { AuthUrls } from '@subwallet/extension-base/services/request-service/types';
import AuthorizeStore from '@subwallet/extension-base/stores/Authorize';
import { getId } from '@subwallet/extension-base/utils/getId';
import { accounts } from '@subwallet/ui-keyring/observable/accounts';
import { BehaviorSubject, Subject } from 'rxjs';

import { assert } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';

const AUTH_URLS_KEY = 'authUrls';

export default class AuthRequestHandler {
  readonly #requestService: RequestService;
  readonly #chainService: ChainService;
  private readonly authorizeStore = new AuthorizeStore();
  readonly #authRequestsV2: Record<string, AuthRequestV2> = {};
  private authorizeCached: AuthUrls | undefined = undefined;
  private readonly authorizeUrlSubject = new Subject<AuthUrls>();
  private readonly evmChainSubject = new Subject<AuthUrls>();
  public readonly authSubjectV2: BehaviorSubject<AuthorizeRequest[]> = new BehaviorSubject<AuthorizeRequest[]>([]);

  constructor (requestService: RequestService, chainService: ChainService) {
    this.#requestService = requestService;
    this.#chainService = chainService;
  }

  private stripUrl (url: string): string {
    assert(url && (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('ipfs:') || url.startsWith('ipns:')), `Invalid url ${url}, expected to start with http: or https: or ipfs: or ipns:`);

    const parts = url.split('/');

    return parts[2];
  }

  private getAddressList (value = false): Record<string, boolean> {
    const addressList = Object.keys(accounts.subject.value);

    return addressList.reduce((addressList, v) => ({ ...addressList, [v]: value }), {});
  }

  public get numAuthRequestsV2 (): number {
    return Object.keys(this.#authRequestsV2).length;
  }

  private get allAuthRequestsV2 (): AuthorizeRequest[] {
    return Object
      .values(this.#authRequestsV2)
      .map(({ id, request, url }): AuthorizeRequest => ({ id, request, url }));
  }

  private updateIconAuthV2 (shouldClose?: boolean): void {
    this.authSubjectV2.next(this.allAuthRequestsV2);
    this.#requestService.updateIconV2(shouldClose);
  }

  public setAuthorize (data: AuthUrls, callback?: () => void): void {
    this.authorizeStore.set(AUTH_URLS_KEY, data, () => {
      this.authorizeCached = data;
      this.evmChainSubject.next(this.authorizeCached);
      this.authorizeUrlSubject.next(this.authorizeCached);
      callback && callback();
    });
  }

  public getAuthorize (update: (value: AuthUrls) => void): void {
    // This action can be use many by DApp interaction => caching it in memory
    if (this.authorizeCached) {
      update(this.authorizeCached);
    } else {
      this.authorizeStore.get('authUrls', (data) => {
        this.authorizeCached = data;
        update(this.authorizeCached);
      });
    }
  }

  public getAuthList (): Promise<AuthUrls> {
    return new Promise<AuthUrls>((resolve, reject) => {
      this.getAuthorize((rs: AuthUrls) => {
        resolve(rs);
      });
    });
  }

  private authCompleteV2 = (id: string, resolve: (result: boolean) => void, reject: (error: Error) => void): Resolver<ResultResolver> => {
    const isAllowedMap = this.getAddressList();

    const complete = (result: boolean | Error, cb: () => void, accounts?: string[]) => {
      const isAllowed = result === true;
      let isCancelled = false;

      if (!isAllowed && typeof result === 'object' && result.message === 'Cancelled') {
        isCancelled = true;
      }

      if (accounts && accounts.length) {
        accounts.forEach((acc) => {
          isAllowedMap[acc] = true;
        });
      } else {
        // eslint-disable-next-line no-return-assign
        Object.keys(isAllowedMap).forEach((address) => isAllowedMap[address] = false);
      }

      const { accountAuthType, idStr, request: { allowedAccounts, origin }, url } = this.#authRequestsV2[id];

      if (accountAuthType !== 'both') {
        const isEvmType = accountAuthType === 'evm';

        const backupAllowed = [...(allowedAccounts || [])].filter((a) => {
          const isEth = isEthereumAddress(a);

          return isEvmType ? !isEth : isEth;
        });

        backupAllowed.forEach((acc) => {
          isAllowedMap[acc] = true;
        });
      }

      let defaultEvmNetworkKey: string | undefined;

      if (accountAuthType === 'both' || accountAuthType === 'evm') {
        const defaultChain = Object.values(this.#chainService.getChainInfoMap()).find((chainInfo) => {
          const chainState = this.#chainService.getChainStateByKey(chainInfo.slug);

          return _isChainEvmCompatible(chainInfo) && _isChainEnabled(chainState);
        });

        if (defaultChain) {
          defaultEvmNetworkKey = defaultChain.slug;
        }
      }

      this.getAuthorize((value) => {
        let authorizeList = {} as AuthUrls;

        if (value) {
          authorizeList = value;
        }

        const existed = authorizeList[this.stripUrl(url)];

        // On cancel don't save anything
        if (isCancelled) {
          delete this.#authRequestsV2[id];
          this.updateIconAuthV2(true);
          cb();

          return;
        }

        authorizeList[this.stripUrl(url)] = {
          count: 0,
          id: idStr,
          isAllowed,
          isAllowedMap,
          origin,
          url,
          accountAuthType: (existed && existed.accountAuthType !== accountAuthType) ? 'both' : accountAuthType,
          currentEvmNetworkKey: existed ? existed.currentEvmNetworkKey : defaultEvmNetworkKey
        };

        this.setAuthorize(authorizeList, () => {
          cb();
          delete this.#authRequestsV2[id];
          this.updateIconAuthV2(true);
        });
      });
    };

    return {
      reject: (error: Error): void => {
        complete(error, () => {
          reject(error);
        });
      },
      resolve: ({ accounts, result }: ResultResolver): void => {
        complete(result, () => {
          resolve(result);
        }, accounts);
      }
    };
  };

  public async authorizeUrlV2 (url: string, request: RequestAuthorizeTab): Promise<boolean> {
    let authList = await this.getAuthList();
    const accountAuthType = request.accountAuthType || 'substrate';

    request.accountAuthType = accountAuthType;

    if (!authList) {
      authList = {};
    }

    const idStr = this.stripUrl(url);
    // Do not enqueue duplicate authorization requests.
    const isDuplicate = Object.values(this.#authRequestsV2)
      .some((request) => request.idStr === idStr);

    assert(!isDuplicate, `The source ${url} has a pending authorization request`);

    const existedAuth = authList[idStr];
    const existedAccountAuthType = existedAuth?.accountAuthType;
    const confirmAnotherType = existedAccountAuthType !== 'both' && existedAccountAuthType !== request.accountAuthType;

    if (request.reConfirm && existedAuth) {
      request.origin = existedAuth.origin;
    }

    // Reconfirm if check auth for empty list
    if (existedAuth) {
      const inBlackList = existedAuth && !existedAuth.isAllowed;

      if (inBlackList) {
        throw new Error(`The source ${url} is not allowed to interact with this extension`);
      }

      request.allowedAccounts = Object.entries(existedAuth.isAllowedMap)
        .map(([address, allowed]) => (allowed ? address : ''))
        .filter((item) => (item !== ''));

      let allowedListByRequestType = [...request.allowedAccounts];

      if (accountAuthType === 'evm') {
        allowedListByRequestType = allowedListByRequestType.filter((a) => isEthereumAddress(a));
      } else if (accountAuthType === 'substrate') {
        allowedListByRequestType = allowedListByRequestType.filter((a) => !isEthereumAddress(a));
      }

      if (!confirmAnotherType && !request.reConfirm && allowedListByRequestType.length !== 0) {
        // Prevent appear confirmation popup
        return false;
      }
    }

    return new Promise((resolve, reject): void => {
      const id = getId();

      this.#authRequestsV2[id] = {
        ...this.authCompleteV2(id, resolve, reject),
        id,
        idStr,
        request,
        url,
        accountAuthType: accountAuthType
      };

      this.updateIconAuthV2();

      if (Object.keys(this.#authRequestsV2).length < 2) {
        this.#requestService.popupOpen();
      }
    });
  }

  public getAuthRequestV2 (id: string): AuthRequestV2 {
    return this.#authRequestsV2[id];
  }

  public get subscribeEvmChainChange (): Subject<AuthUrls> {
    return this.evmChainSubject;
  }

  public get subscribeAuthorizeUrlSubject (): Subject<AuthUrls> {
    return this.authorizeUrlSubject;
  }

  public ensureUrlAuthorizedV2 (url: string): Promise<boolean> {
    const idStr = this.stripUrl(url);

    return new Promise((resolve, reject) => {
      this.getAuthorize((value) => {
        if (!value) {
          value = {};
        }

        const entry = Object.keys(value).includes(idStr);

        if (!entry) {
          reject(new Error(`The source ${url} has not been enabled yet`));
        }

        const isConnected = value[idStr] && Object.keys(value[idStr].isAllowedMap)
          .some((address) => value[idStr].isAllowedMap[address]);

        if (!isConnected) {
          reject(new Error(`The source ${url} is not allowed to interact with this extension`));
        }

        resolve(true);
      });
    });
  }
}