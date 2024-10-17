// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const [isSelected, setIsSelected] = useState<boolean>(true);

  const onClick = useCallback(() => {
    setIsSelected((prev) => !prev);
  }, []);

  return (
    <div className={className}>
      <div
        className={CN('__sort-button', {
          '-active': isSelected
        })}
        onClick={onClick}
        style={{
          backgroundImage: isSelected ? 'url("/images/mythical/tool-sort-active-background.png")' : 'url("/images/mythical/tool-sort-background.png")'
        }}
      >
        <div className='__sort-button-label'>
          {isSelected
            ? (
              <>
              Last name<span>&nbsp;Descending</span>
              </>
            )
            : 'Sort by'}
        </div>
        <svg
          className='__sort-button-icon'
          fill='none'
          height='20'
          viewBox='0 0 20 20'
          width='21'
          xmlns='http://www.w3.org/2000/svg'
        >
          {
            isSelected
              ? (
                <path
                  d='M9.99898 8.82208L14.1238 4.69727L15.3023 5.87577L11.1775 10.0006L15.3023 14.1253L14.1238 15.3038L9.99898 11.1791L5.8742 15.3038L4.69568 14.1253L8.82048 10.0006L4.69568 5.87577L5.8742 4.69727L9.99898 8.82208Z'
                  fill='#BEBEBE'
                />
              )
              : (
                <path
                  d='M10.5005 10.9762L14.6254 6.85144L15.8039 8.02995L10.5005 13.3333L5.19727 8.02995L6.37577 6.85144L10.5005 10.9762Z'
                  fill='#BEBEBE'
                />
              )
          }
        </svg>
      </div>
    </div>
  );
};

export const ToolSort = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    justifyContent: 'flex-end',
    overflow: 'hidden',

    '.__sort-button': {
      cursor: 'pointer',
      paddingLeft: 15,
      paddingRight: 12,
      minWidth: 98,
      height: 36,
      backgroundSize: '100% 36px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      overflow: 'hidden',

      '&.-active': {
        flex: 1
      }
    },

    '.__sort-button-label': {
      textTransform: 'uppercase',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: -0.16,
      color: '#fff',
      marginRight: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      'white-space': 'nowrap',

      span: {
        color: extendToken.mythColorTextGray
      }
    }
  };
});
