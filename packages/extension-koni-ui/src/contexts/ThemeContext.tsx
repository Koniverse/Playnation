// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { ThemeNames } from '@subwallet/extension-base/background/KoniTypes';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import applyPreloadStyle from '@subwallet/extension-koni-ui/preloadStyle';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { generateTheme, getDefaultLogoMap, SW_THEME_CONFIGS, SwThemeConfig } from '@subwallet/extension-koni-ui/themes';
import { ConfigProvider, theme as reactUiTheme } from '@subwallet/react-ui';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { createGlobalStyle, ThemeProvider as StyledComponentThemeProvider } from 'styled-components';

import { Theme } from '../types';

interface Props {
  children: React.ReactNode;
  themeConfig: SwThemeConfig
}

const { useToken } = reactUiTheme;

const telegramConnector = TelegramConnector.instance;

const GlobalStyle = createGlobalStyle<ThemeProps>(({ theme }) => {
  const { extendToken, token } = theme as Theme;

  telegramConnector.syncTheme(token.colorBgBase, token.colorBgBase);
  applyPreloadStyle(extendToken.bodyBackgroundColor);

  return ({
    '.startup-screen': {
      background: extendToken.colorBgGradient || token.colorPrimary
    },

    body: {
      fontFamily: token.fontFamily,
      color: token.colorText,
      fontWeight: token.bodyFontWeight
    },
    pre: {
      fontFamily: 'inherit',
      whiteSpace: 'pre-wrap'
    },

    '.loading-icon': {
      fontSize: token.size
    },

    '.main-page-container': {
      border: 0
    },

    '.ant-sw-modal .ant-sw-modal-header': {
      borderRadius: '24px 24px 0 0'
    },

    '.ant-sw-modal': {
      '&, &.ant-sw-qr-scanner': {
        '.ant-sw-modal-content': {
          left: token.lineWidth,
          bottom: 0,
          borderBottom: `1px solid ${token.colorBgInput}`
        }
      },

      '&.modal-full, &.ant-sw-qr-scanner': {
        '.ant-sw-modal-content': {}
      }
    },

    '.modal-full': {
      '.ant-sw-modal-content': {
        '.ant-sw-modal-header': {
          borderRadius: 0
        }
      }
    },
    '.__currency-value-detail-tooltip': {
      paddingBottom: 0,

      '.ant-tooltip-inner': {
        padding: `${token.paddingXXS}px ${token.paddingXXS + 2}px`,
        fontSize: token.fontSizeXS,
        minHeight: 'auto',
        minWidth: 'auto'
      },

      '.ant-tooltip-arrow': {
        transform: 'translateX(-50%) translateY(100%) rotate(180deg) scaleX(0.5)'
      }
    },

    '.tooltip-overlay': {
      '.ant-tooltip-inner': {
        fontSize: token.fontSizeXS,
        lineHeight: token.lineHeightXS,
        fontWeight: 700,
        padding: `2px ${token.paddingXS}px`,
        minHeight: 'auto'
      }
    },

    '.text-secondary': {
      color: token.colorTextSecondary
    },

    '.text-tertiary': {
      color: token.colorTextTertiary
    },

    '.text-light-2': {
      color: token.colorTextLight2
    },

    '.text-light-4': {
      color: token.colorTextLight4
    },

    '.common-text': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.sm-text': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.mono-text': {
      fontFamily: token.monoSpaceFontFamily
    },

    '.ml-xs': {
      marginLeft: token.marginXS
    },

    '.ml-xxs': {
      marginLeft: token.marginXXS
    },

    '.text-danger': {
      color: token.colorError
    },

    '.h3-text': {
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      fontWeight: token.headingFontWeight
    },

    '.h4-text': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight
    },

    '.h5-text': {
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5
    },

    '.form-space-xs': {
      '.ant-form-item': {
        marginBottom: token.marginXS
      }
    },

    '.form-space-sm': {
      '.ant-form-item': {
        marginBottom: token.marginSM
      }
    },

    '.form-space-xxs': {
      '.ant-form-item': {
        marginBottom: token.marginXXS
      }
    },

    '.form-row': {
      display: 'flex',
      gap: token.sizeSM,

      '.ant-form-item': {
        flex: 1,
        overflow: 'hidden'
      }
    },

    '.item-disabled': {
      opacity: 0.4,
      cursor: 'not-allowed !important'
    },

    '.mb-0': {
      marginBottom: 0
    },

    '.ant-checkbox': {
      top: 0
    },

    '.ant-notification-top': {
      '.ant-notification-notice': {
        marginInlineEnd: 'auto'
      }
    },
    '.setting-item': {
      '.ant-web3-block-left-item': {
        paddingRight: 0
      },
      '.ant-web3-block': {
        gap: token.sizeSM,
        paddingLeft: token.paddingSM,
        paddingRight: token.paddingXXS,
        paddingTop: 6,
        paddingBottom: 6,
        flex: 1
      },
      '.ant-web3-block-right-item.ant-web3-block-right-item': {
        marginRight: 0,
        padding: 10
      }
    },

    '.ant-tooltip-placement-bottom, .ant-tooltip-placement-bottomLeft, .ant-tooltip-placement-bottomRight': {
      '.ant-tooltip-arrow': {
        top: 1
      }
    },

    '.ant-select-modal-input-content': {
      '.ant-select-modal-input-placeholder': {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        display: 'block',
        'white-space': 'nowrap'
      }
    },
    // ---layout

    '.ant-sw-sub-header-container.ant-sw-sub-header-container .ant-sw-sub-header-title-content': {
      color: token.colorTextDark1
    },

    // ---switcher

    '.ant-switch.ant-switch': {
      background: extendToken.colorBgSecondary2
    },

    '.ant-switch.ant-switch.ant-switch-checked': {
      background: token.colorPrimary
    },

    // input
    '.ant-field-container.ant-field-container.ant-field-bg-default': {
      backgroundColor: token.colorBgInput,
      borderRadius: 26
    },

    '.ant-field-container.ant-field-container.ant-field-bg-default.ant-field-with-label': {
      borderRadius: 20,
      paddingTop: token.paddingXXS,

      '.ant-field-label, .ant-field-wrapper': {
        paddingLeft: token.padding
      }
    },

    '.ant-field-container.ant-field-container .ant-field-label': {
      color: token.colorTextDark2
    },

    '.ant-field-container.ant-field-container .ant-field-wrapper .ant-field-content-wrapper .ant-field-content': {
      color: token.colorTextDark2
    },

    '.ant-field-container.ant-field-placeholder.ant-field-placeholder .ant-field-wrapper .ant-field-content-wrapper .ant-field-content': {
      color: token.colorTextDark4
    },

    '.ant-input-affix-wrapper': {
      overflow: 'hidden',

      '.ant-input': {
        overflow: 'hidden'
      },

      '.ant-input-suffix>span:last-child:empty': {
        marginRight: token.marginXS
      }
    },

    '.ant-input-container.ant-input-container': {
      color: token.colorTextDark2,
      backgroundColor: token.colorBgInput,
      borderRadius: 26,

      '&:before': {
        borderRadius: 26
      }
    },

    '.ant-input-container.ant-input-container.-has-label': {
      borderRadius: 20,
      paddingTop: token.paddingXXS,

      '&:before': {
        borderRadius: 20
      }
    },

    '.ant-input-container.ant-input-container.-has-label .ant-input-label': {
      color: token.colorTextDark2,
      paddingLeft: token.padding
    },

    '.ant-input-container.ant-input-container .ant-input-affix-wrapper': {
      paddingLeft: token.padding
    },

    '.ant-input.ant-input::placeholder': {
      color: token.colorTextDark4
    },

    '.ant-input-container.ant-input-container.-search .ant-input-prefix': {
      color: token.colorTextDark1
    },

    '.ant-input-container.ant-input-container .ant-input-suffix': {
      color: token.colorTextDark1
    },

    '.ant-input-container.ant-input-container .__input-action:hover': {
      color: token.colorTextDark1
    },

    '.ant-input-container.ant-input-container .anticon': {
      fontSize: 20
    },

    '.ant-input-container.ant-input-container .ant-input:-webkit-autofill': {
      '--webkit-autofill-border-color': 'transparent',
      borderWidth: 0,
      '--webkit-autofill-background-color': token.colorBgInput,
      '--webkit-autofill-text-color': token.colorTextDark2
    },

    '.ant-input-container.ant-input-container .ant-input:-internal-autofill-selected': {
      color: 'fieldtext !important'
    },

    '.ant-input-container.ant-input-container.-disabled .ant-input': {
      '--webkit-autofill-text-color': token.colorTextDark3,
      color: token.colorTextDark3
    },

    '.ant-input-container.ant-input-container:not(.-disabled):not(.-status-warning):not(.-status-error):not(.-status-success.-display-success-status)': {
      '&:hover': {
        '--webkit-autofill-border-color': token.colorPrimary,

        '&:before': {
          borderColor: token.colorPrimary
        }
      },

      '&:focus-within': {
        '--webkit-autofill-border-color': token.colorPrimaryActive,

        '&:before': {
          borderColor: token.colorPrimaryActive
        }
      }
    },

    // selectModal
    '.ant-select-modal-input-container.ant-select-modal-input-container .ant-select-modal-input-placeholder': {
      color: token.colorTextDark3
    },

    '.ant-select-modal-input-container.ant-select-modal-input-container .ant-select-modal-input-label': {
      color: token.colorTextDark2
    },

    '.ant-select-modal-input-container.ant-select-modal-input-container.ant-select-modal-input-bg-default': {
      backgroundColor: token.colorBgInput,
      borderRadius: 26,

      '&:before': {
        borderRadius: 26,
        pointerEvents: 'none'
      }
    },

    '.ant-select-modal-input-container.ant-select-modal-input-container.ant-select-modal-input-bg-default.ant-select-modal-input-with-label': {
      borderRadius: 20,
      paddingTop: token.paddingXXS,

      '&:before': {
        borderRadius: 20
      }
    },

    '.ant-select-modal-input-container.ant-select-modal-input-container.ant-select-modal-input-with-label': {
      '.ant-select-modal-input-label, .ant-select-modal-input-wrapper': {
        paddingLeft: token.padding
      }
    },

    '.ant-select-modal-input-container:not(.-disabled):not(.-status-warning):not(.-status-error):not(.-status-success.-display-success-status)': {
      '&:hover, &.ant-select-modal-input-focus': {
        '&::before': {
          borderColor: token.colorPrimaryActive
        }
      }
    },

    // ---setting group

    '.setting-group-container > div + div:before': {
      backgroundColor: token.colorBgDivider
    },

    '.setting-group-item .ant-background-icon': {
      backgroundColor: `${token.colorPrimary} !important`
    },

    '.setting-group-item .ant-setting-item-name.ant-setting-item-name': {
      color: token.colorTextDark1
    },

    '.setting-group-item .ant-web3-block-right-item .__right-icon': {
      color: token.colorTextDark2
    },

    '.ant-setting-item.ant-setting-item .ant-setting-item-name': {
      color: token.colorTextDark2
    },

    // ---checkbox

    '.ant-checkbox-checked.ant-checkbox-checked .ant-checkbox-inner': {
      backgroundColor: extendToken.colorBgSecondary2,
      borderColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover .ant-checkbox-checked:not(.ant-checkbox-disabled) .ant-checkbox-inner': {
      backgroundColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover .ant-checkbox-checked:not(.ant-checkbox-disabled):after': {
      borderColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper:not(.ant-checkbox-wrapper-disabled):hover .ant-checkbox-inner, .ant-checkbox.ant-checkbox:not(.ant-checkbox-disabled):hover .ant-checkbox-inner': {
      borderColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox-wrapper-checked.ant-checkbox-wrapper-checked:not(.ant-checkbox-wrapper-disabled):hover .ant-checkbox-inner, .ant-checkbox-wrapper-checked.ant-checkbox-checked:not(.ant-checkbox-disabled):hover .ant-checkbox-inner': {
      backgroundColor: extendToken.colorBgSecondary2,
      borderColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox-checked.ant-checkbox-checked:after': {
      borderColor: extendToken.colorBgSecondary2
    },

    '.ant-checkbox.ant-checkbox .ant-checkbox-inner:after': {
      borderColor: token.colorPrimary
    },

    // ---button

    // primary
    '.ant-btn-default.ant-btn-default.-schema-primary': {
      backgroundColor: extendToken.colorBgSecondary2,
      color: token.colorTextLight1,

      '&:hover': {
        backgroundColor: extendToken.colorBgHover2
      },

      '&:active': {
        backgroundColor: extendToken.colorBgSecondary2
      },

      '&:disabled': {
        opacity: 0.4
      }
    },

    // primary-2
    '.ant-btn-default.ant-btn-default.-schema-primary.-primary-2': {
      color: token.colorPrimary
    },

    // primary-3
    '.ant-btn-default.ant-btn-default.-schema-primary.-primary-3': {
      backgroundColor: token.colorPrimary,
      color: token.colorTextDark1,

      '&:hover': {
        backgroundColor: token.colorPrimaryHover
      },

      '&:active': {
        backgroundColor: token.colorPrimary
      }
    },

    // secondary
    '.ant-btn-default.ant-btn-default.-schema-secondary': {
      backgroundColor: extendToken.colorBgSecondary1,
      color: token.colorTextDark1,

      '&:before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderColor: token.colorTextDark1,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 'inherit'
      },

      '&:hover': {
        color: token.colorTextDark3,
        backgroundColor: extendToken.colorBgHover3
      },

      '&:active': {
        backgroundColor: extendToken.colorBgSecondary1,
        color: token.colorTextDark1
      },

      '&:disabled': {
        opacity: 0.4
      }
    },

    // secondary-2
    '.ant-btn-default.ant-btn-default.-schema-secondary.-secondary-2': {
      '&:before': {
        content: '""',
        display: 'none'
      }
    },

    // ghost
    '.ant-btn-ghost.ant-btn-ghost': {
      color: token.colorTextDark1,

      '&:hover': {
        color: token.colorTextDark3
      },

      '&:active': {
        color: token.colorTextDark1
      },

      '&:disabled': {
        opacity: 0.4
      }
    },

    // ---process

    '.ant-progress.ant-progress .ant-progress-bg': {
      backgroundColor: extendToken.colorBgSecondary2
    },

    // background icon

    '.background-icon': {
      '&.-primary-1': {
        color: token.colorPrimary,
        backgroundColor: extendToken.colorBgSecondary2
      },

      '&.-primary-2': {
        color: token.colorTextDark1,
        backgroundColor: token.colorPrimary
      }
    },

    '.ant-network-item.ant-network-item .ant-network-item-name': {
      color: token.colorTextDark2
    }
  });
});

