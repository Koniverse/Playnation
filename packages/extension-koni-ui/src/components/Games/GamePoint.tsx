// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type GamePointProps = ThemeProps & {
  point: string;
  size?: number;
};

function Component ({ className, point, size = 16 }: GamePointProps) {
  return (
    <div className={className}>
      <span className={'__point-value'}>{point}</span>

      <img
        alt={'token'}
        className='__point-token'
        height={size}
        src={DefaultLogosMap.token_icon}
        width={size}
      />
    </div>
  );
}

const GamePoint = styled(Component)<GamePointProps>(({ theme: { token } }: GamePointProps) => {
  return ({
    display: 'flex',
    gap: token.sizeXXS,
    alignItems: 'center',
    color: token.colorTextDark3,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight
  });
});

export default GamePoint;
