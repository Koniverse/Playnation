// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type TopAccountItemType = {
  isFirst?: boolean;
  rank: number;
  point?: number;
  name?: string;
  avatarSrc?: string;
  tokenValue?: number;
}

type Props = ThemeProps & TopAccountItemType & {
  isLoading?: boolean
};

const Component = ({ avatarSrc, className, isFirst, isLoading, name = '---', point = 0, rank, tokenValue = 0 }: Props): React.ReactElement => {
  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      <GameAccountAvatar
        avatarSrc={avatarSrc}
        className={'__avatar-wrapper'}
        isPlaceholder={isLoading}
        partNode={(
          <div className='__rank'>
            {rank}
          </div>
        )}
      />

      <div className={CN('__account-name')}>
        {name}
      </div>

      <div className='__point'>
        {`${toDisplayNumber(point)}`}
      </div>

      <div className='__token-Value-wrapper'>
        <div className='__token-Value'>
          {`+${toDisplayNumber(tokenValue)} Myth`}
        </div>
      </div>

    </div>
  );
};

const TopAccountItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__avatar-wrapper': {
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      width: 'fit-content',
      marginBottom: 4
    },

    '.__avatar-image': {
      borderRadius: '100%'
    },

    '.__rank': {
      borderRadius: '100%',
      backgroundColor: token.colorPrimary,
      fontFamily: extendToken.fontBarlowCondensed,
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      top: 0
    },

    '.__account-name': {
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontWeight: 500,
      color: token.colorWhite,
      marginBottom: 3
    },

    '.__point': {
      color: token.colorPrimary,
      textAlign: 'center',
      fontFamily: extendToken.fontDruk,
      fontStyle: 'italic',
      fontWeight: 500,
      marginBottom: 6
    },

    '.__token-Value-wrapper': {
      display: 'flex',
      justifyContent: 'center'
    },

    '.__token-Value': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      borderRadius: 100,
      backgroundImage: 'linear-gradient(75deg, #363535 25.94%, #191919 63.11%)',
      padding: '4px 12px'
    },

    '&:not(.-is-first)': {
      '.__avatar-wrapper': {
        paddingTop: 3.5
      },

      '.__rank': {
        width: 18,
        height: 18,
        fontSize: '12px',
        lineHeight: '16px'
      },

      '.__avatar-image': {
        width: 57,
        height: 57
      },

      '.__account-name': {
        fontSize: '14px',
        lineHeight: '16px',
        letterSpacing: '0.28px'
      },

      '.__point': {
        fontSize: '16px',
        lineHeight: '18px',
        letterSpacing: '-0.16px'
      }
    },

    '&.-is-first': {
      '.__avatar-wrapper': {
        paddingTop: 3
      },

      '.__rank': {
        width: 24,
        height: 24,
        fontSize: '14px',
        lineHeight: '20px'
      },

      '.__avatar-image': {
        width: 74,
        height: 74
      },

      '.__account-name': {
        fontSize: '16px',
        lineHeight: '20px',
        letterSpacing: '0.32px'
      },

      '.__point': {
        fontSize: '20px',
        lineHeight: '22px',
        letterSpacing: '-0.6px'
      }
    }
  };
});

export default TopAccountItem;
