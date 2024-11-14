// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MainScreenHeader, MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { AccountEditorArea } from './AccountEditorArea';
import { LinkAccountArea } from './LinkAccountArea';
import { RewardHistoryArea } from './RewardHistoryArea';
import { WalletInfoArea } from './WalletInfoArea';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/my-profile');
  const { t } = useTranslation();
  const { isLinkedMyth, linkMythAccount, onLogin, onLogout } = useContext(AuthenticationMythContext);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const [loading, setLoading] = useState(false);

  const doLinkAccount = useCallback(() => {
    currentAccount?.address && linkMythAccount(currentAccount?.address).catch(console.error);
  }, [currentAccount?.address, linkMythAccount]);

  const logIn = useCallback(() => {
    setLoading(true);
    onLogin();
  }, [onLogin]);

  const logOut = useCallback(() => {
    setLoading(true);
    onLogout().then(() => {
      console.log('Logout success');
    }).catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [onLogout]);

  return (
    <div className={className}>
      <MainScreenHeader
        rightPartNode={
          (
            <MythButton
              className={CN('login-button')}
              isLoading={loading}
              onClick={!isLinkedMyth ? logIn : logOut}
            >
              {!isLinkedMyth ? t('Log in') : t('Log out')}
            </MythButton>
          )
        }
        title={t('My profile')}
      />
      <AccountEditorArea className={'account-editor-area'} />
      <LinkAccountArea
        className={'link-account-area'}
        doLinkAccount={doLinkAccount}
        isLinked={isLinkedMyth}
        isLoading={loading}
      />
      <WalletInfoArea className={'wallet-info-area'} />
      <RewardHistoryArea className={'reward-history-area'} />
    </div>
  );
};

const MyProfile = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    backgroundColor: '#000',

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
    }
  };
});

export default MyProfile;
