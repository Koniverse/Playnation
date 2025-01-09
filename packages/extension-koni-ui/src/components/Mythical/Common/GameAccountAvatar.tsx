// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GAME_API_HOST } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  avatarSrc?: string;
  isPlaceholder?: boolean;
  partNode?: React.ReactNode;
};

function Component ({ avatarSrc, className, isPlaceholder, partNode }: Props) {
  const avatarUrl = (() => {
    if (isPlaceholder || !avatarSrc) {
      return '/images/games/default-avatar.png';
    }

    if (avatarSrc.startsWith('http')) {
      return avatarSrc;
    }

    return `${GAME_API_HOST}/${avatarSrc}`;
  })();

  return (
    <div className={CN(className)}>
      <img
        alt={'avatar'}
        className={'__avatar-image'}
        src={avatarUrl}
      />

      {partNode}
    </div>
  );
}

export const GameAccountAvatar = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    borderRadius: '100%',

    '.__avatar-image': {
      display: 'block',
      borderRadius: '100%',
      objectFit: 'cover',
      width: '100%',
      height: '100%'
    }

    // '.__avatar-image.-placeholder': {
    //   backgroundColor: extendToken.colorBgTranslucent
    // }
  });
});

export default GameAccountAvatar;
