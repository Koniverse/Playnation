// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeNames } from '@subwallet/extension-base/background/KoniTypes';
import defaultImagePlaceholder from '@subwallet/extension-koni-ui/assets/default-image-placeholder.png';
import { IconMap } from '@subwallet/extension-koni-ui/assets/logo';
import subWalletLogo from '@subwallet/extension-koni-ui/assets/sub-wallet-logo.svg';
import SwLogosMap from '@subwallet/extension-koni-ui/assets/subwallet';
import { theme as SwReactUI } from '@subwallet/react-ui';
import { ThemeConfig as _ThemeConfig, Web3LogoMap } from '@subwallet/react-ui/es/config-provider/context';
import { AliasToken as _AliasToken, GlobalToken as _GlobalToken } from '@subwallet/react-ui/es/theme/interface';
import logoMap from '@subwallet/react-ui/es/theme/themes/logoMap';

export type ThemeConfig = _ThemeConfig;
export type AliasToken = _AliasToken;
export type GlobalToken = _GlobalToken;

export interface ExtraToken {
  bodyBackgroundColor: string,
  logo: string,
  defaultImagePlaceholder: string;
  colorTextContent: string;
  colorTextHeading: string;
  colorTextDisabled: string;
  colorTextHighLight: string;
  colorBgSecondary1: string;
  colorBgSecondary2: string;
  colorBgSecondary3: string;
  colorBgHover1: string;
  colorBgHover2: string;
  colorBgHover3: string;
  colorBgGradient?: string;
  tokensScreenSuccessBackgroundColor: string,
  tokensScreenDangerBackgroundColor: string,
  tokensScreenInfoBackgroundColor: string,
}

export type Theme = {
  id: ThemeNames;
  name: string;
  token: GlobalToken;
  extendToken: ExtraToken,
  logoMap: Web3LogoMap,
};

export interface SwThemeConfig extends ThemeConfig {
  id: ThemeNames,
  name: string;
  generateTokens: () => Partial<AliasToken>;
  generateExtraTokens?: (token: AliasToken) => ExtraToken;
  generateLogoMap?: () => Web3LogoMap
}

function genDefaultExtraTokens (token: AliasToken): ExtraToken {
  return {
    bodyBackgroundColor: token.colorBgBase,
    logo: subWalletLogo,
    defaultImagePlaceholder,
    colorTextContent: token.colorTextDark3,
    colorTextHeading: token.colorTextDark1,
    colorTextDisabled: token.colorTextDark4,
    colorTextHighLight: token.colorTextDark2,
    colorBgSecondary1: '#fff',
    colorBgSecondary2: '#1F1F23',
    colorBgSecondary3: '#f0f0f0',
    colorBgHover1: 'rgba(255, 255, 255, 0.85)',
    colorBgHover2: 'rgba(31, 31, 35, 0.85)',
    colorBgHover3: 'rgba(31, 31, 35, 0.06)',
    tokensScreenSuccessBackgroundColor: 'linear-gradient(180deg, rgba(76, 234, 172, 0.1) 16.47%, rgba(217, 217, 217, 0) 94.17%)',
    tokensScreenDangerBackgroundColor: 'linear-gradient(180deg, rgba(234, 76, 76, 0.1) 16.47%, rgba(217, 217, 217, 0) 94.17%)',
    tokensScreenInfoBackgroundColor: 'linear-gradient(180deg, rgba(0, 75, 255, 0.1) 16.47%, rgba(217, 217, 217, 0) 94.17%)'
  };
}

// todo: will standardized logoMap later
export const getDefaultLogoMap = (): Web3LogoMap => ({
  ...logoMap,
  network: {
    ...IconMap,
    ...SwLogosMap
  },
  symbol: {
    ...IconMap,
    ...SwLogosMap
  },
  default: SwLogosMap.default
});

