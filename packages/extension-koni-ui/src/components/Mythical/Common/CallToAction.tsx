// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onAction?: VoidFunction;
};

const Component = ({ buttonLabel,
  className,
  onAction,
  subtitle,
  title }: Props): React.ReactElement => {
  return (
    <div
      className={className}
    >
      <div className='__left-part'>
        <div className='__title'>
          {title}
        </div>

        <div className='__subtitle'>
          {subtitle}
        </div>
      </div>

      <div className='__right-part'>
        <MythButton
          className='__action-button'
          onClick={onAction}
        >
          {buttonLabel}
        </MythButton>
      </div>
    </div>
  );
};

const CallToAction = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    minHeight: 83,
    backgroundImage: 'url(/images/mythical/call-to-action-background.png)',
    backgroundPosition: 'center center',
    backgroundSize: '100% 100%',
    // filter: 'drop-shadow(2px 2px 0px #000)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '17px 12px 17px 24px',
    gap: 8,

    '.__left-part': {
      flex: 1
    },

    '.__title': {
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '-0.6px',
      textTransform: 'uppercase',
      color: token.colorWhite,
      position: 'relative',
      top: -4
    },

    '.__subtitle': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      color: token.colorWhite
    },

    '.__action-button': {
      minWidth: 117,
      height: 40,
      paddingLeft: 4,
      paddingRight: 2,

      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        // filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/call-to-action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    }
  };
});

export default CallToAction;
