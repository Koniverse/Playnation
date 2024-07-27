// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Game } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ChartBar, Lightning } from 'phosphor-react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  item: Game;
  onPlay: VoidFunction;
  onOpenLeaderboard: (game: Game) => void;
};

function Component ({ className, item, onOpenLeaderboard, onPlay }: Props) {
  const { t } = useTranslation();

  const _openLeaderboard = useCallback(() => {
    onOpenLeaderboard(item);
  }, [item, onOpenLeaderboard]);

  const isComingSoon = (() => {
    if (!item.startTime) {
      return false;
    }

    // Check coming soon by start time
    const gameStartTime = new Date(item.startTime).getTime();

    return gameStartTime > Date.now();
  })();

  return (
    <div className={CN(className, {
      '-is-coming-soon': isComingSoon
    })}
    >
      <div className='__left-part'>
        <div className='__game-name'>{isComingSoon ? t('Coming soon') : item.name}</div>
        <div className={'__energy-consume'}>
          <span className='__energy-consume-value-wrapper'>
            <Icon
              customSize={'12px'}
              phosphorIcon={Lightning}
              weight={'fill'}
            />
            <span className='__energy-consume-value'>
              {isComingSoon ? '--' : item.energyPerGame}
            </span>
          </span>
          <span className='__energy-consume-suffix'>
            / {t('game')}
          </span>
        </div>

        <div className={'__game-description'}>
          {isComingSoon ? '' : item.description}
        </div>

        <div className='__buttons'>
          <Button
            className={'__play-button'}
            disabled={isComingSoon}
            onClick={onPlay}
            shape={'round'}
            size={'xs'}
          >
            {t('Play now')}
          </Button>

          {
            // !isComingSoon && (
            //   <Button
            //     className={'-primary-3'}
            //     icon={(
            //       <Icon
            //         customSize={'20px'}
            //         phosphorIcon={ChartBar}
            //         weight={'fill'}
            //       />
            //     )}
            //     onClick={_openLeaderboard}
            //     shape={'circle'}
            //     size={'xs'}
            //   />
            // )
          }
        </div>

      </div>
      <div className='__right-part'>
        <div
          className={'__game-banner'}
          style={{ backgroundImage: `url("${item.banner}")` }}
        />
      </div>
    </div>
  );
}

export const GameCardItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    backgroundColor: token.colorWhite,
    borderRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    height: 184,

    '.__left-part': {
      flex: 1,
      paddingLeft: 20,
      paddingTop: 20,
      overflow: 'hidden'
    },

    '.__game-name': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      marginBottom: token.marginXXS
    },

    '.__energy-consume': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: token.marginXXS
    },

    '.__energy-consume-value-wrapper': {
      color: token.colorTextDark2
    },

    '.__energy-consume-value': {
      fontWeight: token.headingFontWeight
    },

    '.__energy-consume-suffix': {
      color: token.colorTextDark3
    },

    '.__game-description': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: token.marginSM,
      display: '-webkit-box',
      color: token.colorTextDark3,
      '-webkit-line-clamp': '2',
      '-webkit-box-orient': 'vertical',
      minHeight: 40,
      overflow: 'hidden'
    },

    '.__game-banner': {
      width: 192,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      height: '100%',
      clipPath: 'path("M23.1673 20.0267C25.1079 8.46694 35.1146 0 46.8362 0H191.641V184H24.006C9.1641 184 -2.11992 170.664 0.337191 156.027L23.1673 20.0267Z")'
    },

    '.__buttons': {
      display: 'flex',
      gap: token.sizeXS
    },

    '&.-is-coming-soon': {
      '.__game-banner': {
        filter: 'blur(8px)'
      }
    },

    '@media (max-width: 369px)': {
      '.__game-banner': {
        width: 160
      }
    }
  });
});

export default GameCardItem;
