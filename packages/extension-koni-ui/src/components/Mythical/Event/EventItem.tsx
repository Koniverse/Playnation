// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

export enum EventDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum EventStatus {
  READY = 'ready',
  COMPLETED = 'completed',
  COMING_SOON = 'comingSoon',
}

type EventItemProps = ThemeProps & {
  className?: string;
  difficulty: EventDifficulty;
  status: EventStatus;
};

function Component ({ className, difficulty, status }: EventItemProps) {
  const { t } = useTranslation();

  const difficultyText = useMemo(() => {
    if (difficulty === EventDifficulty.EASY) {
      return t('Easy');
    }

    if (difficulty === EventDifficulty.MEDIUM) {
      return t('Medium');
    }

    return t('Hard');
  }, [difficulty, t]);

  const statusText = useMemo(() => {
    if (status === EventStatus.READY) {
      return t('Time remaining');
    }

    if (status === EventStatus.COMING_SOON) {
      return t('Starts in');
    }

    return t('Completed');
  }, [status, t]);

  const buttonLabel = useMemo(() => {
    if (status === EventStatus.READY) {
      return t('Start event');
    }

    if (status === EventStatus.COMING_SOON) {
      return t('Coming soon');
    }

    return (
      <>
        {t('Score')}&nbsp;
        <span>280</span>
      </>
    );
  }, [status, t]);

  return (
    <>
      <div className={CN(className)}>
        <div className='__item-name-block'>
          <div className='__item-name-text'>Road Hero Pros</div>
        </div>

        <div className='__item-round-block'>
          <div className='__item-round-number'>5</div>
          <div className='__item-round-text'>{t('Rounds')}</div>
        </div>

        <div className='__item-difficulty-block'>
          <div className='__item-difficulty-text'>{difficultyText}</div>
        </div>

        <img
          alt={'alt'}
          className='__item-logo'
          src={'/images/mythical/event-logo-example.png'}
        />

        <div className={'__item-body-area'}>
          <div className='__item-bonus-info'>
            <div className='__item-bonus-label __item-info-label'>{t('Bonus')}</div>
            <div className='__item-bonus-value'>
              Draft 2024 * 5% NFL Rivals
            </div>
          </div>

          <div className='__item-stat-info'>
            <div className='__item-stats-label __item-info-label'>{t('Stats')}</div>
            <div className='__item-stats-value'>
              <span>Str</span>
              <span>Acc</span>
              <span>Jmp</span>
              <span>Pow</span>
            </div>
          </div>
        </div>

        <div className='__item-footer-area'>
          <div className='__item-footer-area-left-part'>
            <div className='__item-status-text'>
              {statusText}
            </div>

            <div className={'__item-time'}>
              <svg
                className={'__item-clock-icon'}
                fill='none'
                viewBox='0 0 15 14'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M13.0815 7.00033C13.0815 10.2203 10.4681 12.8337 7.24813 12.8337C4.02813 12.8337 1.41479 10.2203 1.41479 7.00033C1.41479 3.78033 4.02813 1.16699 7.24813 1.16699C10.4681 1.16699 13.0815 3.78033 13.0815 7.00033Z'
                  stroke='white'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.2'
                />
                <path
                  d='M9.41223 8.85503L7.60389 7.77586C7.28889 7.58919 7.03223 7.14003 7.03223 6.77253V4.38086'
                  stroke='white'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.2'
                />
              </svg>

              <div className='__item-time-text'>
                12day 10hrs
              </div>
            </div>
          </div>

          <div className='__item-footer-area-right-part'>
            <MythButton
              className={CN('__item-button', {
                '-ready': status === EventStatus.READY,
                '-coming-soon': status === EventStatus.COMING_SOON,
                '-completed': status === EventStatus.COMPLETED
              })}
            >
              {buttonLabel}
            </MythButton>
          </div>
        </div>
      </div>
    </>
  );
}

