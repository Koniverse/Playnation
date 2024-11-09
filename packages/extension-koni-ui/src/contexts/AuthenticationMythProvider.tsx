// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import TelegramBotLink, { LinkConfig, LinkResult } from '@koniverse/telegram-bot-link';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AccountPublicInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { AUTHENTICATE_LINKING_BOT, AUTHENTICATE_LINKING_SERVICE, AUTHENTICATE_LINKING_TOKEN, AUTHENTICATE_LINKING_URL } from '@subwallet/extension-koni-ui/constants';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import React, { createContext, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { TTokenData } from 'react-oauth2-code-pkce/dist/types';
import { useSelector } from 'react-redux';

interface AuthenticationMythProviderProps {
  children?: ReactElement;
}

export interface AuthenticationMythContextProps {
  account?: AccountPublicInfo;
  isLinkedMyth: boolean;
  linkMythAccount: (address: string) => Promise<void>;
  onLogin: (address: string, isWithoutMyth?: boolean) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const AuthenticationMythContext = createContext<AuthenticationMythContextProps>({
  isLinkedMyth: false,
  linkMythAccount: () => Promise.resolve(),
  onLogin: () => Promise.resolve(),
  onLogout: () => Promise.resolve()
});

const config = {
  url: AUTHENTICATE_LINKING_URL,
  service: AUTHENTICATE_LINKING_SERVICE,
  bot: AUTHENTICATE_LINKING_BOT,
  token: AUTHENTICATE_LINKING_TOKEN
};

const bookaSDK = BookaSdk.instance;
const initData = Telegram.WebApp.initData || process.env.DEFAULT_INIT_DATA || '0x0';
const startData = Telegram.WebApp.initDataUnsafe;

const linkSDK = new TelegramBotLink(config as LinkConfig);

export const AuthenticationMythProvider = ({ children }: AuthenticationMythProviderProps) => {
  const [account, setAccount] = useState<AccountPublicInfo>({} as AccountPublicInfo);
  const [tokenData, setTokenData] = useState<TTokenData>();
  const [linkData, setLinkData] = useState<LinkResult>();
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const authContext = useContext(AuthContext);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const onLoginWithMythAccount = useCallback(() => {
    authContext.logIn();
  }, [authContext]);

  const onLoginWithTelegramAccount = useCallback(async (address: string) => {
    await bookaSDK.login(address);
  }, []);

  const onLogoutMythAccount = useCallback(() => {
    authContext.logOut();
  }, [authContext]);

  const onSubmitMythAccount = useCallback(async (address: string) => {
    if (!tokenData?.email || !authContext.token) {
      return;
    }

    const rs = await linkSDK.submitLink({
      initData,
      linkInfo: {
        email: tokenData?.email as string,
        token: authContext.token,
        address
      }
    });

    if (rs.error) {
      Telegram.WebApp.showAlert(rs.error);
    } else if (rs.success) {
      setIsLinked(rs.success);
      setLinkData(rs.data);
    }
  }, [authContext.token, tokenData?.email]);

  const linkMythAccount = useCallback(async (address: string) => {
    if (!tokenData?.email || !authContext.token) {
      onLoginWithMythAccount();
    }

    await onSubmitMythAccount(address);
  }, [authContext.token, onLoginWithMythAccount, onSubmitMythAccount, tokenData?.email]);

  const onLogin = useCallback(async (address: string, isWithoutMyth = false) => {
    if (!isWithoutMyth) {
      onLoginWithMythAccount();
      await linkMythAccount(address);
    } else {
      await onLoginWithTelegramAccount(address);
    }
  }, [linkMythAccount, onLoginWithMythAccount, onLoginWithTelegramAccount]);

  const onLogout = useCallback(async () => {
    onLogoutMythAccount();

    return Promise.resolve();
  }, [onLogoutMythAccount]);

  useEffect(() => {
    setTokenData(authContext.tokenData);
  }, [authContext.tokenData]);

  useEffect(() => {
    if (linkData) {
      setAccount((prev) => {
        return {
          ...prev,
          address: linkData.link_address,
          email: linkData.link_email,
          id: linkData.telegram_id,
          signature: linkData.link_signature,
          uid: linkData.link_uid
        };
      });

      if (linkData.link_address && !isSameAddress(bookaSDK.account?.info.address || '', linkData.link_address)) {
        onLoginWithTelegramAccount(linkData.link_address).catch(console.error);
      }
    }
  }, [linkData, onLoginWithTelegramAccount]);

  useEffect(() => {
    if (startData?.user?.id) {
      linkSDK.findLink({
        telegram_id: startData.user.id
      }).then((rs) => {
        if (rs.success) {
          setIsLinked(rs.success);
          setLinkData(rs.data);
        } else {
          onSubmitMythAccount(currentAccount?.address || '0x0').catch(console.error);
        }
      }).catch(console.error);
    }
  }, [authContext.token, currentAccount?.address, onLoginWithTelegramAccount, onSubmitMythAccount, tokenData?.email]);

  const authenticationValue: AuthenticationMythContextProps = {
    account,
    isLinkedMyth: isLinked,
    linkMythAccount,
    onLogin,
    onLogout
  };

  return (
    <AuthenticationMythContext.Provider value={authenticationValue}>
      {children}
    </AuthenticationMythContext.Provider>
  );
};
