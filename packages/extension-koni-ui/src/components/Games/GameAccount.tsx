// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatInteger, formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import { Image } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type GamePointProps = ThemeProps & {
  className?: string;
  name: string;
  prefix?: string;
  point?: number;
  avatar?: string;
  isLeaderboard?: boolean;
};

function _GameAccount ({ avatar, className, isLeaderboard, name, point, prefix }: GamePointProps) {
  return <div className={className}>
    {prefix && <span className={'__prefix'}>{prefix}</span>}
    <Image
      className={'__avatar'}
      shape={'square'}
      src={avatar || '/images/games/account-default-avatar.png'}
      width={29}
    />
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

export const GameAccount = styled(_GameAccount)<GamePointProps>(({ isLeaderboard, theme: { token } }: GamePointProps) => {
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

    '.__avatar': {
      marginRight: token.marginXS
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
