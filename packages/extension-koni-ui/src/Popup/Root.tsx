// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Logo2D } from '@subwallet/extension-koni-ui/components/Logo';
import {
  AUTHENTICATE_LOGOUT_REDIRECT,
  AUTHENTICATE_REDIRECT_URI,
  AUTHORIZATION_ENDPOINT,
  CLIENT_ID,
  LOGOUT_ENDPOINT,
  TOKEN_ENDPOINT,
  VISIT_LOGIN_CTA_FLAG
} from '@subwallet/extension-koni-ui/constants';
import { AuthenticationMythProvider, LOCAL_LOGGED_IN_PROMISE_KEY, LOCAL_NAVIGATE_AFTER_LOGIN_KEY } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { SecurityContextProvider } from '@subwallet/extension-koni-ui/contexts/SecurityContext';
import { WalletModalContextProvider } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useSubscribeLanguage } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import { subscribeNotifications } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { changeHeaderLogo } from '@subwallet/react-ui';
import { NotificationProps } from '@subwallet/react-ui/es/notification/NotificationProvider';
import CN from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AuthProvider, TAuthConfig, TRefreshTokenExpiredEvent } from 'react-oauth2-code-pkce';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { BookaSdk } from '../connector/booka/sdk';
import {useLocalStorage} from "usehooks-ts";
import {VISIT_LOGIN_CTA_FLAG_DEFAULT_VALUE} from "@subwallet/extension-koni-ui/constants/localStorageDefaultValue";

changeHeaderLogo(<Logo2D />);

export const RouteState = {
  prevDifferentPathNum: -1,
  lastPathName: '/'
};

const eventsUrl = '/home/events';
const loginCTA = '/login';
const myProfileUrl = '/home/my-profile';

export const MainWrapper = styled('div')<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  overflow: 'auto',

  '.web-layout-container': {
    height: '100%'
  }
}));

function removeLoadingPlaceholder (animation: boolean): void {
  const element = document.getElementById('loading-placeholder');

  if (element) {
    if (animation) {
      // Callback after 1 second
      setTimeout(() => {
        // Add transition effect
        element.style.transition = 'opacity 0.15s ease-in-out';
        // Set opacity to 0
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
      }, 2000);

      setTimeout(() => {
        // Add transition effect
        element.parentNode?.removeChild(element);
      }, 2500);

      // Remove element
    } else {
      element.parentNode?.removeChild(element);
    }
  }
}

function DefaultRoute ({ children }: { children: React.ReactNode }): React.ReactElement {
  const location = useLocation();
  const notify = useNotification();
  const [rootLoading, setRootLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const firstRender = useRef(true);
  const [isVisitedLoginCTA, setIsVisitedLoginCTA] = useLocalStorage(VISIT_LOGIN_CTA_FLAG, VISIT_LOGIN_CTA_FLAG_DEFAULT_VALUE);

  useSubscribeLanguage();

  useEffect(() => {
    BookaSdk.instance.login()
      .catch(console.error)
      .finally(() => {
        setDataLoaded(true);
      });
  }, []);

  useEffect(() => {
    let cancel = false;
    let lastNotifyTime = new Date().getTime();

    subscribeNotifications((rs) => {
      rs.sort((a, b) => a.id - b.id)
        .forEach(({ action, id, message, title, type }) => {
          if (!cancel && id > lastNotifyTime) {
            const notificationItem: NotificationProps = { message: title || message, type };

            if (action?.url) {
              notificationItem.onClick = () => {
                window.open(action.url);
              };
            }

            notify(notificationItem);
            lastNotifyTime = id;
          }
        });
    }).catch(console.error);

    return () => {
      cancel = true;
    };
  }, [notify]);

  // Update goBack number
  useEffect(() => {
    if (location.pathname === RouteState.lastPathName) {
      RouteState.prevDifferentPathNum -= 1;
    } else {
      RouteState.prevDifferentPathNum = -1;
    }

    RouteState.lastPathName = location.pathname;
  }, [location]);

  const redirectPath = useMemo<string | null>(() => {
    const pathName = location.pathname;
    let redirectTarget: string | null = null;

    // Wait until data loaded
    if (!dataLoaded) {
      return null;
    }

    const loginPromise = localStorage.getItem(LOCAL_LOGGED_IN_PROMISE_KEY) || '';
    const pathAfterLogin = localStorage.getItem(LOCAL_NAVIGATE_AFTER_LOGIN_KEY);

    if (loginPromise === 'login') {
      redirectTarget = pathAfterLogin || myProfileUrl;
      localStorage.setItem(LOCAL_LOGGED_IN_PROMISE_KEY, 'logged');
    } else if (loginPromise === 'logout') {
      localStorage.removeItem(LOCAL_LOGGED_IN_PROMISE_KEY);
      localStorage.removeItem(LOCAL_NAVIGATE_AFTER_LOGIN_KEY);
      redirectTarget = pathAfterLogin || myProfileUrl;
    }

    // Remove loading on finished first compute
    firstRender.current && setRootLoading((val) => {
      if (val) {
        removeLoadingPlaceholder(true);
        firstRender.current = false;
      }

      return false;
    });

    // Check if account is newly created and shoe login CTA
    if (pathName === '/' && !redirectTarget) {
      let shouldShowLoginCTA = !isVisitedLoginCTA;
      const userCreated = BookaSdk.instance.account?.info?.createdAt
      if (userCreated && !isVisitedLoginCTA) {
        try  {
          const createTime = new Date(userCreated).getTime();
          const now = new Date().getTime();

          // Show only in 10 minutes after account created
          shouldShowLoginCTA = ((now - createTime) < 3600000) && !isVisitedLoginCTA;
          if (!shouldShowLoginCTA) {
            setIsVisitedLoginCTA(true);
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (shouldShowLoginCTA) {
        redirectTarget = loginCTA;
      } else {
        redirectTarget = eventsUrl;
      }
    }

    if (redirectTarget && redirectTarget !== pathName) {
      return redirectTarget;
    } else {
      return null;
    }
  }, [location.pathname, dataLoaded]);

  if (rootLoading || redirectPath) {
    return <>{redirectPath && <Navigate to={redirectPath} />}</>;
  } else {
    return <MainWrapper className={CN('main-page-container')}>
      {children}
    </MainWrapper>;
  }
}

// Implement WalletModalContext in Root component to make it available for all children and can use react-router-dom and ModalContextProvider
const authConfig: TAuthConfig = {
  clientId: CLIENT_ID,
  authorizationEndpoint: AUTHORIZATION_ENDPOINT,
  tokenEndpoint: TOKEN_ENDPOINT,
  redirectUri: AUTHENTICATE_REDIRECT_URI,
  logoutEndpoint: LOGOUT_ENDPOINT,
  logoutRedirect: AUTHENTICATE_LOGOUT_REDIRECT,
  autoLogin: false,
  onRefreshTokenExpire: (event: TRefreshTokenExpiredEvent) => event.logIn(undefined, undefined, 'popup')
};

export function Root (): React.ReactElement {
  return (
    <AuthProvider authConfig={authConfig}>
      <AuthenticationMythProvider>
        <SecurityContextProvider>
          <WalletModalContextProvider>
            <DefaultRoute>
              <Outlet />
            </DefaultRoute>
          </WalletModalContextProvider>
        </SecurityContextProvider>
      </AuthenticationMythProvider>
    </AuthProvider>
  );
}
