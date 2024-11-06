// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, GameAccountItem, InfoIcon, MainScreenHeader, TimeRemaining, TopAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/GameAccountItem';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { t } = useTranslation();

  const mockItems = useMemo(() => {
    const mineOrdinal = 100;

    const mineItem: GameAccountItemType = {
      avatarSrc: '/images/mythical/user-image.png',
      isMine: true,
      name: 'Brad_MaddenMaster',
      point: 7712000,
      prefix: `${mineOrdinal}`.padStart(2, '0')
    };

    const result: GameAccountItemType[] = [];

    for (let i = mineOrdinal - 20; i < mineOrdinal; i++) {
      result.push({
        avatarSrc: '/images/mythical/user-image.png',
        name: `Brad_MaddenMaster_${i}`,
        point: 7712000,
        prefix: `${i}`.padStart(2, '0')
      });
    }

    result.push(mineItem);

    for (let i = mineOrdinal + 1; i <= mineOrdinal + 20; i++) {
      result.push({
        avatarSrc: '/images/mythical/user-image.png',
        name: `Brad_MaddenMaster_${i}`,
        point: 7712000,
        prefix: `${i}`.padStart(2, '0')
      });
    }

    return result;
  }, []);

  return (
    <div className={className}>
      <MainScreenHeader
        className={'main-screen-header'}
        rightPartNode={
          (
            <button
              className={'info-button'}
            >
              <InfoIcon />
            </button>
          )
        }
        title={t('Weekly leaderboard')}
      />

      <div className='time-remaining-wrapper'>
        <TimeRemaining endTime={'2024-12-24T17:00:00.000Z'} />
      </div>

      <div className='scroll-container'>
        <div className='top-three-area'>
          <div className='top-account-item-wrapper'>
            {
              <TopAccountItem
                point={8712762}
                rank={2}
                tokenValue={762}
              />
            }
          </div>
          <div className='top-account-item-wrapper -is-first'>
            {
              <TopAccountItem
                isFirst
                point={9712762}
                rank={1}
                tokenValue={762}
              />
            }
          </div>
          <div className='top-account-item-wrapper'>
            {
              <TopAccountItem
                point={8212762}
                rank={3}
                tokenValue={762}
              />
            }
          </div>
        </div>

        <CallToAction
          buttonLabel={'Play now'}
          className={'call-to-action'}
          subtitle={'Download NFL Rivals App'}
          title={'Want to take your profile to the next level?'}
        />

        {
          mockItems.map((item) => (
            <GameAccountItem
              {...item}
              className={'game-account-item'}
              key={item.prefix}
            />
          ))
        }
      </div>
    </div>
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '100%',

    '.main-screen-header': {
      '.__screen-title': {
        maxWidth: 250,
        fontSize: 28,
        lineHeight: '34px'
      }
    },

    '.info-button': {
      minWidth: 32,
      height: 32,
      padding: 0,
      backgroundColor: 'transparent',
      border: 0,
      fontSize: 32,
      color: extendToken.mythColorGray1,
      cursor: 'pointer'
    },

    '.time-remaining-wrapper': {
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 12
    },

    '.scroll-container': {
      flex: 1,
      overflow: 'auto',
      paddingTop: 8
    },

    '.top-account-item-wrapper': {
      flex: 1,
      overflow: 'hidden',
      minWidth: 94
    },

    '.top-account-item-wrapper.-is-first': {
      flex: '0 1 auto',
      minWidth: 123
    },

    '.top-three-area': {
      display: 'flex',
      alignItems: 'flex-end',
      paddingLeft: 24,
      paddingRight: 24,
      gap: 8,
      paddingBottom: token.size
    },

    '.call-to-action': {
      marginBottom: 12
    },

    '.game-account-item + .game-account-item': {
      marginTop: 4
    },

    '.game-account-item.-is-mine': {
      position: 'sticky',
      bottom: 4,
      top: 0,
      zIndex: 5
    }
  };
});

export default Leaderboard;
