// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, EmptyListContent, MainScreenHeader, MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { LINK_NFL_APP_DOWNLOAD } from '@subwallet/extension-koni-ui/constants';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { AccountEditorArea } from './AccountEditorArea';
import { LinkAccountArea } from './LinkAccountArea';
import { RewardHistoryArea } from './RewardHistoryArea';
import { WalletInfoArea } from './WalletInfoArea';

type Props = ThemeProps;
const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/my-profile');
  const { t } = useTranslation();
  const { isLinkedMyth, linkMythAccount, mythicalWallet, onLogin, onLogout } = useContext(AuthenticationMythContext);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const [loading, setLoading] = useState(false);
  const [mineAccount, setMineAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const doLinkAccount = useCallback(() => {
    currentAccount?.address && linkMythAccount().catch(console.error);
  }, [currentAccount?.address, linkMythAccount]);

  const openAppStoreLink = useCallback(() => {
    openInNewTab(LINK_NFL_APP_DOWNLOAD)();
  }, []);

  // @ts-ignore
  const logIn = useCallback(() => {
    setLoading(true);
    onLogin();
  }, [onLogin]);

  // @ts-ignore
  const logOut = useCallback(() => {
    setLoading(true);
    onLogout().then(() => {
      console.log('Logout success');
    }).catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [onLogout]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setMineAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>
      <MainScreenHeader
        className={'profile-header'}
        // rightPartNode={
        //   (
        //     <MythButton
        //       className={CN('login-button')}
        //       isLoading={loading}
        //       onClick={!isLinkedMyth ? logIn : logOut}
        //     >
        //       {!isLinkedMyth ? t('Log in') : t('Log out')}
        //     </MythButton>
        //   )
        // }
        title={t('My profile')}
      />
      <div className={'__profile-container'}>
        <AccountEditorArea
          avatarSrc={mineAccount?.info.photoUrl}
          className={'account-editor-area'}
          telegramUsername={mineAccount?.info.telegramUsername}
        />
        <LinkAccountArea
          className={'link-account-area'}
          doLinkAccount={doLinkAccount}
          isLinked={isLinkedMyth}
          isLoading={loading}
        />
        {isLinkedMyth
          ? (
            mythicalWallet?.address && <>
              <WalletInfoArea className={'wallet-info-area'} />
              <RewardHistoryArea className={'reward-history-area'} />
            </>
          )
          : (
            <>
              <div className={'empty-list-wrapper'}>
                <EmptyListContent
                  className={'empty-rewards-content'}
                  content={t(' Link your Mythical account to view rewards')}
                  title={t('oops! no rewards yet ')}
                />
                <MythButton
                  className={'__link-now-button'}
                  isLoading={loading}
                  onClick={doLinkAccount}
                >
                  {t('LINK NOW')}
                </MythButton>
              </div>
            </>
          )}
      </div>
      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        onAction={openAppStoreLink}
        subtitle={'Download NFL Rivals App'}
        title={'Want to take your profile to the next level?'}
      />
      <div className={'__padding-area'}></div>
    </div>
  );
};

const MyProfile = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '.__profile-container': {
      flex: 1,
      overflow: 'auto'
    },
    '.__padding-area': {
      position: 'fixed',
      zIndex: 0,
      height: 21,
      width: '100%',
      bottom: 85,
      backgroundColor: '#000'
    },
    '.login-button': {
      paddingLeft: 16,
      paddingRight: 16,
      height: 40,

      '.__button-content': {
        color: token.colorWhite
      }
    },

    '.account-editor-area': {
      marginBottom: 20
    },

    '.link-account-area': {
      marginBottom: 24
    },

    '.wallet-info-area': {
      marginBottom: 14
    },

    '.empty-list-wrapper': {
      paddingTop: 121,
      paddingBottom: 175
    },

    '.call-to-action': {
      marginBottom: 12,
      zIndex: 10
    },

    '.__link-now-button': {
      minWidth: 159,
      height: 40,
      paddingLeft: 4,
      paddingRight: 2,
      marginTop: 17,
      marginLeft: 'auto',
      marginRight: 'auto',

      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        // filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/call-to-action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    }
  };
});

export default MyProfile;
