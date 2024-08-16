// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

// Interact with Telegram with fallback
import { addLazy } from '@subwallet/extension-base/utils';
import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';
import { BOWER_PARSER, isIos } from '@subwallet/extension-koni-ui/utils';
import { versionCompare } from '@subwallet/extension-koni-ui/utils/common/version';

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

    this.supportCloudStorage = this.versionAtLeast('6.9');
    this.supportModal = this.versionAtLeast('6.2');
    this.supportBasicMethod = this.versionAtLeast('6.1');
    this.autoActions();

    setTimeout(() => {
      this.syncRootViewPort();
    }, 300);

    console.log('TelegramConnector', this._version, this.supportCloudStorage, this.supportModal, this.supportBasicMethod);
  }

  versionAtLeast (ver: string) {
    return versionCompare(this._version, ver) >= 0;
  }

  syncRootViewPort () {
    const bodyElem = document.body;
    const rootElem = document.getElementById('root');
    const isIphone = isIos();

    bodyElem.classList.add(`platform-${BOWER_PARSER.getOSName(true)}`);

    let handleScroll = 0;
    let lastHandleScroll = handleScroll;

    if (isIphone) {
      window.onscroll = (ev) => {
        if (window.scrollY !== 0) {
          handleScroll++;

          addLazy('window-scroll-back', () => {
            window.scroll(0, 0);
          }, 30);
        }
      };
    }

    let handleId = 0;

    rootElem && TelegramWebApp.onEvent('viewportChanged', (rs) => {
      const windowHeight = window.innerHeight;
      const currentHeight = TelegramWebApp.viewportHeight || 600;
      const keyboardHeight = windowHeight - currentHeight;
      const isSmallScreen = currentHeight < 600 && TelegramWebApp.isExpanded;
      const updateValue = isSmallScreen ? `${currentHeight}px` : '100vh';
      const keyboardValue = isSmallScreen ? `${keyboardHeight}px` : '0';

      handleId++;
      const handlingId = handleId;

      if (isIphone && isSmallScreen) {
        (async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 100);
          });

          // Wait for scroll back
          if (lastHandleScroll !== handleScroll) {
            await new Promise((resolve) => {
              setTimeout(resolve, 330);
            });
          }

          lastHandleScroll = handleScroll;

          if (handlingId < handleId) {
            return;
          }

          document.documentElement.style.setProperty('--playnation-view-height', updateValue);
          document.documentElement.style.setProperty('--playnation-keyboard-height', keyboardValue);
        })().catch(console.error);
      } else {
        document.documentElement.style.setProperty('--playnation-view-height', updateValue);
        document.documentElement.style.setProperty('--playnation-keyboard-height', keyboardValue);
      }
    });
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

  // Singleton
  static _instance: TelegramConnector;
  static get instance () {
    if (!this._instance) {
      this._instance = new TelegramConnector();
    }

    return this._instance;
  }
}
