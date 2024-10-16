// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type GamePointProps = {
  buttonSvgMaskId: string;
};

export function EventItemHelper ({ buttonSvgMaskId }: GamePointProps) {
  return (
    <svg
      fill='none'
      id={'event-button-mask'}
      style={{
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0
      }}
      viewBox='0 0 158 40'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <mask id={buttonSvgMaskId}>
          <path
            d='M0 0H158L155.695 32.1387L158 37.9191H111.577L101.804 40L2.93369 36.0694L0 0Z'
            fill='#FFF'
          />
        </mask>
      </defs>
    </svg>
  );
}
