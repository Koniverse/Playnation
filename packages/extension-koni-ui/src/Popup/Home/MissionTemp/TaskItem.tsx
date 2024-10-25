// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type TaskItemType = {
  id: string;
  title: string;
  statusText: string;
  actionContent?: React.ReactNode;
  doAction?: VoidFunction;
  type: 'oneTime' | 'achievement';
  point: number;
  state: 'UNCOMPLETED' | 'CLAIMABLE' | 'COMPLETED'
};

type Props = ThemeProps & TaskItemType;

const Component = ({ actionContent, className,
  doAction,
  point,
  state,
  statusText,
  title,
  type }: Props): React.ReactElement => {
  return (
    <div className={CN(className, {
      '-not-completed': state !== 'COMPLETED',
      '-completed': state === 'COMPLETED'
    })}
    >
      <div className='__item-inner'>
        <div className='__item-left-part'>
          <div className='__title'>{title}</div>
          <div className={CN(
            '__status-text-wrapper',
            type === 'oneTime' ? '-style-2' : '-style-1')}
          >
            <div className='__status-text'>
              {statusText}
            </div>

            {
              state === 'COMPLETED' && (
                <div className={'__check-icon'}></div>
              )
            }
          </div>
        </div>
        <div className='__item-right-part'>
          {
            state !== 'COMPLETED' && !!actionContent && (
              <MythButton
                className={'__action-button'}
                onClick={doAction}
              >
                {actionContent}
              </MythButton>
            )
          }

          <div className='__point'>
            +{point}

            {
              state === 'CLAIMABLE' && (
                <div className={'__notice-icon'}></div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export const TaskItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    minHeight: 78,
    backgroundImage: 'url(/images/mythical/task-item/background.png)',
    backgroundPosition: 'center center',
    backgroundSize: '100% 100%',
    filter: 'drop-shadow(2px 2px 0px #000)',
    paddingLeft: 12,
    paddingTop: 12,
    paddingRight: 12,

    '.__item-inner': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__item-left-part': {
      flex: 1,
      overflow: 'hidden'
    },

    '.__title': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      textOverflow: 'ellipsis',
      color: token.colorWhite,
      overflow: 'hidden',
      'white-space': 'nowrap'
    },

    '.__status-text-wrapper': {
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden'
    },

    '.__status-text': {
      textTransform: 'uppercase',
      color: token.colorWhite,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      flexShrink: 1,
      paddingRight: 8
    },

    '.__check-icon': {
      minWidth: 20,
      height: 20,
      backgroundImage: 'url(/images/mythical/check-icon.png)',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      filter: 'drop-shadow(1.197px 1.197px 0px #000)'
    },

    '.__status-text-wrapper.-style-1': {
      marginTop: 8,

      '.__status-text': {
        fontFamily: extendToken.fontDruk,
        fontSize: '20px',
        fontStyle: 'italic',
        fontWeight: 500,
        lineHeight: '22px',
        letterSpacing: '-0.6px'
      }
    },

    '.__status-text-wrapper.-style-2': {
      '.__status-text': {
        fontFamily: extendToken.fontPermanentMarker,
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '20px'
      }
    },

    '.__item-right-part': {
      display: 'flex',
      gap: 8
    },

    '.__action-button': {
      minWidth: 57,
      height: 40,
      paddingLeft: 4,
      paddingRight: 2,

      '.__button-content': {
        color: extendToken.mythColorDark,
        paddingBottom: 6
      },

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/task-item/action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__point': {
      position: 'relative',
      textAlign: 'center',
      paddingLeft: 5,
      paddingRight: 3,
      paddingTop: 5,

      minWidth: 47,
      height: 39,
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      filter: 'drop-shadow(2px 2px 0px #000)',
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 700,
      lineHeight: '24px',
      letterSpacing: '-0.48px',
      textTransform: 'uppercase'
    },

    '.__notice-icon': {
      position: 'absolute',
      minWidth: 17,
      height: 17,
      backgroundImage: 'url(/images/mythical/notice-icon.png)',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      top: -9.5,
      right: -7
    },

    '&.-not-completed': {
      '.__point': {
        color: extendToken.mythColorDark,
        backgroundImage: 'url(/images/mythical/task-item/score-uncompleted.png)'
      }
    },

    '&.-completed': {
      '.__point': {
        color: extendToken.mythColorGray1,
        backgroundImage: 'url(/images/mythical/task-item/score-completed.png)'
      },

      '.__item-left-part, .__item-right-part': {
        opacity: 0.62
      }
    }
  };
});