export const EventItem = styled(Component)<EventItemProps>(({ difficulty,
  theme: { extendToken, token } }: EventItemProps) => {
  const itemBackground = (() => {
    if (difficulty === EventDifficulty.EASY) {
      return '/images/mythical/event-item-easy-background.png';
    }

    if (difficulty === EventDifficulty.MEDIUM) {
      return '/images/mythical/event-item-medium-background.png';
    }

    return '/images/mythical/event-item-hard-background.png';
  })();

  const difficultyColor = (() => {
    if (difficulty === EventDifficulty.EASY) {
      return '#28C89F';
    }

    if (difficulty === EventDifficulty.MEDIUM) {
      return '#EB7E36';
    }

    return '#FF485D';
  })();

  return ({
    minHeight: 297,

    position: 'relative',

    '&:before': {
      content: '""',
      position: 'absolute',
      display: 'block',
      inset: 0,
      backgroundImage: `url("${itemBackground}")`,
      backgroundSize: '100% 285px',
      filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat'
    },

    '.__item-name-block': {
      backgroundImage: 'url("/images/mythical/event-item-name.png")',
      backgroundSize: '100% 36px',
      minHeight: 36,
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat',
      position: 'absolute',
      left: -7,
      top: 0,
      minWidth: 181,
      paddingLeft: 25,
      paddingRight: 8,
      paddingTop: 4
    },

    '.__item-name-text': {
      fontFamily: extendToken.fontPermanentMarker,
      lineHeight: '20px',
      fontWeight: 400,
      fontSize: 16,
      color: extendToken.mythColorDark
    },

    // round block

    '.__item-round-block': {
      position: 'absolute',
      top: 48,
      left: 10,
      width: 44,
      height: 44,
      backgroundSize: '100% 100%',
      backgroundImage: 'url("/images/mythical/event-item-round.png")',
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat',
      textAlign: 'center',
      paddingTop: 4
    },

    '.__item-round-number': {
      fontFamily: extendToken.fontDruk,
      lineHeight: '20px',
      fontWeight: 700,
      fontSize: 20,
      fontStyle: 'italic',
      color: token.colorPrimary
    },

    '.__item-round-text': {
      fontFamily: extendToken.fontDruk,
      lineHeight: '14px',
      fontWeight: 500,
      fontSize: 11,
      color: '#bebebe',
      textTransform: 'uppercase'
    },

    // difficulty block

    '.__item-difficulty-block': {
      position: 'absolute',
      top: 48,
      left: 62,
      width: 52,
      height: 44,
      backgroundSize: '100% 100%',
      backgroundImage: 'url("/images/mythical/event-item-difficulty.png")',
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat',
      textAlign: 'center',
      paddingTop: 11
    },

    '.__item-difficulty-text': {
      color: difficultyColor,
      textTransform: 'uppercase',
      fontFamily: extendToken.fontDruk,
      lineHeight: '18px',
      fontWeight: 500,
      fontSize: 16
    },

    '.__item-logo': {
      position: 'absolute',
      right: -12,
      top: -11,
      width: 165,
      height: 'auto'
    },

    // body

    '.__item-body-area': {
      position: 'absolute',
      top: 78,
      left: 16,
      right: 16,
      paddingLeft: 20,
      paddingTop: 20,
      paddingRight: 11
    },

    '.__item-info-label': {
      color: '#fff',
      textTransform: 'uppercase',
      fontFamily: extendToken.fontDruk,
      lineHeight: '24px',
      fontStyle: 'italic',
      fontWeight: 500,
      fontSize: 20,
      marginBottom: 2
    },

    '.__item-bonus-value': {
      color: '#fff',
      fontFamily: extendToken.fontBarlowCondensed,
      lineHeight: '18px',
      fontWeight: 400,
      fontSize: 16
    },

    '.__item-bonus-info + .__item-stat-info': {
      marginTop: 6
    },

    '.__item-stats-value': {
      display: 'flex',
      textTransform: 'uppercase',
      fontFamily: extendToken.fontPermanentMarker,
      lineHeight: '16px',
      fontWeight: 400,
      fontSize: 14,
      gap: 12,
      color: '#fff'
    },

    // footer

    '.__item-footer-area': {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 21,
      height: 57,
      display: 'flex',
      paddingLeft: 19,
      paddingRight: 10,
      justifyContent: 'space-between',
      gap: 8
    },

    '.__item-footer-area-left-part': {
      paddingTop: 9
    },

    '.__item-footer-area-right-part': {
      paddingTop: 8,
      flex: 1,
      maxWidth: 158
    },

    // status text
    '.__item-status-text': {
      fontFamily: extendToken.fontDruk,
      fontSize: 20,
      lineHeight: '22px',
      fontWeight: 500,
      fontStyle: 'italic',
      letterSpacing: -0.4,
      color: token.colorSecondary,
      textTransform: 'uppercase',
      position: 'relative',
      top: -3
    },

    // time

    '.__item-time': {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    },

    '.__item-clock-icon': {
      width: 14,
      height: 14
    },

    '.__item-time-text': {
      color: '#fff',
      fontFamily: extendToken.fontBarlowCondensed,
      lineHeight: '16px',
      fontWeight: 500,
      fontSize: 14,
      letterSpacing: 0.28
    },

    // button

    '.__item-button': {
      width: '100%',
      height: 40,

      '.__button-content': {
        marginTop: -5
      },

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/event-item-action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__item-button.-ready': {
      cursor: 'pointer',

      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background:before': {
        background: token.colorPrimary
      }
    },

    '.__item-button.-coming-soon': {
      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background:before': {
        backgroundColor: extendToken.mythColorGray2
      }
    },

    '.__item-button.-completed': {
      '.__button-content': {
        color: token.colorWhite,

        span: {
          color: token.colorPrimary
        }
      },

      '.__button-background:before': {
        backgroundColor: extendToken.mythColorGray3
      }
    }
  });
});
