// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type GamePointProps = ThemeProps & {
  className?: string;
  name?: string;
  prefix?: string;
  point?: number;
  avatar?: string;
  isPlaceholder?: boolean;
};

function Component ({ avatar, className, isPlaceholder, name, point, prefix }: GamePointProps) {
  return (
    <div className={CN(className)}>
      {prefix && <span className={'__prefix'}>{prefix}</span>}
      <GameAccountAvatar
        avatarPath={avatar}
        className={'__avatar'}
        isPlaceholder={isPlaceholder}
      />
      <span className={'__name'}>{isPlaceholder ? '------' : name}</span>
      <span className={'__point'}>
        {isPlaceholder ? '---' : formatIntegerShort(point)}
      </span>
    </div>
  );
}

export const GameAccount = styled(Component)<GamePointProps>(({ theme: { token } }: GamePointProps) => {
  return ({
    display: 'flex',
    alignItems: 'center',
    backgroundColor: token.colorBgSecondary,
    borderRadius: 40,
    paddingLeft: 20,
    paddingRight: 20,
    minHeight: 52,
    height: 52,
    color: token.colorTextDark2,

    '.__prefix': {
      marginRight: token.marginXXS,
      minWidth: 24,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__avatar': {
      marginRight: token.marginXS
    },

    '.__name': {
      flex: 1,
      marginRight: token.marginXS,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.headingFontWeight
    },

    '.__point': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    }
  });
});

export default GameAccount;
