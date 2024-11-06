// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';

import { AccountEditorArea } from './AccountEditorArea';
import { LinkAccountArea } from './LinkAccountArea';
import { RewardHistoryArea } from './RewardHistoryArea';
import { WalletInfoArea } from './WalletInfoArea';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/my-profile');

  const { isLinkedMyth, linkMythAccount } = useContext(AuthenticationMythContext);

  const doLinkAccount = useCallback(() => {
    linkMythAccount().catch(console.error);
  }, [linkMythAccount]);

  return (
    <div className={className}>
      <MainScreenHeader title={'123213213'} />
      <AccountEditorArea className={'account-editor-area'} />
      <LinkAccountArea
        className={'link-account-area'}
        doLinkAccount={doLinkAccount}
        isLinked={isLinkedMyth}
      />
      <WalletInfoArea className={'wallet-info-area'} />
      <RewardHistoryArea className={'reward-history-area'} />
    </div>
  );
};

const MyProfile = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    backgroundColor: '#000',

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
