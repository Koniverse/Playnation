// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { KeyringState } from '@subwallet/extension-base/background/KoniTypes';
import { CUSTOM_PASSWORD_KEY } from '@subwallet/extension-base/constants';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import { AccountContext } from '@subwallet/extension-base/services/keyring-service/context/account-context';
import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { keyring } from '@subwallet/ui-keyring';
import { BehaviorSubject } from 'rxjs';

const cloudStorage = SWStorage.instance;

export class KeyringService {
  private checkUsingCustomPassword = createPromiseHandler<boolean>();
  private currentWCAddress = '';
  private usingCustomPassword = false;

  private readonly stateSubject = new BehaviorSubject<KeyringState>({
    isReady: false,
    hasMasterPassword: false,
    isLocked: false,
    useCustomPassword: false
  });

  readonly context: AccountContext;

  getPair = keyring.getPair.bind(keyring);

  constructor (private state: KoniState) {
    this.context = new AccountContext(this.state, this);

    cloudStorage.getItem(CUSTOM_PASSWORD_KEY).then((rs) => {
      this.usingCustomPassword = rs === 'true';
      this.checkUsingCustomPassword.resolve(this.usingCustomPassword);
    }).catch(console.error);
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

  public eventRemoveAccountProxy (proxyId: string) {
    this.state.eventService.emit('accountProxy.remove', proxyId);
  }

  public updateKeyringState (isReady = true) {
    if (!this.keyringState.isReady && isReady) {
      Promise.all([this.state.eventService.waitCryptoReady, this.checkUsingCustomPassword]).then(() => {
        this.state.eventService.emit('keyring.ready', true);
        this.state.eventService.emit('account.ready', true);

        this.stateSubject.next({
          useCustomPassword: this.usingCustomPassword,
          hasMasterPassword: !!keyring.keyring?.hasMasterPassword,
          isLocked: !!keyring.keyring?.isLocked,
          isReady: isReady
        });
      }).catch(console.error);
    } else {
      this.stateSubject.next({
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

  public lock () {
    keyring.lockAll();
    this.updateKeyringState();
  }

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
}
