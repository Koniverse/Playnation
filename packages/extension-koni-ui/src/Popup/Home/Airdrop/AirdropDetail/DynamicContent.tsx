// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  content: string
};

function Component ({ className, content }: Props) {
  return (<div className={CN(className, '__dynamic-content-wrapper')}>
    {
      content && (
        <div
          className={'__dynamic-content'}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }
  </div>);
}

export const DynamicContent = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    paddingLeft: token.padding,
    paddingRight: token.padding,
    overflow: 'auto',
    flex: 1,

    '.__dynamic-content': {
      'h2, h1': {
        lineHeight: token.lineHeightLG,
        color: token.colorTextDark1,
        fontWeight: token.headingFontWeight,
        fontSize: token.fontSizeLG,
        marginBottom: token.marginSM
      },

      p: {
        lineHeight: token.lineHeight,
        color: token.colorTextDark2,
        fontSize: token.fontSize,
        marginBottom: token.marginSM
      }
    }
  });
});