function ThemeGenerator ({ children, themeConfig }: Props): React.ReactElement<Props> {
  const { token } = useToken();

  // Generate theme from config
  const theme = useMemo<Theme>(() => {
    return generateTheme(themeConfig, token);
  }, [themeConfig, token]);

  return (
    <StyledComponentThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      {children}
    </StyledComponentThemeProvider>
  );
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

const getModalContainer = () => document.getElementById('popup-container') || document.body;
const getPopupContainer = () => document.getElementById('tooltip-container') || document.body;

const TooltipContainer = styled.div({
  '& > div': {
    zIndex: 10000
  }
});

export function ThemeProvider ({ children }: ThemeProviderProps): React.ReactElement<ThemeProviderProps> {
  const dataContext = useContext(DataContext);
  const logoMaps = useSelector((state: RootState) => state.settings.logoMaps);
  const [themeReady, setThemeReady] = useState(false);
  const themeName = useSelector((state: RootState) => state.settings.theme);

  const themeConfig = useMemo(() => {
    const config = SW_THEME_CONFIGS[themeName] || SW_THEME_CONFIGS[ThemeNames.DEFAULT];

    config.logoMap = getDefaultLogoMap();

    Object.assign(config.logoMap.network, logoMaps.chainLogoMap);
    Object.assign(config.logoMap.symbol, logoMaps.assetLogoMap);

    config.token = config.generateTokens();

    return config;
  }, [logoMaps.assetLogoMap, logoMaps.chainLogoMap, themeName]);

  useEffect(() => {
    dataContext.awaitStores(['settings']).then(() => {
      setThemeReady(true);
    }).catch(console.error);
  }, [dataContext]);

  // Reduce number of re-rendering
  if (!themeReady) {
    return <></>;
  }

  return (
    <ConfigProvider
      getModalContainer={getModalContainer}
      getPopupContainer={getPopupContainer}
      theme={themeConfig}
    >
      <ThemeGenerator themeConfig={themeConfig}>
        <TooltipContainer id='tooltip-container' />
        {children}
      </ThemeGenerator>
    </ConfigProvider>
  );
}
