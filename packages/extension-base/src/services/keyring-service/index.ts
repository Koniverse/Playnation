// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { CurrentAccountInfo, KeyringState } from '@subwallet/extension-base/background/KoniTypes';
import { ALL_ACCOUNT_KEY, CUSTOM_PASSWORD_KEY } from '@subwallet/extension-base/constants';
import { EventService } from '@subwallet/extension-base/services/event-service';
import { SWStorage } from '@subwallet/extension-base/storage';
import { CurrentAccountStore } from '@subwallet/extension-base/stores';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { InjectedAccountWithMeta } from '@subwallet/extension-inject/types';
import { KeyringState } from '@subwallet/extension-base/background/KoniTypes';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { keyring } from '@subwallet/ui-keyring';
import { BehaviorSubject } from 'rxjs';

import { AccountContext } from './context/account-context';

const cloudStorage = SWStorage.instance;

export class KeyringService {
  private readonly currentAccountStore = new CurrentAccountStore();
  readonly currentAccountSubject = new BehaviorSubject<CurrentAccountInfo>({ address: '', currentGenesisHash: null });

  readonly addressesSubject = keyring.addresses.subject;
  public readonly accountSubject = keyring.accounts.subject;
  private beforeAccount: SubjectInfo = this.accountSubject.value;
  private injected: boolean;
  private usingCustomPassword = false;
  private checkUsingCustomPassword = createPromiseHandler<boolean>();
  private currentWCAddress = '';

