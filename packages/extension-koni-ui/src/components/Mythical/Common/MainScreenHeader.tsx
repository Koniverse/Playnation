// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  title: string;
  rightPartNode?: React.ReactNode
};

const Component = ({ className, rightPartNode, title }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <div className='__left-part'>
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

const MainScreenHeader = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    padding: '20px 16px',
    alignItems: 'center',

    '.__left-part': {
      flex: 1
    },

    '.__screen-title': {
      color: token.colorWhite,
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '32px',
      lineHeight: '40px',
      fontStyle: 'normal',
      fontWeight: 400,
      textTransform: 'uppercase'
    },

    '.__right-part': {

    }
  };
});

export default MainScreenHeader;
