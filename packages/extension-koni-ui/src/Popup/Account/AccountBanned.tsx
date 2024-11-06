// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SUPPORT_URL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Props } from 'react-select';
import styled from 'styled-components';

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h1>{t('Account suspended')}</h1>
      <p>{t('Your account has been suspended due to unusual activities.')}</p>
      <p>{t('If you think this is a mistake, contact our support team')} <a href={SUPPORT_URL}>Koni Story Suport</a> </p>
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

    h1: {
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
