// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type CardStatItemType = {
  name: string,
  abb: string,
  value: number,
}

type Props = ThemeProps & CardStatItemType;

function Component ({ abb,
  className = '',
  name,
  value }: Props): React.ReactElement<Props> {
  return (
    <div
      className={CN(className)}
    >
      <div className={'__item-label'}>
        <div className='__item-name'>{name}</div>
        <div className='__item-abb'>({abb})</div>
      </div>
      <div className='__item-value'>{value}</div>
    </div>
  );
}

export const StatItem = styled(Component)<Props>(({ theme: { extendToken } }: Props) => {
  return ({
    display: 'flex',
    textTransform: 'uppercase',
    alignItems: 'center',
    overflow: 'hidden',
    paddingLeft: 8,
    paddingRight: 8,

    '.__item-label': {
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      paddingRight: 8,
      alignItems: 'baseline'
    },

    '.__item-name': {
      color: extendToken.mythColorGray1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      'white-space': 'nowrap',
      fontSize: 20,
      fontWeight: 500,
      lineHeight: '24px',
      letterSpacing: -0.8,
      fontFamily: extendToken.fontDruk,
      fontStyle: 'italic',
      paddingRight: 4
    },

    '.__item-abb': {
      color: extendToken.mythColorGray2,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: 0.28,
      fontFamily: extendToken.fontBarlowCondensed,
      fontStyle: 'italic'
    },

    '.__item-value': {
      color: '#fff',
      fontSize: 32,
      fontWeight: 500,
      lineHeight: '32px',
      letterSpacing: -0.64,
      fontFamily: extendToken.fontDruk,
      fontStyle: 'italic'
    }
  });
});
