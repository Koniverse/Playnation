// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import TelegramBotLink, { LinkConfig, LinkResult } from '@koniverse/telegram-bot-link';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AccountPublicInfo, MythicalWallet } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { AUTHENTICATE_LINKING_BOT, AUTHENTICATE_LINKING_SERVICE, AUTHENTICATE_LINKING_TOKEN, AUTHENTICATE_LINKING_URL } from '@subwallet/extension-koni-ui/constants';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import React, { createContext, ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useSelector } from 'react-redux';

interface AuthenticationMythProviderProps {
  children?: ReactElement;
}

export interface AuthenticationMythContextProps {
  account?: AccountPublicInfo;
  isLinkedMyth: boolean;
  mythicalWallet: MythicalWallet;
  linkMythAccount: (path: string) => Promise<void>;
  checkAlreadyLinked: () => Promise<boolean>;
  onLogin: VoidFunction;
  onLogout: () => Promise<void>;
}

export const LOCAL_LOGGED_IN_PROMISE_KEY = 'mythical_logged_in_promise';
export const LOCAL_NAVIGATE_AFTER_LOGIN_KEY = 'mythical_navigate_after_login';

export const AuthenticationMythContext = createContext<AuthenticationMythContextProps>({
  isLinkedMyth: false,
  linkMythAccount: (path: string) => Promise.resolve(),
  checkAlreadyLinked: () => Promise.resolve(false),
  mythicalWallet: { address: '', balanceInMyth: '' } as MythicalWallet,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onLogin: () => {},
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
const telegramConnector = TelegramConnector.instance;

// Todo #249: Kiểm tra khả năng không chạy vào login khi nào?
export const AuthenticationMythProvider = ({ children }: AuthenticationMythProviderProps) => {
  const [account, setAccount] = useState<AccountPublicInfo>({} as AccountPublicInfo);
  const [mythicalWallet, setMythicalWallet] = useState<MythicalWallet>(bookaSDK.getMythicalWallet());
  const [linkData, setLinkData] = useState<LinkResult>();
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const authContext = useContext(AuthContext);
  const tokenData = authContext.tokenData;
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  useEffect(() => {
    // if (localStorage.getItem(LOCAL_LOGGED_IN_PROMISE_KEY) === 'logged' && !authContext.token) {
    //   authContext.logIn();
    // }

    bookaSDK.pushDebugLog('fetch_data_with_token', {'token': authContext?.token?.length}).catch(console.error);
    bookaSDK.fetchNFLRivalCardList(authContext.token).catch(console.error);
    bookaSDK.fetchMythicalBalance(authContext.token).catch(console.error);
  }, [authContext, authContext.token]);

  useEffect(() => {
    bookaSDK.pushDebugLog('init-authentication-myth', mythicalWallet).catch(console.error);
    const unsub = bookaSDK.subscribeMythicalWallet().subscribe((data) => {
      bookaSDK.pushDebugLog('update-authentication-myth', mythicalWallet).catch(console.error);
      setMythicalWallet(data);
    });

    return () => {
      unsub.unsubscribe();
    };
  }, []);

  const onLoginWithMythAccount = useCallback(() => {
    localStorage.setItem(LOCAL_LOGGED_IN_PROMISE_KEY, 'login');
    authContext.logIn();
  }, [authContext]);

  const onLoginWithTelegramAccount = useCallback(async (address: string) => {
    await bookaSDK.login(address);
  }, []);

  const onLogoutMythAccount = useCallback(() => {
    authContext.logOut();
    localStorage.setItem(LOCAL_LOGGED_IN_PROMISE_KEY, 'logout');
  }, [authContext]);

  const onSubmitMythAccount = useCallback(async () => {
    if (!tokenData?.email || !authContext.token) {
      return;
    }

    let address = '';

    try {
      await bookaSDK.fetchMythicalBalance(authContext.token);
      const mythicalBalance = bookaSDK.getMythicalWallet();

      address = mythicalBalance.address;
    } catch (error) {
      console.error(error);
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
      console.error(rs.error);
    } else if (rs.success) {
      setIsLinked(rs.success);
      setLinkData(rs.data);
    }
  }, [authContext.token, tokenData?.email]);

  const linkMythAccount = useCallback(async (path: string) => {
    if (!tokenData?.email || !authContext.token) {
      if (path) {
        localStorage.setItem(LOCAL_NAVIGATE_AFTER_LOGIN_KEY, path);
      }

      onLoginWithMythAccount();
    }

    await onSubmitMythAccount();
  }, [authContext, onLoginWithMythAccount, onSubmitMythAccount, tokenData]);

  const onLogin = useCallback(() => {
    onLoginWithMythAccount();
  }, [onLoginWithMythAccount]);

  const onLogout = useCallback(async () => {
    onLogoutMythAccount();

    return Promise.resolve();
  }, [onLogoutMythAccount]);

  const checkAlreadyLinked = useCallback(async () => {
    try {
      const linkedData = await linkSDK.findLink({
        telegram_id: startData.user?.id
      });

      if (linkedData.success && linkedData.data?.link_address) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }, []);

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

      // Todo #249: Problems may be from here
      if (linkData.link_address && !isSameAddress(bookaSDK.account?.info.address || '', linkData.link_address)) {
        bookaSDK.pushDebugLog('on_link_data', linkData).catch(console.error);
        onLoginWithTelegramAccount(linkData.link_address).catch(console.error);
      }
    } else {
      bookaSDK.pushDebugLog('link_data_not_found', linkData).catch(console.error);
    }
  }, [linkData, onLoginWithTelegramAccount]);

  useEffect(() => {
    if (startData?.user?.id) {
      linkSDK.findLink({
        telegram_id: startData.user.id
      }).then((rs) => {
        if (rs.success && tokenData?.email && authContext.token) {
          // Login is ok
          if (rs.data?.link_email === tokenData.email) {
            setIsLinked(rs.success);
            setLinkData(rs.data);
            // Login with different email
          } else {
            telegramConnector.showPopup({
              message: `Wrong email. Link Mythical account with email ${rs.data?.link_email || ''} and try again`
            }, () => {
              onLogoutMythAccount();
            });
          }
        } else {
          onSubmitMythAccount().catch(console.error);
        }
      }).catch(console.error);
    }
  }, [authContext.token, currentAccount?.address, onLogoutMythAccount, onSubmitMythAccount, tokenData]);

  const authenticationValue: AuthenticationMythContextProps = {
    account,
    isLinkedMyth: isLinked,
    mythicalWallet,
    linkMythAccount,
    checkAlreadyLinked,
    onLogin,
    onLogout
  };

  return (
    <AuthenticationMythContext.Provider value={authenticationValue}>
      {children}
    </AuthenticationMythContext.Provider>
  );
};
