// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const Component = ({ children,
  className,
  disabled,
  icon,
  onClick }: Props): React.ReactElement => {
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
    >
      <span className='__button-inner'>
        {icon}
        <span className='__button-content'>
          {children}
        </span>
      </span>

      <span className='__button-background'>

      </span>
    </button>
  );
};

const MythButton = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    position: 'relative',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
    cursor: 'pointer',

    '.__button-inner': {
      display: 'flex',
      position: 'relative',
      zIndex: 2,
      justifyContent: 'center'
    },

    '.__button-content': {
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '-0.6px',
      textTransform: 'uppercase'
    },

    '.__button-background': {
      position: 'absolute',
      display: 'block',
      inset: 0,
      zIndex: 1,

      '&:before': {
        content: '""',
        position: 'absolute',
        display: 'block',
        inset: 0
      }
    },

    '&:disabled': {
      cursor: 'default'
    }
  };
});

export default MythButton;
