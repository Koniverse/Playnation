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
  info?: string;
  avatar?: string;
};

function _GameAccount ({ avatar, className, info, name, prefix }: GamePointProps) {
  return <div className={className}>
    {prefix && <span className={'__prefix'}>{prefix}</span>}
    <Image
      className={'__avatar'}
      shape={'circle'}
      src={avatar || '/images/games/account-default-avatar.png'}
      width={29}
    />
    <span className={'__name'}>{name}</span>
    <span className={'__info'}>{info}</span>
  </div>;
}

export const GameAccount = styled(_GameAccount)<GamePointProps>(({ theme: { token } }: GamePointProps) => {
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

    '.__name': {
      flex: 1
    }
  });
});

export default GameAccount;
