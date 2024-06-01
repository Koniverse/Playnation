// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, formatBalance } from '@subwallet/extension-koni-ui/utils';
import { Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropInfo: AirdropCampaign
};

enum Timeline {
  START = 'start',
  SNAPSHOT = 'snapshot',
  CLAIM = 'claim',
  END = 'end'
}

function Component ({ airdropInfo, className }: Props) {
  const { t } = useTranslation();

  const { currentTimeline, pastTimelines }: {
    currentTimeline: Timeline,
    pastTimelines: Timeline[]
  } = (() => {
    const now = Date.now();

    let currentTimeline = Timeline.START;
    const pastTimelines: Timeline[] = [Timeline.START];

    if (airdropInfo.end_snapshot && now >= new Date(airdropInfo.end_snapshot).getTime()) {
      currentTimeline = Timeline.SNAPSHOT;
      pastTimelines.push(Timeline.SNAPSHOT);
    }

    if (airdropInfo.end_claim && now >= new Date(airdropInfo.end_claim).getTime()) {
      currentTimeline = Timeline.CLAIM;
      pastTimelines.push(Timeline.CLAIM);
    }

    if (airdropInfo.end && now >= new Date(airdropInfo.end).getTime()) {
      currentTimeline = Timeline.END;
      pastTimelines.push(Timeline.END);
    }

    return {
      currentTimeline,
      pastTimelines
    };
  })();

  return (
    <div className={CN(className)}>
      <div className='__airdrop-info-area'>
        <div className='__airdrop-info-left-part'>
          <div className='__airdrop-icon'>
            <Image
              height={48}
              shape={'squircle'}
              src={airdropInfo.icon}
              width={48}
            />
          </div>
        </div>
        <div className='__airdrop-info-right-part'>
          <div className='__airdrop-name'>
            {airdropInfo.name}
          </div>

          <div className='__airdrop-token'>
            <span className='__airdrop-token-value'>{formatBalance(airdropInfo.total_tokens, airdropInfo.decimal)}</span>
            <span className='__airdrop-token-symbol'>{airdropInfo.symbol}</span>
          </div>
        </div>
      </div>

      <div className='__time-line-area'>
        <div className={CN('__time-line-bar', {
          '-is-snapshot': currentTimeline === Timeline.SNAPSHOT,
          '-is-claim': currentTimeline === Timeline.CLAIM,
          '-is-end': currentTimeline === Timeline.END
        })}
        />

        <div className='__time-line-legend-container'>
          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-start', {
              '-active': pastTimelines.includes(Timeline.START)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Start')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropInfo.start, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-center', {
              '-active': pastTimelines.includes(Timeline.SNAPSHOT)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Snapshot')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropInfo.end_snapshot, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-center', {
              '-active': pastTimelines.includes(Timeline.CLAIM)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Claim')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropInfo.start_claim, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-end', {
              '-active': pastTimelines.includes(Timeline.END)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('End')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropInfo.end, '#DD#/#MM#')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const AirdropDetailHeader = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    borderRadius: 20,
    backgroundColor: extendToken.colorBgSecondary1,
    paddingLeft: token.padding,
    paddingRight: token.padding,
    paddingTop: 20,
    paddingBottom: 20,

    '.__airdrop-info-area': {
      display: 'flex',
      marginBottom: token.margin,
      paddingLeft: token.paddingXXS,
      paddingRight: token.paddingXXS,
      gap: token.sizeSM,
      alignItems: 'center',
      overflow: 'hidden'
    },

    '.__airdrop-info-right-part': {
      flex: 1,
      overflow: 'hidden'
    },

    '.__airdrop-icon': {
      img: {
        objectFit: 'cover'
      }
    },

    '.__airdrop-name': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '.__airdrop-token': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      display: 'flex',
      gap: token.sizeXXS
    },

    '.__airdrop-token-value': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__airdrop-token-symbol': {
      color: token.colorTextDark3
    },

    '.__time-line-bar': {
      borderRadius: 100,
      overflow: 'hidden',
      backgroundColor: token.colorBgSecondary,
      marginBottom: token.marginXS,

      '&:before': {
        content: '""',
        borderRadius: 100,
        display: 'block',
        height: 8,
        backgroundColor: token.colorSuccess,
        maxWidth: 0
      },

      '&.-is-snapshot:before': {
        maxWidth: `${100 / 3}%`
      },

      '&.-is-claim:before': {
        maxWidth: `${200 / 3}%`
      },

      '&.-is-end:before': {
        maxWidth: '100%'
      }
    },

    '.__time-line-legend-container': {
      display: 'flex',
      justifyContent: 'space-between',
      height: 36
    },

    '.__time-line-legend-item-wrapper': {
      position: 'relative'
    },

    '.__time-line-legend-item': {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      top: 0,
      opacity: 0.4,

      '&.-left': {
        left: 0,
        alignItems: 'flex-start'
      },

      '&.-center': {
        left: '-50%',
        transform: 'translateX(-50%)',
        alignItems: 'center'
      },

      '&.-end': {
        right: 0,
        alignItems: 'flex-end'
      },

      '&.-active': {
        opacity: 1
      }
    },

    '.__time-line-legend-item-name': {
      fontSize: token.fontSizeSM,
      lineHeight: '16px',
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__time-line-legend-item-date': {
      fontSize: token.fontSizeSM,
      lineHeight: '20px',
      color: token.colorTextDark4
    }
  });
});
