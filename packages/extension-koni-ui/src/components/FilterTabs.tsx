// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback } from 'react';
import styled from 'styled-components';

export type FilterTabItemType = {
  label: string,
  value: string,
}

type Props = ThemeProps & {
  items: FilterTabItemType[],
  selectedItem: string,
  onSelect: (value: string) => void,
};

function Component ({ className = '', items, onSelect, selectedItem }: Props): React.ReactElement<Props> {
  const onClick = useCallback((value: string) => {
    return () => {
      onSelect(value);
    };
  }, [onSelect]);

  return (
    <div className={className}>
      {
        items.map((i) => (
          <div
            className={CN('__tab-item', {
              '-active': i.value === selectedItem
            })}
            key={i.value}
            onClick={onClick(i.value)}
            tabIndex={-1}
          >
            <div className={'__tab-item-label'}>
              {i.label}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export const FilterTabs = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    display: 'flex',
    gap: token.size,
    paddingLeft: 16,
    paddingRight: 16,

    '.__tab-item': {
      cursor: 'pointer',
      color: '#fff',
      transition: `color ${token.motionDurationMid}`
    },

    '.__tab-item-label': {
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '26px',
      letterSpacing: '-0.72px',
      textTransform: 'uppercase',
      'white-space': 'nowrap',
      paddingTop: 4,
      paddingBottom: 2
    },

    '.__tab-item:after': {
      content: "''",
      display: 'block',
      borderTopWidth: 2,
      borderTopStyle: 'solid',
      transition: `opacity ${token.motionDurationMid}`,
      opacity: 0
    },

    '.__tab-item.-active': {
      color: token.colorPrimary,

      '&:after': {
        opacity: 1
      }
    }
  };
});
