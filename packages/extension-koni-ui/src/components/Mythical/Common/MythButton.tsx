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
  isLoading?: boolean;
};

const Component = ({ children,
  className,
  disabled,
  icon,
  isLoading,
  onClick }: Props): React.ReactElement => {
  return (
    <button
      className={className}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      <span className='__button-inner'>
        {
          !isLoading && (
            <>
              {icon}
              <span className='__button-content'>
                {children}
              </span>
            </>
          )
        }

        {
          isLoading && (
            <>
              <div className='__loading-spinner'></div>
            </>
          )
        }
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '.__button-inner': {
      display: 'flex',
      position: 'relative',
      zIndex: 2,
      alignItems: 'center'
    },

    '.__button-content': {
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      textTransform: 'uppercase',
      paddingBottom: 2
    },

    '.__loading-spinner': {
      width: '20px',
      height: '20px',
      border: '3px solid transparent',
      borderTop: `3px solid ${token.colorTextDark1}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      zIndex: 10
    },
    '@keyframes spin': {
      '0%': {
        transform: 'rotate(0deg)'
      },
      '100%': {
        transform: 'rotate(360deg)'
      }
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
      opacity: 0.62,
      cursor: 'default'
    }
  };
});

export default MythButton;
