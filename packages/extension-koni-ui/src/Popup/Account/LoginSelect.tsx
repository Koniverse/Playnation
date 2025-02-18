// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TELEGRAM_WEBAPP_LINK } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button } from '@subwallet/react-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Props } from 'react-select';
import styled from 'styled-components';

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h2>{t('Select Login Method')}</h2>
      <Button
        href={`https://t.me/${TELEGRAM_WEBAPP_LINK}`}
        size='md'
      >
        Login With Telegram
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
