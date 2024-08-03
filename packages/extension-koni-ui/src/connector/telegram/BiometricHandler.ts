// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';

export class BiometricHandler {
  private biometricManager: BiometricManager | undefined;
  private _deviceId: string | null = null;
  private _isSupportBiometric: boolean | null = null;

  async getBiometricManager () {
    if (!this.biometricManager) {
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

    return biometricManager.isBiometricTokenSaved;
  }

  async onSetBiometricToken () {
    // Set biometric token
  }

  async onRemoveBiometricToken () {
    // Remove biometric token
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
