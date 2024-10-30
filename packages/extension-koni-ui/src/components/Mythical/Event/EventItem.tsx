// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClockIcon, MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

export enum EventDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export enum EventState {
  AVAILABLE = 'available',
  COMPLETED = 'completed',
  COMING_SOON = 'comingSoon',
  UNKNOWN = 'unknown',
}

// todo: will have game info
export type EventItemType = {
  id: number;
  difficulty: EventDifficulty;
  state: EventState;
  stats: string[];
  round: number;
  logoSrc: string;
  datetime: string;
  bonusText?: string;
  name: string;
  onPlayEvent: (eventID: number) => void;
  score?: number;
};

type Props = ThemeProps & EventItemType;

function Component ({ bonusText, className, datetime, difficulty, id, logoSrc, name, onPlayEvent, round, score = 0, state, stats }: Props) {
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

  const stateText = useMemo(() => {
    if (state === EventState.AVAILABLE) {
      return t('Time remaining');
    }

    if (state === EventState.COMING_SOON) {
      return t('Starts in');
    }

    return t('Completed');
  }, [state, t]);

  const buttonLabel = useMemo(() => {
    if (state === EventState.AVAILABLE) {
      return t('Start event');
    }

    if (state === EventState.COMING_SOON) {
      return t('Coming soon');
    }

    return (
      <>
        {t('Score')}&nbsp;
        <span>{score}</span>
      </>
    );
  }, [score, state, t]);

  const _onClickPlayEvent = useCallback(() => {
    if (state === EventState.AVAILABLE) {
      onPlayEvent(id);
    }
  }, [id, onPlayEvent, state]);

  const statItems = useMemo(() => {
    const result: string[] = [];

    const abbMap: Record<string, string> = {
      power: 'POW',
      strength: 'STR',
      acceleration: 'ACC',
      jump: 'JMP',
      quickness: 'QUI',
      presence: 'PRS',
      endurance: 'END',
      carry: 'CAR'
    };

    stats.forEach((item, index) => {
      if (index > 3) {
        return;
      }

      if (abbMap[item]) {
        result.push(abbMap[item]);
      }
    });

    return result;
  }, [stats]);

  return (
    <>
      <div className={CN(className)}>
        <div className='__item-name-block'>
          <div className='__item-name-text'>{name}</div>
        </div>

        <div className='__item-round-block'>
          <div className='__item-round-number'>{round}</div>
          <div className='__item-round-text'>{t('Rounds')}</div>
        </div>

        <div className='__item-difficulty-block'>
          <div className='__item-difficulty-text'>{difficultyText}</div>
        </div>

        <img
          alt={'alt'}
          className='__item-logo'
          src={logoSrc}
        />

        <div className={'__item-body-area'}>
          {
            !!bonusText && (
              <div className='__item-bonus-info'>
                <div className='__item-bonus-label __item-info-label'>{t('Bonus')}</div>
                <div className='__item-bonus-value'>
                  {bonusText}
                </div>
              </div>
            )
          }

          <div className='__item-stat-info'>
            <div className='__item-stats-label __item-info-label'>{t('Stats')}</div>
            <div className='__item-stats-value'>
              {
                statItems.map((item) => (
                  <span key={item}>{item}</span>
                ))
              }
            </div>
          </div>
        </div>

        <div className='__item-footer-area'>
          <div className='__item-footer-area-left-part'>
            <div className='__item-state-text'>
              {stateText}
            </div>

            <div className={'__item-time'}>
              <ClockIcon
                className={'__item-clock-icon'}
              />

              <div className='__item-time-text'>
                {datetime}
              </div>
            </div>
          </div>

          <div className='__item-footer-area-right-part'>
            <MythButton
              className={CN('__item-button', {
                '-available': state === EventState.AVAILABLE,
                '-coming-soon': state === EventState.COMING_SOON,
                '-completed': state === EventState.COMPLETED
              })}
              onClick={_onClickPlayEvent}
            >
              {buttonLabel}
            </MythButton>
          </div>
        </div>
      </div>
    </>
  );
}

export const EventItem = styled(Component)<Props>(({ difficulty,
  theme: { extendToken, token } }: Props) => {
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
    paddingTop: 79,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,

    '&:before': {
      content: '""',
      position: 'absolute',
      display: 'block',
      inset: 0,
      top: 12,
      backgroundImage: `url("${itemBackground}")`,
      backgroundSize: '100% 100%',
      filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat'
    },

    '.__item-name-block': {
      backgroundImage: 'url("/images/mythical/event-item-name.png")',
      backgroundSize: '100% 36px',
      backgroundPosition: 'left bottom',
      backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(1.57px 1.57px 0px #000)',
      minHeight: 36,
      position: 'absolute',
      left: -7,
      top: 0,
      minWidth: 181,
      paddingLeft: 25,
      paddingRight: 12,
      paddingTop: 4,
      zIndex: 3,
      maxWidth: 300
    },

    '.__item-name-text': {
      fontFamily: extendToken.fontPermanentMarker,
      lineHeight: '20px',
      fontWeight: 400,
      fontSize: 16,
      color: extendToken.mythColorDark,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
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
      filter: 'drop-shadow(1.862px 1.862px 0px #000)',
      textAlign: 'center',
      paddingTop: 4,
      zIndex: 2
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
      filter: 'drop-shadow(1.57px 1.57px 0px #000)',
      textAlign: 'center',
      paddingTop: 11,
      zIndex: 2
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
      height: 'auto',
      zIndex: 2
    },

    // body

    '.__item-body-area': {
      position: 'relative',
      zIndex: 1,
      marginRight: -1.57,
      minHeight: 141.57,
      paddingLeft: 20,
      paddingTop: 20,
      paddingRight: 11,
      paddingBottom: 27.57,
      backgroundImage: 'url("/images/mythical/event-item-body-area-background.png")',
      backgroundSize: '100% 100%',
      marginBottom: 4.43
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
      paddingRight: 116,
      fontFamily: extendToken.fontBarlowCondensed,
      lineHeight: '18px',
      fontWeight: 400,
      fontSize: 16,
      display: '-webkit-box',
      '-webkit-line-clamp': '3',
      '-webkit-box-orient': 'vertical',
      overflow: 'hidden'
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
      position: 'relative',
      zIndex: 1,
      backgroundImage: 'url("/images/mythical/event-item-footer-area-background.png")',
      backgroundSize: '100% 100%',
      minHeight: 58.57,
      marginBottom: -1.57,
      marginRight: -1.57,
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

    // state text
    '.__item-state-text': {
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

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/event-item-action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__item-button.-available': {
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
