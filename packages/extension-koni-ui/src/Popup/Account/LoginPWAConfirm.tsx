// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Props } from 'react-select';
import styled from 'styled-components';

const sdk = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [account, setAccount] = useState<BookaAccount | undefined>();

  useEffect(() => {
    sdk.subscribeAccount().subscribe((account) => {
      setAccount(account);
    });
  }, []);

  return (
    <div className={className}>
      <h2>{t('Confirm Login')}</h2>
      <Button
        href={`https://pwa.story-protocol-odyssey.pages.dev?otp=${account?.otp || ''}`}
        size='md'
        target={'_blank'}
      >
        Login with account {account?.info?.telegramUsername || ''}
      </Button>
    </div>
  );
};

const AccountBanned = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: token.colorBgContainer,
    color: token.colorText,

    h2: {
      fontSize: token.fontSizeLG,
      fontWeight: 'bold',
      marginBottom: token.marginMD
    },
    p: {
      fontSize: 14,
      marginBottom: token.marginSM,
      textAlign: 'center',
      maxWidth: '80%'
    }
  };
});

export default AccountBanned;
