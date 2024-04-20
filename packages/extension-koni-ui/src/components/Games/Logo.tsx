// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Image } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type GameLogoProps = {
  className?: string;
  size?: number;
}

type GamePointProps = ThemeProps & {
  className?: string;
  preText?: string;
  text: string;
  size?: number;
};

export function GameLogo ({ className, size = 24 }: GameLogoProps) {
  return <Image
    className={className}
    shape={'square'}
    src={'/images/games/logo.svg'}
    width={size}
  />;
}

function _GamePoint ({ className, size = 16, text, preText }: GamePointProps) {
  return <div className={className}>
    {preText && <span className={'pre-text'}>{preText}</span>}
    <Image
      className={'game-point' + (className ? ` ${className}` : '')}
      shape={'none'}
      src={'/images/games/logo-gradient.svg'}
      width={size}
    />
    <span>{text}</span>
  </div>;
}

export const GamePoint = styled(_GamePoint)<GamePointProps>(({ theme: { token } }: GamePointProps) => {
  return ({
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: token.colorTextDark4,

    '.pre-text': {
      marginRight: '3px'
    },

    '.game-point': {
      marginRight: '3px'
    }
  });
});