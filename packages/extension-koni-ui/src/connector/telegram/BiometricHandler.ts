// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';

export class BiometricHandler {
  private biometricManager: BiometricManager | undefined;
  private _deviceId: string | null = null;
  private _isSupportBiometric: boolean | null = null;

  async reloadBiometricManagerInfo () {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    window.Telegram?.WebView?.postEvent('web_app_biometry_get_info', false);
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
  }

  async getBiometricManager (reload = false) {
    if (!this.biometricManager || reload) {
      const biometricManager = TelegramWebApp.BiometricManager;

      if (!biometricManager) {
        return null;
      }

      if (reload) {
        await this.reloadBiometricManagerInfo();
      }

      if (!biometricManager.isInited) {
        await new Promise<void>((resolve) => {
          biometricManager.init(() => {
            resolve();
          });
        });
      }

      this.biometricManager = biometricManager;
    }

    return this.biometricManager;
  }

  async isSupportBiometric (): Promise<boolean> {
    if (this._isSupportBiometric === null) {
      const biometricManager = await this.getBiometricManager();

      this._isSupportBiometric = !!(biometricManager?.isBiometricAvailable);
    }

    return this._isSupportBiometric;
  }

  async getBiometricDeviceId () {
    if (this._deviceId) {
      return this._deviceId;
    }

    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return null;
    }

    this._deviceId = biometricManager.deviceId;

    return this._deviceId;
  }

  async checkUsingBiometric () {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return false;
    }

    return biometricManager.isAccessGranted && biometricManager.isAccessRequested && biometricManager.isBiometricTokenSaved;
  }

  async onSetBiometricToken () {
    // Set biometric token
  }

  async onRemoveBiometricToken () {
    // Remove biometric token
  }

  async checkAccessGranted () {
    const biometricManager = await this.getBiometricManager(true);

    if (!biometricManager) {
      return false;
    }

    return biometricManager.isAccessGranted;
  }

  async checkAccessRequest () {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return false;
    }

    if (!biometricManager.isAccessRequested) {
      return await new Promise<boolean>((resolve) => {
        biometricManager.requestAccess({
          reason: 'Would you like to use biometric to unlock your account?'
        }, (rs) => {
          resolve(rs);
        });
      });
    } else {
      return true;
    }
  }

  async openSettings () {
    const biometricManager = await this.getBiometricManager();

    if (!biometricManager) {
      return;
    }

    biometricManager.openSettings();
  }

  async setBiometricToken (token: string) {
    const biometricManager = await this.getBiometricManager(true);

    if (!biometricManager) {
      return false;
    }

    if (!biometricManager.isAccessGranted) {
      biometricManager.openSettings();

      return false;
    }

    if (biometricManager.isAccessRequested) {
      const result = await new Promise<boolean>((resolve) => {
        biometricManager.updateBiometricToken(token, (applied) => {
          resolve(applied);
        });
      });

      if (result) {
        // Remove token
        if (token === '') {
          await this.onRemoveBiometricToken();
        } else {
          await this.onSetBiometricToken();
        }
      }

      return result;
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

  // singleton instance
  private static _instance: BiometricHandler;

  // get singleton instance
  public static get instance (): BiometricHandler {
    if (!this._instance) {
      this._instance = new BiometricHandler();
    }

    return this._instance;
  }
}
