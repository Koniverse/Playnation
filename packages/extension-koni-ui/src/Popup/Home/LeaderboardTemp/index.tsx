// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, InfoIcon, MainScreenHeader, TimeRemaining } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardGroups, LeaderboardInfo, LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { LINK_NFL_APP_DOWNLOAD } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameAccountListArea } from '@subwallet/extension-koni-ui/Popup/Home/LeaderboardTemp/GameAccountListArea';
import { TERM_AND_CONDITION_MODAL_ID, TermAndConditionModal } from '@subwallet/extension-koni-ui/Popup/Home/LeaderboardTemp/TermAndConditionModal';
import { TopThreeArea } from '@subwallet/extension-koni-ui/Popup/Home/LeaderboardTemp/TopThreeArea';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { ModalContext, Skeleton } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
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
  const { activeModal, inactiveModal } = useContext(ModalContext);

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

    if (currentLeaderboardInfo) {
      setIsLoading(true);

      apiSDK.fetchLeaderboard(currentLeaderboardInfo.id, {})
        .then((data) => {
          if (!isSync) {
            return;
          }

          setLeaderboardPersonItems(data.results);
          setLeaderboardInfo(data.filter);
        })
        .catch((e) => console.log('apiSDK.fetchLeaderboard error', e))
        .finally(() => {
          if (isSync) {
            setIsLoading(false);
          }
        });
    }

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

  const openTermAndConditionModal = useCallback(() => {
    activeModal(TERM_AND_CONDITION_MODAL_ID);
  }, [activeModal]);

  const closeTermAndConditionModal = useCallback(() => {
    inactiveModal(TERM_AND_CONDITION_MODAL_ID);
  }, [inactiveModal]);

  const openAppStoreLink = useCallback(() => {
    openInNewTab(LINK_NFL_APP_DOWNLOAD)();
  }, []);

  return (
    <div className={className}>
      <MainScreenHeader
        className={'main-screen-header'}
        rightPartNode={
          (
            <button
              className={'info-button hidden'}
              onClick={openTermAndConditionModal}
            >
              <InfoIcon />
            </button>
          )
        }
        title={currentLeaderboardInfo?.name || t('Leaderboard')}
      />

      {
        <div className='time-remaining-wrapper'>
          <TimeRemaining
            endTime={leaderboardInfo?.endTimeTs ? new Date(leaderboardInfo?.endTimeTs).toString() : undefined}
          />
        </div>}

      <div className='scroll-container'>
        <TopThreeArea
          className={'top-three-area'}
          isLoading={isLoading}
          leaderboardPersonItems={leaderboardPersonItems}
        />
        {isLoading
          ? (
            <Skeleton.Input
              active={true}
              className={'skeleton-banner'}
              size={'large'}
              style={{
                width: '100%',
                height: 83
              }}
            />
          )
          : (
            <CallToAction
              buttonLabel={'Play now'}
              className={'call-to-action'}
              onAction={openAppStoreLink}
              subtitle={'Download NFL Rivals App'}
              title={'Want to get to the big league?'}
            />
          )}

        {isLoading
          ? (
            <div className='skeleton-list-wrapper'>
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton.Input
                  active={true}
                  className='skeleton-list-item'
                  key={index}
                  size='small'
                />
              ))}
            </div>
          )
          : (
            <GameAccountListArea
              isLoading={isLoading}
              leaderboardPersonItems={leaderboardPersonItems}
            />
          )}
      </div>

      <TermAndConditionModal
        onCancel={closeTermAndConditionModal}
        onOk={closeTermAndConditionModal}
      />
    </div>
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    height: '100%',

    '.skeleton-list-item': {
      display: 'block !important',
      height: '54px !important',

      '&.ant-skeleton': {
        marginLeft: 8,
        marginRight: 8
      },

      '.ant-skeleton-input': {
        width: '100% !important'
      }
    },

    '.skeleton-list-item + .skeleton-list-item': {
      marginTop: 4
    },

    '.skeleton-banner': {
      display: 'block !important',
      height: '83px !important',

      '&.ant-skeleton': {
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 12
      },

      '.ant-skeleton-input': {
        width: '100% !important'
      }
    },

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
