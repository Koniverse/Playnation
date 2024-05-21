// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GAME_API_HOST } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & LeaderboardPerson & {
  isFirst?: boolean;
};

const Component = ({ accountInfo, className, isFirst, point, rank }: Props): React.ReactElement => {
  const avatarUrl = useMemo(() => {
    if (accountInfo.avatar) {
      return `${GAME_API_HOST}/${accountInfo.avatar}`;
    }

    return '/images/games/default-avatar.png';
  }, [accountInfo.avatar]);

  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      <div className={'__rank'}>
        {rank}
      </div>

      <div className='__avatar'>
        <img
          alt={'avatar'}
          className={'__avatar-image'}
          src={avatarUrl}
        />
      </div>

      <div className={'__account-name'}>
        {`${accountInfo.firstName || ''} ${accountInfo.lastName || ''}`}
      </div>
      <div className={'__point'}>
        {formatIntegerShort(point)}
      </div>
    </div>
  );
};

export const TopAccountItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__rank': {
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      marginBottom: token.marginXS,
      textAlign: 'center'
    },

    '.__avatar': {
      width: 80,
      height: 80,
      minWidth: 80,
      border: `2px solid ${token.colorBgBorder}`,
      padding: 6,
      borderRadius: '100%',
      boxShadow: '2px 4px 0px 0px rgba(31, 31, 35, 0.40)',
      backgroundColor: token.colorWhite,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: token.marginXS
    },

    '.__avatar-image': {
      border: `2px solid ${token.colorBgBorder}`,
      display: 'block',
      borderRadius: '100%',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },

    '&.-is-first ': {
      '.__rank': {
        fontSize: token.fontSizeHeading4,
        lineHeight: token.lineHeightHeading4
      },

      '.__avatar': {
        width: 112,
        height: 112,
        minWidth: 112,
        padding: 8
      }
    },

    '.__account-name': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
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
      textAlign: 'center'
    }
  };
});
