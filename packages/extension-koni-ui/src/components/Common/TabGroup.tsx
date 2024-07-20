// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback } from 'react';
import styled from 'styled-components';

export type TabGroupItemType = {
  label: string,
  value: string,
  disabled?: boolean
}

type Props = ThemeProps & {
  items: TabGroupItemType[],
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
              '-active': i.value === selectedItem,
              '-disabled': i.disabled
            })}
            key={i.value}
            onClick={i.disabled ? undefined : onClick(i.value)}
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

export const TabGroup = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    display: 'flex',
    gap: token.sizeSM,
    padding: '6px 10px',
    backgroundColor: extendToken.colorBgTranslucent,
    borderRadius: 24,

    '.__tab-item': {
      cursor: 'pointer',
      color: token.colorTextDark2,
      transition: `color ${token.motionDurationMid}, background-color ${token.motionDurationMid}`,
      backgroundColor: extendToken.colorBgSecondary1,
      border: `1px solid ${token.colorBgBorder}`,
      paddingLeft: 11,
      paddingRight: 11,
      borderRadius: 50,
      flex: 1,
      height: 30,
      display: 'flex',
      alignItems: 'center'
    },

    '.__tab-item-label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      flex: 1,
      textAlign: 'center'
    },

    '.__tab-item.-active': {
      color: token.colorTextLight2,
      backgroundColor: extendToken.colorBgSecondary2
    }
  };
});

export default TabGroup;
