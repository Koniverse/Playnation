// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, formatBalance } from '@subwallet/extension-koni-ui/utils';
import { Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropNftInfo: IAirdropNftMinting
};

enum Timeline {
  START = 'start',
  SNAPSHOT = 'snapshot',
  MINT = 'mint',
  END = 'end'
}

function Component ({ airdropNftInfo, className }: Props) {
  const { t } = useTranslation();

  const { timelines } = (() => {
    // eslint-disable-next-line camelcase
    const { end, start, start_mint, start_snapshot } = airdropNftInfo;
    const currentDate = Date.now();
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const startSnapshotMs = new Date(start_snapshot).getTime();
    const startMintMs = new Date(start_mint).getTime();

    const timelines: Timeline[] = [];

    if (currentDate >= startMs && currentDate < startSnapshotMs) {
      timelines.push(Timeline.START);
    } else if (currentDate >= startSnapshotMs && currentDate < startMintMs) {
      timelines.push(Timeline.START, Timeline.SNAPSHOT);
    } else if (currentDate >= startMintMs && currentDate < endMs) {
      timelines.push(Timeline.START, Timeline.SNAPSHOT, Timeline.MINT);
    } else if (currentDate >= endMs) {
      timelines.push(Timeline.START, Timeline.SNAPSHOT, Timeline.MINT, Timeline.END);
    }

    return {
      timelines
    };
  })();

  const getTimeLinePercent = (): string => {
    // eslint-disable-next-line camelcase
    const { end, start, start_mint, start_snapshot } = airdropNftInfo;

    const currentDate = Date.now();

    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const startSnapshotMs = new Date(start_snapshot).getTime();
    const startMintMs = new Date(start_mint).getTime();
    const basePercent = 100 / 3;

    if (currentDate >= startMs && currentDate < startSnapshotMs) {
      return `${(currentDate - startMs) * basePercent / (startSnapshotMs - startMs)}%`;
    }

    if (currentDate >= startSnapshotMs && currentDate < startMintMs) {
      return `${basePercent + ((currentDate - startSnapshotMs) * basePercent / (startMintMs - startSnapshotMs))}%`;
    }

    if (currentDate >= startMintMs && currentDate < endMs) {
      return `${2 * basePercent + ((currentDate - startMintMs) * basePercent / (endMs - startMintMs))}%`;
    }

    if (currentDate >= endMs) {
      return '100%';
    }

    return '0';
  };

  return (
    <div className={CN(className)}>
      <div className='__airdrop-info-area'>
        <div className='__airdrop-info-left-part'>
          <div className='__airdrop-icon'>
            <Image
              height={48}
              shape={'squircle'}
              src={airdropNftInfo.icon}
              width={48}
            />
          </div>
        </div>
        <div className='__airdrop-info-right-part'>
          <div className='__airdrop-name'>
            {airdropNftInfo.name}
          </div>

          <div className='__airdrop-token'>
            <span className='__airdrop-token-value'>{formatBalance(airdropNftInfo.total_badges, 0)}</span>
            <span className='__airdrop-token-symbol'>{airdropNftInfo.symbol}</span>
          </div>
        </div>
      </div>

      <div className='__time-line-area'>
        <div className={CN('__time-line-bar')}>
          <div
            className='__time-line-bar-current'
            style={{ maxWidth: getTimeLinePercent() }}
          />
        </div>

        <div className='__time-line-legend-container'>
          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-start', {
              '-active': timelines.includes(Timeline.START)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Start')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropNftInfo.start, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-center', {
              '-active': timelines.includes(Timeline.SNAPSHOT)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Snapshot')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropNftInfo.start_snapshot, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-center', {
              '-active': timelines.includes(Timeline.MINT)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('Claim')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropNftInfo.start_mint, '#DD#/#MM#')}
              </div>
            </div>
          </div>

          <div className='__time-line-legend-item-wrapper'>
            <div className={CN('__time-line-legend-item', '-end', {
              '-active': timelines.includes(Timeline.END)
            })}
            >
              <div className='__time-line-legend-item-name'>{t('End')}</div>
              <div className='__time-line-legend-item-date'>
                {customFormatDate(airdropNftInfo.end, '#DD#/#MM#')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MintNftHeader = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    borderRadius: 20,
    backgroundColor: extendToken.colorBgSecondary1,
    padding: token.padding,

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
      marginBottom: token.marginXS
    },

    '.__time-line-bar-current': {
      borderRadius: 100,
      height: 8,
      backgroundColor: token.colorSuccess
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

export default MintNftHeader;
