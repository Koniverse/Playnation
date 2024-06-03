// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GamePoint } from '@subwallet/extension-koni-ui/components';
import { AccountRankType, RankInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { largeRankIconMap, rankNameMap } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatInteger } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  rank: AccountRankType | 'unknown';
  isCurrent?: boolean;
  rankInfoMap: Record<AccountRankType, RankInfo>
}

const Component: React.FC<Props> = ({ className, isCurrent, rank, rankInfoMap }: Props) => {
  return (
    <div className={CN(className, {
      '-is-current': isCurrent
    })}
    >
      <div className='__rank-logo-wrapper'>
        <img
          alt='rank'
          className='__rank-logo'
          src={largeRankIconMap[rank]}
        />

        {
          isCurrent && (
            <Icon
              className={'background-icon -size-5 -primary-1 __current-icon'}
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          )
        }
      </div>

      <div className='__rank-name'>
        {rank === 'unknown' ? '-------' : rankNameMap[rank]}
      </div>

      <GamePoint
        className={'__game-point'}
        point={rank === 'unknown' ? '---' : `${formatInteger(rankInfoMap[rank]?.minPoint || 0)}`}
      />
    </div>
  );
};

const AccountRankLevel = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    opacity: 0.4,

    '.__rank-logo-wrapper': {
      position: 'relative',
      marginBottom: token.marginXXS
    },

    '.__rank-logo': {
      width: 80,
      height: 80,
      objectFit: 'cover'
    },

    '.__current-icon': {
      position: 'absolute',
      bottom: 0,
      right: 0
    },

    '.__rank-name': {
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextDark2,
      marginBottom: 2
    },

    '.__game-point': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark4
    },

    '&.-is-current': {
      opacity: 1,

      '.__rank-logo': {
        width: 112,
        height: 112
      },

      '.__rank-name': {
        fontSize: token.fontSizeLG,
        lineHeight: token.lineHeightLG
      },

      '.__game-point': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight
      }
    }
  };
});

export default AccountRankLevel;
