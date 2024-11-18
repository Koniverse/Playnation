// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  avatarSrc?: string;
  telegramUsername?: string
  createAt?: string
};

const Component = ({ avatarSrc, className, telegramUsername }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className='__avatar-wrapper'>
        <GameAccountAvatar
          avatarSrc={avatarSrc}
          className={'__avatar-wrapper'}
        />
      </div>

      <div className='__account-name-wrapper'>
        <div className='__account-name'>
          {telegramUsername}
        </div>
      </div>

      <div className='__joined-time'>
        {t('')}
      </div>
    </div>
  );
};

export const AccountEditorArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__avatar-wrapper': {
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      width: 'fit-content',
      paddingTop: 1,
      marginBottom: 8
    },

    '.__avatar': {
      width: 96,
      height: 96,
      borderRadius: '100%'
    },

    '.__edit-button': {
      cursor: 'pointer',
      display: 'flex',
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      backgroundColor: 'transparent',
      borderRadius: '100%',
      boxShadow: '2px 2px 0px #000',
      backdropFilter: 'blur(16px)'
    },

    '.__edit-name-button': {
      backgroundImage: 'linear-gradient(75deg, rgba(54, 53, 53, 0.32) 25.94%, rgba(25, 25, 25, 0.32) 63.11%)'
    },

    '.__account-name-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      alignItems: 'center',
      marginBottom: 6,
      height: 28
    },

    '.__account-name': {
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '26px',
      letterSpacing: '-0.72px',
      textTransform: 'uppercase',
      color: token.colorWhite
    },

    '.__joined-time': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      color: extendToken.mythColorGray1,
      textAlign: 'center'
    }
  };
});