  readonly keyringStateSubject = new BehaviorSubject<KeyringState>({
  private readonly stateSubject = new BehaviorSubject<KeyringState>({
    isReady: false,
    hasMasterPassword: false,
    isLocked: false,
    useCustomPassword: false
  });

  getPair = keyring.getPair.bind(keyring);

  constructor (private eventService: EventService) {
    this.injected = false;
    this.eventService.waitCryptoReady.then(() => {
      this.currentAccountStore.get('CurrentAccountInfo', (rs) => {
        rs && this.currentAccountSubject.next(rs);
      });
      this.subscribeAccounts().catch(console.error);
    }).catch(console.error);

    cloudStorage.getItem(CUSTOM_PASSWORD_KEY).then((rs) => {
      this.usingCustomPassword = rs === 'true';
      this.checkUsingCustomPassword.resolve(this.usingCustomPassword);
    }).catch(console.error);
  }

  private async subscribeAccounts () {
    // Wait until account ready
    await this.eventService.waitAccountReady;

    this.beforeAccount = { ...this.accountSubject.value };

    this.accountSubject.subscribe((subjectInfo) => {
      // Check if accounts changed
      const beforeAddresses = Object.keys(this.beforeAccount);
      const afterAddresses = Object.keys(subjectInfo);

      if (beforeAddresses.length > afterAddresses.length) {
        const removedAddresses = beforeAddresses.filter((address) => !afterAddresses.includes(address));
  public readonly context: AccountContext;

  constructor (private state: KoniState) {
    this.context = new AccountContext(this.state, this);
  }

  get keyringState () {
    return this.stateSubject.value;
  }

  public keyringStateSubscribe (callback: (state: KeyringState) => void) {
    return this.stateSubject.subscribe(callback);
  }

  public eventInjectReady () {
    this.state.eventService.emit('inject.ready', true);
  }

  async setUsingCustomPassword (usingCustomPassword: boolean) {
    this.usingCustomPassword = usingCustomPassword;
    await cloudStorage.setItem(CUSTOM_PASSWORD_KEY, String(usingCustomPassword));
    this.updateKeyringState();
  }

  updateKeyringState (isReady = true) {
  public eventRemoveAccountProxy (proxyId: string) {
    this.state.eventService.emit('accountProxy.remove', proxyId);
  }

  public updateKeyringState (isReady = true) {
    if (!this.keyringState.isReady && isReady) {
      Promise.all([this.eventService.waitCryptoReady, this.checkUsingCustomPassword]).then(() => {
        this.eventService.emit('keyring.ready', true);
        this.eventService.emit('account.ready', true);

        this.keyringStateSubject.next({
          useCustomPassword: this.usingCustomPassword,
          hasMasterPassword: !!keyring.keyring?.hasMasterPassword,
          isLocked: !!keyring.keyring?.isLocked,
          isReady: isReady
        });
      }).catch(console.error);
    } else {
      this.keyringStateSubject.next({
        useCustomPassword: this.usingCustomPassword,
        hasMasterPassword: !!keyring.keyring?.hasMasterPassword,
        isLocked: !!keyring.keyring?.isLocked,
        isReady: isReady
      });
    }
      this.state.eventService.waitCryptoReady
        .then(() => {
          this.state.eventService.emit('keyring.ready', true);
          this.state.eventService.emit('account.ready', true);
        })
        .catch(console.error);
    }

    this.stateSubject.next({
      hasMasterPassword: !!keyring.keyring?.hasMasterPassword,
      isLocked: !!keyring.keyring?.isLocked,
      isReady: isReady
    });
  }

  public lock () {
    keyring.lockAll();
    this.updateKeyringState();
  }

  /* Inject */

  public addInjectAccounts (accounts: InjectedAccountWithMeta[]) {
    keyring.addInjects(accounts.map((account) => {
      const name = account.meta.name || stringShorten(account.address);

      // TODO: Add if need
      // name = name.concat(' (', account.meta.source, ')');

      return {
        ...account,
        meta: {
          ...account.meta,
          name: name
        }
      };
    }));

    const currentAddress = this.currentAccountSubject.value.address;
    const afterAccounts: Record<string, boolean> = {};

    Object.keys(this.accounts).forEach((adr) => {
      afterAccounts[adr] = true;
    });

    accounts.forEach((value) => {
      afterAccounts[value.address] = true;
    });

    if (Object.keys(afterAccounts).length === 1) {
      this.currentAccountSubject.next({ address: Object.keys(afterAccounts)[0], currentGenesisHash: null });
    } else if (Object.keys(afterAccounts).indexOf(currentAddress) === -1) {
      this.currentAccountSubject.next({ address: ALL_ACCOUNT_KEY, currentGenesisHash: null });
    }

    if (!this.injected) {
      this.eventService.emit('inject.ready', true);
      this.injected = true;
    }
  }

  public removeInjectAccounts (_addresses: string[]) {
    const addresses = _addresses.map((address) => {
      try {
        return keyring.getPair(address).address;
      } catch (error) {
        return address;
      }
    });
    const currentAddress = this.currentAccountSubject.value.address;
    const afterAccounts = Object.keys(this.accounts).filter((address) => (addresses.indexOf(address) < 0));

    if (afterAccounts.length === 1) {
      this.currentAccountSubject.next({ address: afterAccounts[0], currentGenesisHash: null });
    } else if (addresses.indexOf(currentAddress) === -1) {
      this.currentAccountSubject.next({ address: ALL_ACCOUNT_KEY, currentGenesisHash: null });
    }

    keyring.removeInjects(addresses);
  }

  /* Inject */

  /* Wallet Connect */

  public updateWalletConnectAddress (address: string, topic = '') {
    if (address === '') {
      if (this.currentWCAddress) {
        keyring.removeInjects([this.currentWCAddress]);
      }
    } else {
      if (this.currentWCAddress && this.currentWCAddress !== address) {
        keyring.removeInjects([this.currentWCAddress]);
      }

      this.currentWCAddress = address;

      keyring.addInjects([{
        address,
        type: 'ethereum',
        meta: {
          name: 'Wallet Connect',
          wcTopic: topic
        }
      }]);
    }
  }

  /* Reset */
  public async resetWallet (resetAll: boolean) {
    keyring.resetWallet(resetAll);
    this.context.resetWallet();
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });
    this.updateKeyringState();
  }
  /* Reset */
}
