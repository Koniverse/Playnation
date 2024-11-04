// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  title: string;
  onBack?: VoidFunction;
  rightPartNode?: React.ReactNode
};

const Component = ({ className, onBack, rightPartNode, title }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <div className='__left-part'>
        {
          !!onBack && (
            <button
              className='__back-button'
              onClick={onBack}
            />
          )
        }

        <div className='__screen-title'>
          {title}
        </div>
      </div>

      {
        !!rightPartNode && (
          <div className='__right-part'>
            {rightPartNode}
          </div>
        )
      }
    </div>
  );
};

const SubScreenHeader = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    paddingLeft: 20,
    paddingTop: 18,
    paddingBottom: 18,
    paddingRight: 20,
    display: 'flex',

    '.__left-part': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__back-button': {
      cursor: 'pointer',
      minWidth: 30,
      height: 32,
      marginRight: 16,
      backgroundColor: 'transparent',
      backgroundImage: 'url(/images/mythical/back-button.png)',
      backgroundPosition: '0 0',
      backgroundSize: '100% 100%',
      border: 0
    },

    '.__screen-title': {
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '20px',
      textTransform: 'uppercase',
      color: token.colorWhite
    }
  };
});

export default SubScreenHeader;
