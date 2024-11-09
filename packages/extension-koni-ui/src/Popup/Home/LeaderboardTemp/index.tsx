// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, InfoIcon, MainScreenHeader, TimeRemaining } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardGroups, LeaderboardInfo, LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameAccountListArea } from '@subwallet/extension-koni-ui/Popup/Home/LeaderboardTemp/GameAccountListArea';
import { TopThreeArea } from '@subwallet/extension-koni-ui/Popup/Home/LeaderboardTemp/TopThreeArea';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [leaderboardConfig, setLeaderboardConfig] = useState(apiSDK.leaderboardConfig);
  const [currentLeaderboardInfo, setCurrentLeaderboardInfo] = useState<LeaderboardInfo | undefined>(undefined);
  const [leaderboardPersonItems, setLeaderboardPersonItems] = useState<LeaderboardPerson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leaderboardInfo, setLeaderboardInfo] = useState<LeaderboardInfo | undefined>(undefined);

  useEffect(() => {
    const subscriptionLeaderboard = apiSDK.subscribeLeaderboardConfig().subscribe((data) => {
      setLeaderboardConfig(data);
    });

    return () => {
      subscriptionLeaderboard.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getCurrentLeaderboardInfo = () => {
      const leaderboardGeneral = leaderboardConfig.leaderboard_general as unknown as LeaderboardGroups[];
      const leaderboards = leaderboardConfig.leaderboard_map as unknown as LeaderboardInfo[];

      if (leaderboardGeneral && leaderboards) {
        const firstLeaderboardGroups = leaderboardGeneral[0];

        if (!firstLeaderboardGroups || !firstLeaderboardGroups.leaderboards.length) {
          return undefined;
        }

        return leaderboards.find((l) => l.id === firstLeaderboardGroups.leaderboards[0]?.id);
      }

      return undefined;
    };

    setCurrentLeaderboardInfo(getCurrentLeaderboardInfo);
  }, [leaderboardConfig.leaderboard_general, leaderboardConfig.leaderboard_map]);

  useEffect(() => {
    let isSync = true;

    setIsLoading(true);

    currentLeaderboardInfo && apiSDK.fetchLeaderboard(currentLeaderboardInfo.id, {})
      .then((data) => {
        if (!isSync) {
          return;
        }

        setLeaderboardPersonItems(data.results);
        setLeaderboardInfo(data.filter);

        setIsLoading(false);
      })
      .catch(() => console.log('error'));

    return () => {
      isSync = false;
    };
  }, [currentLeaderboardInfo]);

  useEffect(() => {
    setContainerClass('leaderboard-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

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
        title={currentLeaderboardInfo?.name || t('Leaderboard')}
      />

      {leaderboardInfo?.endTimeTs && leaderboardInfo?.specialTime && <div className='time-remaining-wrapper'>
        <TimeRemaining endTime={new Date(leaderboardInfo.endTimeTs).toString()} />
      </div>}

      <div className='scroll-container'>
        <TopThreeArea
          className={'top-three-area'}
          isLoading={isLoading}
          leaderboardPersonItems={leaderboardPersonItems}
        />

        <CallToAction
          buttonLabel={'Play now'}
          className={'call-to-action'}
          subtitle={'Download NFL Rivals App'}
          title={'Want to take your profile to the next level?'}
        />

        <GameAccountListArea
          isLoading={isLoading}
          leaderboardPersonItems={leaderboardPersonItems}
        />
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

    '.top-three-area': {
      paddingLeft: 24,
      paddingRight: 24,
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
