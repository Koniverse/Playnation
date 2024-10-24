// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import React from 'react';
import styled from 'styled-components';

export type RewardHistoryItemType = {
  ordinal: number;
  name: string,
  date: string,
  tokenValue: string,
};

type Props = ThemeProps & RewardHistoryItemType;

const Component = ({ className, date,
  name,
  ordinal,
  tokenValue }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <div className='__item-inner'>
        <div className='__item-left-part __ordinal'>{ordinal}</div>
        <div className='__item-center-part __name'>{name}</div>
        <div className='__item-right-part'>
          <div className='__date'>{date}</div>
          <div className='__token-value-wrapper'>
            <span className='__token-value'>+{toDisplayNumber(tokenValue)}&nbsp;</span>
            <span className='__token-symbol'>MYTH</span>
          </div>
        </div>
      </div>
      <div className='__item-background'></div>
    </div>
  );
};

export const RewardHistoryItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    position: 'relative',

    '.__item-inner': {
      minHeight: 54,
      paddingLeft: 16,
      paddingRight: 16,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    },

    '.__ordinal': {
      minWidth: 46,
      marginLeft: 4,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      color: extendToken.mythColorGray2
    },

    '.__name': {
      flex: 1,
      color: token.colorWhite,
      flexShrink: 1,
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      marginLeft: 4,

      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: '0.32px'
    },

    '.__item-right-part': {
      minWidth: 72,
      textAlign: 'right'
    },

    '.__date': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '12px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'normal',
      letterSpacing: '0.24px',
      color: extendToken.mythColorGray1,
      marginBottom: 4
    },

    '.__token-value-wrapper': {
      display: 'inline-flex',
      alignItems: 'baseline'
    },

    '.__token-value': {
      fontFamily: extendToken.fontDruk,
      fontSize: '16px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: '-0.16px',
      color: token.colorWhite
    },

    '.__token-symbol': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '20px',
      color: extendToken.mythColorGray2
    },

    '.__item-background': {
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      filter: 'drop-shadow(2px 2px 0px #000)',

      '&:before': {
        content: '""',
        position: 'absolute',
        display: 'block',
        inset: 0,
        maskImage: 'url(/images/mythical/game-account-item-background.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left',
        backgroundImage: 'linear-gradient(75deg, rgba(54, 53, 53, 0.32) 25.94%, rgba(25, 25, 25, 0.32) 63.11%)',
        backdropFilter: 'blur(16px)'
      }
    }
  };
});
