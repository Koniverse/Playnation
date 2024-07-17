// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Interact with Telegram with fallback
import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';

export interface TelegramThemeConfig {
  headerColor: string;
  headerTextColor: string;
  backgroundColor: string;
  textColor: string;
}

export class TelegramConnector {
  private _version: string;
  private supportCloudStorage: boolean;
  private supportModal: boolean;
  private supportBasicMethod: boolean;

  constructor () {
    this._version = TelegramWebApp.version;
    const versions = this._version.split('.').map((v) => parseInt(v, 10));
    const versionNum = versions[0] * 100 + versions[1];

    this.supportCloudStorage = versionNum >= 609;
    this.supportModal = versionNum >= 602;
    this.supportBasicMethod = versionNum >= 601;

    console.log('TelegramConnector', this._version, this.supportCloudStorage, this.supportModal, this.supportBasicMethod);
  }

  get userInfo () {
    return TelegramWebApp.initDataUnsafe?.user;
  }

  syncTheme (headerColor: string, backgroundColor: string) {
    if (this.supportBasicMethod) {
      TelegramWebApp.setHeaderColor(headerColor as `#${string}`);
      TelegramWebApp.setBackgroundColor(backgroundColor as `#${string}`);
    }
  }

  getStartParam () {
    return TelegramWebApp.initDataUnsafe?.start_param;
  }

  openLink (url: string) {
    if (url.startsWith('https://t.me/')) {
      this.openTelegramLink(url);

      return;
    }

    if (this.supportBasicMethod) {
      TelegramWebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  openTelegramLink (url: string) {
    if (this.supportBasicMethod) {
      TelegramWebApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  autoActions () {
    // Auto expand
    if (this.supportBasicMethod) {
      if (!TelegramWebApp.isExpanded) {
        TelegramWebApp.expand();
      }
    }

    // Enable closing confirmation
    if (!!TelegramWebApp.enableClosingConfirmation && !TelegramWebApp.isClosingConfirmationEnabled) {
      TelegramWebApp.enableClosingConfirmation();
    }

    // Disable vertical swipe
    if (!!TelegramWebApp.disableVerticalSwipes && TelegramWebApp.isVerticalSwipesEnabled) {
      TelegramWebApp.disableVerticalSwipes();
    }
  }

  showConfirmation (message: string, callback: (confirm: boolean) => void) {
    if (this.supportModal) {
      TelegramWebApp.showConfirm(message, callback);
    } else {
      const rs = confirm(message);

      callback(rs);
    }
  }

  showAlert (message: string, callback: () => void) {
    if (this.supportModal) {
      TelegramWebApp.showAlert(message, callback);
    } else {
      alert(message);
      callback();
    }
  }

  showPopup (params: PopupParams, callback: () => void) {
    if (this.supportModal) {
      TelegramWebApp.showPopup(params, callback);
    } else {
      alert(`${params.title || ''}: ${params.message}`);
      callback();
    }
  }

  async isBiometricAvailable () {
    const biometricManager = await this.getBiometricManager();

    return !!(biometricManager?.isBiometricAvailable);
  }

  async getBiometricManager () {
    const biometricManager = TelegramWebApp.BiometricManager;

    if (!biometricManager) {
      return null;
    }

    if (!biometricManager.isInited) {
      await new Promise<void>((resolve) => {
        biometricManager.init(() => {
          resolve();
        });
      });
    }

    return biometricManager;
  }

  async checkUsingBiometric () {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return false;
    }

    return biometricManager.isBiometricTokenSaved;
  }

  async setBiometricToken (token: string) {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return false;
    }

    let isAccessGranted = biometricManager.isAccessGranted;

    if (!biometricManager.isAccessRequested) {
      isAccessGranted = await new Promise<boolean>((resolve) => {
        biometricManager.requestAccess({
          reason: 'Would you like to use biometric to unlock your account?'
        }, (rs) => {
          resolve(rs);
        });
      });
    }

    if (isAccessGranted) {
      return await new Promise<boolean>((resolve) => {
        biometricManager.updateBiometricToken(token, (applied) => {
          resolve(applied);
        });
      });
    } else {
      return false;
    }
  }

  async getBiometricToken (): Promise<string | undefined> {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return undefined;
    }

    return await new Promise((resolve) => {
      biometricManager.authenticate({
        reason: 'Please authenticate to unlock your account'
      }, (isAuthenticated, biometricToken) => {
        if (isAuthenticated) {
          resolve(biometricToken);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  // Singleton
  static _instance: TelegramConnector;
  static get instance () {
    if (!this._instance) {
      this._instance = new TelegramConnector();
    }

    return this._instance;
  }
}
