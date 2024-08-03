// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar, GamePoint } from '@subwallet/extension-koni-ui/components';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  isFirst?: boolean;
  leaderboardInfo?: LeaderboardPerson;
  isPlaceholder?: boolean;
  rank?: number;
  pointIconSrc?: string;
};

const Component = ({ className, isFirst, isPlaceholder, leaderboardInfo, pointIconSrc, rank }: Props): React.ReactElement => {
  const accountName = (() => {
    if (isPlaceholder) {
      return '------';
    }

    return `${leaderboardInfo?.accountInfo.firstName || ''} ${leaderboardInfo?.accountInfo.lastName || ''}`;
  })();

  const point = (() => {
    if (isPlaceholder) {
      return '---';
    }

    return toDisplayNumber(leaderboardInfo?.point);
  })();

  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      <div className='__avatar-wrapper'>
        <GameAccountAvatar
          avatarPath={leaderboardInfo?.accountInfo.avatar}
          className={'__avatar'}
          hasBoxShadow
          isPlaceholder={isPlaceholder}
          size={'custom'}
        />

        <div className={'__rank-wrapper'}>
          <div className={'__rank'}>
            {rank || leaderboardInfo?.rank}
          </div>
        </div>
      </div>

      <div className={'__account-name'}>
        {accountName}
      </div>
      <GamePoint
        className={'__point'}
        iconSrc={pointIconSrc}
        point={point}
      />
    </div>
  );
};

const TopAccountItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__avatar-wrapper': {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: token.marginXS,
      position: 'relative',
      width: 'fit-content'
    },

    '.__rank-wrapper': {
      position: 'absolute',
      right: 0,
      bottom: 0,
      borderRadius: '100%',
      backgroundColor: extendToken.colorBgSecondary2
    },

    '.__rank': {
      position: 'absolute',
      color: token.colorPrimary,
      fontWeight: token.headingFontWeight,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      left: '50%',
      transform: 'translateX(-50%)'
    },

    '.__account-name': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextDark2,
      marginBottom: token.marginXXS,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center'
    },

    '.__point': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark4,
      justifyContent: 'center'
    },

    '&:not(.-is-first)': {
      '.__avatar': {
        borderWidth: 2,
        width: 64,
        height: 64,
        minWidth: 64,

        '.__inner': {
          borderWidth: 3
        },

        '.__avatar-image': {
          borderWidth: 2
        }
      },

      '.__rank-wrapper': {
        width: 24,
        height: 24
      },

      '.__rank': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight
      }
    },

    '&.-is-first': {
      '.__rank-wrapper': {
        width: 28,
        height: 28
      },

      '.__avatar': {
        borderWidth: 2,
        width: 92,
        height: 92,
        minWidth: 92,

        '.__inner': {
          borderWidth: 4
        },

        '.__avatar-image': {
          borderWidth: 2
        }
      },

      '.__rank': {
        fontSize: token.fontSizeLG,
        lineHeight: token.lineHeightLG
      }
    }
  };
});

export default TopAccountItem;
