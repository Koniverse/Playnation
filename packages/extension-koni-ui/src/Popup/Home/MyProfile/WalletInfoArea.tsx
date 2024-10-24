// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className='__info-item'>
        <div className='__info-label'>{t('Your Wallet')}</div>
        <div className='__info-value __wallet-address-wrapper'>
          <div className='__wallet-address'>XG35NNH7TR</div>

          <button className={'__copy-button'}>
            <svg
              fill='none'
              height='20'
              viewBox='0 0 20 20'
              width='20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M5.83317 5.00008V2.50008C5.83317 2.03985 6.20627 1.66675 6.6665 1.66675H16.6665C17.1267 1.66675 17.4998 2.03985 17.4998 2.50008V14.1667C17.4998 14.627 17.1267 15.0001 16.6665 15.0001H14.1665V17.4993C14.1665 17.96 13.7916 18.3334 13.3275 18.3334H3.33888C2.87549 18.3334 2.5 17.9629 2.5 17.4993L2.50217 5.83414C2.50225 5.37351 2.8772 5.00008 3.34118 5.00008H5.83317ZM7.49983 5.00008H14.1665V13.3334H15.8332V3.33341H7.49983V5.00008Z'
                fill='#28C89F'
              />
            </svg>
          </button>
        </div>
      </div>

      <div className='__info-item'>
        <div className='__info-label'>{t('Current Balance')}</div>
        <div className='__info-value __token-value-wrapper'>
          <span className={'__token-value'}>{toDisplayNumber(7712762)}</span>
          <span className={'__token-symbol'}>&nbsp;Myth</span>
        </div>
      </div>
    </div>
  );
};

export const WalletInfoArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    minHeight: 156,
    backgroundImage: 'url(/images/mythical/my-profile-wallet-info-background.png)',
    backgroundPosition: 'top center',
    backgroundSize: 'calc(100% + 10px) 100%',

    paddingTop: 21,
    paddingLeft: 24,
    paddingRight: 24,

    '.__info-label': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      color: extendToken.mythColorGray1
    },

    '.__info-value': {
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 700,
      lineHeight: '24px',
      textTransform: 'uppercase',
      color: token.colorWhite
    },

    '.__wallet-address-wrapper': {
      display: 'flex',
      alignItems: 'center',
      marginTop: 1,
      marginBottom: 6
    },

    '.__wallet-address': {
      color: token.colorWhite,
      flexShrink: 1,
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },

    '.__copy-button': {
      cursor: 'pointer',
      display: 'flex',
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      backgroundColor: 'transparent'
    },

    '.__token-value-wrapper': {
      marginTop: 3
    },

    '.__token-value': {

    },

    '.__token-symbol': {
      color: extendToken.mythColorGray1,
      fontWeight: 500
    }
  };
});
