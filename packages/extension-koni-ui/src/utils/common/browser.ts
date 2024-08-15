// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SELECTED_ACCOUNT_TYPE } from '@subwallet/extension-koni-ui/constants';
import Bowser from 'bowser';

import { KeypairType } from '@polkadot/util-crypto/types';

export const openInNewTab = (url: string) => {
  return () => {
    window.open(url, '_blank');
  };
};

export const BOWER_PARSER = Bowser.getParser(window.navigator.userAgent);

export const getBrowserName = (): string => {
  return (localStorage.getItem('browserInfo') || BOWER_PARSER.getBrowserName());
};

export const isMobile = (): boolean => {
  return BOWER_PARSER.getPlatformType(true) === 'mobile';
};

export const isAndroid = (): boolean => {
  return BOWER_PARSER.getOSName(true) === 'android';
};

export const isIos = (): boolean => {
  return BOWER_PARSER.getOSName(true) === 'ios';
};

export const isDesktop = (): boolean => {
  return ['window', 'macos', 'linux'].includes(BOWER_PARSER.getOSName(true));
};

export const isFirefox = (): boolean => {
  return getBrowserName().toLowerCase() === 'firefox';
};

export const getVersionBrowser = (): string[] => {
  const browser = BOWER_PARSER;
  const browserName = browser.getBrowserName();
  const version = browser.getBrowserVersion();

  return [browserName, version];
};

export const setSelectedAccountTypes = (keypairTypes: KeypairType[]) => {
  localStorage.setItem(SELECTED_ACCOUNT_TYPE, JSON.stringify(keypairTypes));
};

export const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};
