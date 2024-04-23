// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {ThemeProps} from '@subwallet/extension-koni-ui/types';
import {formatInteger, formatIntegerShort} from '@subwallet/extension-koni-ui/utils';
import {Image} from '@subwallet/react-ui';
import React, {useMemo} from 'react';
import styled from 'styled-components';
import {GAME_API_HOST} from "@subwallet/extension-koni-ui/connector/booka/sdk";

type GamePointProps = ThemeProps & {
  className?: string;
  name: string;
  prefix?: string;
  point?: number;
  avatar?: string;
  isLeaderboard?: boolean;
};

function _GameAccount({avatar, className, isLeaderboard, name, point, prefix}: GamePointProps) {
  const avatarUrl = useMemo(() => {
    if (avatar) {
      return `${GAME_API_HOST}/${avatar}`;
    }
    return '/images/games/account-default-avatar.png';
  }, [avatar]);
  return <div className={className}>
    {prefix && <span className={'__prefix'}>{prefix}</span>}
    <div className={avatar ? '__avatar-item __avatar-item-radius' : '__avatar-item'}>
      <Image
        className={'__avatar'}
        shape={'circle'}
        src={avatarUrl}
        width={avatar ? 22 : 29}
      />
    </div>
    <span className={'__name'}>{name}</span>
    <span className={'__point'}>
      {isLeaderboard && point && formatIntegerShort(point)}
      <Image
        shape={'none'}
        src={'/images/games/logo-gradient.svg'}
        width={16}
      />
      {!isLeaderboard && point && formatInteger(point)}
    </span>
  </div>;
}

export const GameAccount = styled(_GameAccount)<GamePointProps>(({isLeaderboard, theme: {token}}: GamePointProps) => {
  return ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: token.paddingSM,
    backgroundColor: token.colorBgSecondary,
    borderRadius: token.borderRadius,

    '.__prefix': {
      marginRight: token.marginXXS
    },

    '.__avatar-item': {
      marginRight: token.marginXS,
    },

    '.__avatar-item-radius': {
      border: `1px solid ${token.colorPrimary}`,
      borderRadius: '50%',
      height: 29,
      width: 29,
      background: `${token.colorBgBase}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    '.__point': {
      marginLeft: token.marginXS,
      display: 'inline-flex',
      alignItems: 'center',

      img: {
        marginLeft: isLeaderboard ? token.marginXXS : 0,
        marginRight: isLeaderboard ? 0 : token.marginXXS
      }
    },

    '.__name': {
      flex: 1
    }
  });
});

export default GameAccount;
