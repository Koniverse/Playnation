// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, ButtonProps, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { IconProps } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  phosphorIcon?: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>,
  emptyTitle?: string,
  emptyMessage?: string,
  buttonProps?: ButtonProps;
}

const Component: React.FC<Props> = (props: Props) => {
  const { buttonProps, className, emptyMessage, emptyTitle, phosphorIcon } = props;

  return (
    <div className={CN(className, 'empty-list')}>
      <div className={'empty_icon_wrapper'}>

        <div className='empty_icon'>
          <Icon
            customSize={'60px'}
            phosphorIcon={phosphorIcon}
            weight={'fill'}
          />
        </div>
      </div>

      <div className={'empty_text_container'}>
        <div className={'empty_title'}>{emptyTitle}</div>
        <div className={'empty_subtitle'}>{emptyMessage}</div>
      </div>

      {
        buttonProps && (
          <div className='button-container'>
            <Button {...buttonProps} />
          </div>
        )
      }
    </div>
  );
};

const EmptyList = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    overflow: 'hidden',
    padding: '32px 16px',
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignContent: 'center',
    position: 'relative',
    zIndex: 2,

    '.empty_icon': {
      width: 104,
      height: 104,
      borderRadius: '100%',
      background: extendToken?.colorBgGradient || token.colorPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: token.colorTextDark1
    },

    '.empty_text_container': {
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      whiteSpace: 'pre-line'
    },

    '.empty_title': {
      fontWeight: token.headingFontWeight,
      textAlign: 'center',
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      color: token.colorTextDark1,
      marginBottom: token.marginSM
    },

    '.empty_subtitle': {
      textAlign: 'center',
      color: token.colorTextDark4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.empty_icon_wrapper': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: token.margin
    },

    '.button-container': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: token.marginSM
    }
  };
});

export default EmptyList;
