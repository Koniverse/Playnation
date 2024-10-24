// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const editIcon = (
    <svg
      fill='none'
      height='18'
      viewBox='0 0 18 18'
      width='18'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M7.43198 14.2475H16.25V15.7475H2.75V12.5654L10.1746 5.14085L13.3566 8.32285L7.43198 14.2475ZM11.2353 4.08019L12.8263 2.4892C13.1192 2.19631 13.594 2.19631 13.8869 2.4892L16.0083 4.61052C16.3012 4.90341 16.3012 5.37829 16.0083 5.67118L14.4172 7.26217L11.2353 4.08019Z'
        fill='#28C89F'
      />
    </svg>
  );

  return (
    <div className={className}>
      <div className='__avatar-wrapper'>
        <img
          alt='account'
          className={'__avatar'}
          src={'/images/mythical/user-image.png'}
        />

        <button className={'__edit-button __edit-avatar-button'}>
          {editIcon}
        </button>
      </div>

      <div className='__account-name-wrapper'>
        <div className='__account-name'>
          @john_doe01
        </div>

        <button className={'__edit-button __edit-name-button'}>
          {editIcon}
        </button>
      </div>

      <div className='__joined-time'>
        {t('Joined 2 days ago')}
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

    '.__edit-avatar-button': {
      position: 'absolute',
      backgroundImage: 'linear-gradient(75deg, rgba(54, 53, 53, 0.32) 25.94%, rgba(25, 25, 25, 0.32) 63.11%)',
      top: -1,
      right: -1
    },

    '.__edit-name-button': {
      backgroundImage: 'linear-gradient(75deg, rgba(54, 53, 53, 0.32) 25.94%, rgba(25, 25, 25, 0.32) 63.11%)'
    },

    '.__account-name-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      alignItems: 'center',
      marginBottom: 6
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
