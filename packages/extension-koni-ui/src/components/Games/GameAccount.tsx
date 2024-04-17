// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Image } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type GamePointProps = ThemeProps & {
  className?: string;
  name: string;
  prefix?: string;
  point?: string;
  avatar?: string;
  pointInLeft?: boolean;
};

function _GameAccount ({ avatar, className, name, point, pointInLeft, prefix }: GamePointProps) {
  return <div className={className}>
    {prefix && <span className={'__prefix'}>{prefix}</span>}
    <Image
      className={'__avatar'}
      shape={'circle'}
      src={avatar || '/images/games/account-default-avatar.png'}
      width={29}
    />
    <span className={'__name'}>{name}</span>
    <span className={'__point'}>
      {pointInLeft && point}
      <Image
        shape={'none'}
        src={'/images/games/logo-gradient.svg'}
        width={16}
      />
      {!pointInLeft && point}
    </span>
  </div>;
}

export const GameAccount = styled(_GameAccount)<GamePointProps>(({ pointInLeft, theme: { token } }: GamePointProps) => {
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
        marginLeft: pointInLeft ? token.marginXXS : 0,
        marginRight: pointInLeft ? 0 : token.marginXXS
      }
    },

    '.__name': {
      flex: 1
    }
  });
});

export default GameAccount;
