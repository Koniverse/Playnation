// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  title: string;
  content?: React.ReactNode
};

const Component = ({ className, content, title }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <div className='__title'>
        {title}
      </div>

      <div className='__content'>
        {content}
      </div>
    </div>
  );
};

const EmptyListContent = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    textAlign: 'center',

    '.__title': {
      color: token.colorWhite,
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '-0.6px',
      textTransform: 'uppercase'
    },

    '.__content': {
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px'
    }
  };
});

export default EmptyListContent;
