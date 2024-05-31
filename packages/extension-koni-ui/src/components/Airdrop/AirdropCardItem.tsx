// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatBalance } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Coins, ShareNetwork } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  item: AirdropCampaign;
  onExplore: VoidFunction;
};

function Component ({ className, item, onExplore }: Props) {
  const { t } = useTranslation();

  const isComingSoon = (() => {
    if (!item.start) {
      return false;
    }

    // Check coming soon by start time
    const startTime = new Date(item.start).getTime();

    return startTime > Date.now();
  })();

  return (
    <div className={CN(className, {
      '-is-coming-soon': isComingSoon
    })}
    >
      <div className='__left-part'>
        <div className='__name'>{item.name}</div>

        <div className='__token-tag-wrapper'>
          <div className={'__token-tag'}>
            {
              isComingSoon
                ? (
                  <span className={'__token-value'}>--</span>
                )
                : (
                  <>
                    <span className={'__token-value'}>
                      {
                        formatBalance(item.total_tokens, item.decimal)
                      }
                    </span>

                    <span className='__token-symbol'>
                      {item.symbol}
                    </span>
                  </>
                )
            }

            <Icon
              className={'__token-icon'}
              customSize={'12px'}
              phosphorIcon={Coins}
              weight={'fill'}
            />
          </div>
        </div>

        <div className={'__description'}>
          {isComingSoon ? '' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'}
        </div>

        <div className='__buttons'>
          <Button
            className={'__explore-button'}
            disabled={isComingSoon}
            onClick={onExplore}
            schema={'secondary'}
            shape={'round'}
            size={'xs'}
          >
            {t('Explore')}
          </Button>

          {
            !isComingSoon && (
              <Button
                className={'__share-button -primary-3'}
                icon={(
                  <Icon
                    customSize={'20px'}
                    phosphorIcon={ShareNetwork}
                  />
                )}
                shape={'round'}
                size={'xs'}
              />
            )
          }
        </div>
      </div>
      <div className='__right-part'>
        <div
          className={'__banner'}
          style={{ backgroundImage: `url("${item.banner}")` }}
        />

        {
          isComingSoon && (
            <div className={'__coming-soon-tag'}>
              {t('Coming soon')}
            </div>
          )
        }
      </div>
    </div>
  );
}

export const AirdropCardItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    backgroundColor: token.colorWhite,
    borderRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    height: 216,

    '.__token-tag-wrapper': {
      display: 'flex',
      marginTop: token.marginXS,
      marginBottom: token.marginXS
    },

    '.__token-tag': {
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingSM,
      borderRadius: 20,
      backgroundColor: extendToken.colorBgSecondary2,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      paddingTop: 3,
      paddingBottom: 3,
      display: 'flex',
      alignItems: 'center'
    },

    '.__token-value': {
      color: token.colorTextLight1,
      fontWeight: token.headingFontWeight
    },

    '.__token-symbol': {
      color: token.colorTextLight3,
      marginLeft: 2
    },

    '.__token-icon': {
      color: token.colorPrimary,
      marginLeft: token.marginXXS
    },

    '.__left-part': {
      flex: 1,
      paddingLeft: 20,
      paddingTop: 20,
      overflow: 'hidden'
    },

    '.__name': {
      fontSize: token.fontSizeLG,
      lineHeight: '21px',
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      display: '-webkit-box',
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical'
    },

    '.__description': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: token.marginSM,
      color: token.colorTextDark3,
      display: '-webkit-box',
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical',
      minHeight: 40,
      overflow: 'hidden'
    },

    '.__buttons': {
      display: 'flex',
      gap: token.sizeXS
    },

    '.__right-part': {
      position: 'relative'
    },

    '.__coming-soon-tag': {
      position: 'absolute',
      right: 0,
      bottom: 20,
      paddingLeft: token.padding,
      paddingRight: token.paddingSM,
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      backgroundColor: extendToken.colorBgSecondary2,
      color: token.colorPrimary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      paddingTop: 6,
      paddingBottom: 6
    },

    '.__banner': {
      width: 153,
      backgroundSize: 'cover',
      backgroundPosition: 'center right',
      height: '100%',
      clipPath: 'path("M24.9302 20.5871C26.6276 8.77198 36.7499 0 48.6863 0H153V215H24.6944C10.0815 215 -1.13975 202.051 0.938259 187.587L24.9302 20.5871Z")'
    },

    '&.-is-coming-soon': {
      '.__banner': {
        filter: 'blur(8px)'
      }
    }
  });
});

export default AirdropCardItem;