const defaultToken: Partial<AliasToken> = {
  colorSecondary: '#44D5DE',
  colorTextBase: '#1F1F23',
  colorBgBase: '#ffffff',
  colorBgSecondary: '#F0F0F0',
  colorInfo: '#9FE3FF',
  colorSuccess: '#0ACF88',
  colorWarning: '#FFEC43',
  colorError: '#FF2655',
  colorText: '#1F1F23',
  colorBgBorder: '#1F1F23',
  colorBgDivider: 'rgba(31, 31, 35, 0.12)',
  borderRadius: 8,
  colorTextDark1: '#1F1F23',
  colorTextDark2: 'rgba(31, 31, 35, 0.85)',
  colorTextDark3: 'rgba(31, 31, 35, 0.65)',
  colorTextDark4: 'rgba(31, 31, 35, 0.45)',
  colorTextDark5: 'rgba(31, 31, 35, 0.35)',
  colorTextDark6: 'rgba(31, 31, 35, 0.12)',
  colorTextDark7: 'rgba(31, 31, 35, 0.06)',
  colorTextLight1: '#ffffff',
  colorTextLight2: 'rgba(255, 255, 255, 0.85)',
  colorTextLight3: 'rgba(255, 255, 255, 0.65)',
  colorTextLight4: 'rgba(255, 255, 255, 0.45)',
  colorTextLight5: 'rgba(255, 255, 255, 0.30)',
  colorTextLight6: 'rgba(255, 255, 255, 0.20)',
  colorTextLight7: 'rgba(255, 255, 255, 0.12)',
  'gray-1': '#EEEEEE',
  'gray-2': '#DDDDDD',
  'gray-3': '#CCCCCC',
  'gray-4': '#BBBBBB',
  'gray-5': '#AAAAAA',
  'gray-6': '#999999'
};

const defaultThemeConfig = {
  algorithm: SwReactUI.defaultAlgorithm,
  components: {
    SelectModal: {
      disableAutoFocus: true
    }
  }
};

// Todo: i18n for theme name
// Implement theme from @subwallet/react-ui
export const SW_THEME_CONFIGS: Record<ThemeNames, SwThemeConfig> = {
  [ThemeNames.DEFAULT]: {
    ...defaultThemeConfig,
    id: ThemeNames.DEFAULT,
    name: 'Default',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#CBF147',
        colorPrimaryHover: '#E5FF73'
      };
    }
  },
  [ThemeNames.SKY]: {
    ...defaultThemeConfig,
    id: ThemeNames.SKY,
    name: 'Sky',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#C7F0FF',
        colorPrimaryHover: '#9FE3FF'
      };
    }
  },
  [ThemeNames.MORNING_SUNNY]: {
    ...defaultThemeConfig,
    id: ThemeNames.MORNING_SUNNY,
    name: 'Morning sunny',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#FFF8C4',
        colorPrimaryHover: '#FFF8C4'
      };
    }
  },
  [ThemeNames.SPRING]: {
    ...defaultThemeConfig,
    id: ThemeNames.SPRING,
    name: 'Spring',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#7EEC79',
        colorPrimaryHover: '#5DC75B'
      };
    }
  },
  [ThemeNames.LAVENDER]: {
    ...defaultThemeConfig,
    id: ThemeNames.LAVENDER,
    name: 'Lavender',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#BB9EFF',
        colorPrimaryHover: '#9773FB'
      };
    }
  },
  [ThemeNames.SUNNY]: {
    ...defaultThemeConfig,
    id: ThemeNames.SUNNY,
    name: 'Sunny',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#FBCE01',
        colorPrimaryHover: '#FFDF29'
      };
    }
  },
  [ThemeNames.BEGIE]: {
    ...defaultThemeConfig,
    id: ThemeNames.BEGIE,
    name: 'Begie',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#EBD7C9',
        colorPrimaryHover: '#C4AD9F'
      };
    }
  },
  [ThemeNames.CLOVE]: {
    ...defaultThemeConfig,
    id: ThemeNames.CLOVE,
    name: 'Clove',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#CBF147',
        colorPrimaryHover: '#E5FF73'
      };
    },
    generateExtraTokens: (token: AliasToken) => ({
      ...genDefaultExtraTokens(token),
      colorBgGradient: 'linear-gradient(117deg, #A2F6C1 9.05%, #CBF147 91.43%)'
    })
  },
  [ThemeNames.AURORA]: {
    ...defaultThemeConfig,
    id: ThemeNames.AURORA,
    name: 'Aurora',
    generateTokens: () => {
      return {
        ...defaultToken,
        colorPrimary: '#C7F0FF',
        colorPrimaryHover: '#9FE3FF'
      };
    },
    generateExtraTokens: (token: AliasToken) => ({
      ...genDefaultExtraTokens(token),
      colorBgGradient: 'linear-gradient(117deg, #A2F6C1 9.05%, #9FE3FF 91.43%)'
    })
  }
};

export function generateTheme ({ generateExtraTokens,
  id,
  logoMap,
  name }: SwThemeConfig, token: GlobalToken): Theme {
  return {
    id,
    name,
    token,
    extendToken: generateExtraTokens?.(token) || genDefaultExtraTokens(token),
    logoMap: logoMap || getDefaultLogoMap()
  } as Theme;
}
