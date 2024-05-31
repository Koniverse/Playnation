// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { TelegramLogo } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropInfo: AirdropCampaign
};

function Component ({ airdropInfo, className }: Props) {
  const { t } = useTranslation();

  return (
    <div className={CN(className)}>
      <div className='__dynamic-content-wrapper'>
        {
          airdropInfo.description && (
            <div
              className={'__dynamic-content'}
              dangerouslySetInnerHTML={{ __html: airdropInfo.description }}
            />
          )
        }
      </div>

      <div className='__divider' />
      <div className='__content-footer'>
        <div className='__token-info'>
          <div className='__token-label'>
            {t('Token')}:
          </div>
          {/* <div className='__token-icon'></div> */}
          <div className='__token-symbol'>
            {airdropInfo.symbol}
          </div>
        </div>

        <div className='__content-footer-separator' />

        <div className='__social-info'>
          <div className='__social-label'>
            {t('Social')}:
          </div>

          <Button
            icon={(
              <Icon
                customSize={'16px'}
                phosphorIcon={TelegramLogo}
                weight={'fill'}
              />
            )}
            size='xs'
            type='ghost'
          />
        </div>
      </div>
    </div>
  );
}

export const AirdropDetailAbout = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    display: 'flex',
    flexDirection: 'column',

    '.__dynamic-content-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      overflow: 'auto',
      flex: 1
    },

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
    },

    '.__divider': {
      backgroundColor: token.colorBgDivider,
      height: 1,
      marginLeft: token.margin,
      marginRight: token.margin
    },

    '.__content-footer': {
      padding: token.padding,
      paddingTop: 3,
      paddingBottom: 7,
      display: 'flex',
      alignItems: 'center',
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__token-info, .__social-info': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__token-label, .__social-label': {
      color: token.colorTextDark4
    },

    '.__token-symbol': {
      marginLeft: token.marginXXS,
      fontWeight: token.headingFontWeight
    },

    '.__content-footer-separator': {
      backgroundColor: token.colorBgDivider,
      height: token.size,
      width: 1,
      marginLeft: token.margin,
      marginRight: token.margin
    }
  });
});
