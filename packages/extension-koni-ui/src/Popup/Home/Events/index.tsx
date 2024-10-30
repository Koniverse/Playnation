// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import {EventItemType, MainScreenHeader} from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game, GameEvent } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isDesktop, isMobile } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const telegramConnector = TelegramConnector.instance;

import { EventListContainer } from './EventListContainer';
import { EventTab } from './shared';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/events');
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(EventTab.ALL_EVENTS);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>(apiSDK.gameEventList);
  const [gameList, setGameList] = useState<Game[]>(apiSDK.gameList);
  const [eventItems, setEventItems] = useState<EventItemType[]>([]);
  const gameIframe = useRef<HTMLIFrameElement>(null);
  const [currentGame, setCurrentGame] = useState<Game | undefined>(undefined);
  const [currentGameEvent, setCurrentGameEvent] = useState<GameEvent | undefined>(undefined);

  const exitGame = useCallback(() => {
    if (gameIframe.current) {
      gameIframe.current.style.opacity = '0';
    }

    setTimeout(() => {
      setCurrentGame(undefined);
    }, 600);
  }, []);

  const checkAccess = useCallback((game: Game) => {
    const restrictedAccess = game.restrictedAccess || [];

    if (restrictedAccess.length > 0) {
      if (isDesktop() && restrictedAccess.indexOf('desktop') > -1) {
        return false;
      }

      if (isMobile() && restrictedAccess.indexOf('mobile') > -1) {
        return false;
      }
    }

    return true;
  }, []);

  const onPlayEvent = useCallback((eventId: number) => {
    const gameEvent = gameEvents.find((event) => event.id === eventId);
    const game = gameEvent && gameList.find((game) => game.id === gameEvent.gameId);

    if (!game) {
      return;
    }

    if (!checkAccess(game)) {
      const alertContent = game.restrictedAccessText || 'This game is not available on your device';

      telegramConnector.showAlert(alertContent, () => {
        // Do nothing
      });

      return;
    }

    setCurrentGame(game);

    const checkInterval = setInterval(() => {
      if (gameIframe.current) {
        new GameApp({
          apiSDK,
          currentGameInfo: game,
          currentGameEvent: gameEvent,
          viewport: gameIframe.current,
          onExit: exitGame
        }).start();

        gameIframe.current.style.opacity = '1';

        clearInterval(checkInterval);
      }
    }, 30);

    setCurrentGame(game);
    setCurrentGameEvent(gameEvent);
  }, [checkAccess, exitGame, gameEvents, gameList]);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('All events'),
        value: EventTab.ALL_EVENTS
      },
      {
        label: t('Upcoming'),
        value: EventTab.UPCOMING
      },
      {
        label: t('Completed'),
        value: EventTab.COMPLETED
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  // const reloadGame = useCallback((slug: string) => {
  //   setCurrentGame(undefined);
  //
  //   apiSDK.fetchGameList().then(() => {
  //     const game = apiSDK.gameList.find((g) => g.slug === slug);
  //
  //     if (game) {
  //       playGame(game)();
  //     }
  //   }).catch(console.error);
  // }, [playGame]);

  // useEffect(() => {
  //   const currentGameSlug = currentGame?.slug;
  //
  //   if (!currentGameSlug) {
  //     return;
  //   }
  //
  //   const listener = (data: UpdateRecordPayload) => {
  //     const updateInfo = data.game?.find((g) => g.current?.slug === currentGameSlug);
  //
  //     if (updateInfo) {
  //       const currentVersion = updateInfo.current?.version || 0;
  //       const shouldUpdate = updateInfo.newVersion?.version && currentVersion < updateInfo.newVersion.version;
  //       const forceUpdate = updateInfo.newVersion?.minVersion && currentVersion < updateInfo.newVersion.minVersion;
  //       const updateMessage = updateInfo.updateMessage || 'New game version is available, update now!';
  //
  //       if (forceUpdate) {
  //         telegramConnector.showAlert(updateMessage, () => {
  //           reloadGame(currentGameSlug);
  //         });
  //       } else if (shouldUpdate) {
  //         telegramConnector.showConfirmation(updateMessage, (confirm) => {
  //           confirm && reloadGame(currentGameSlug);
  //         });
  //       }
  //     }
  //   };
  //
  //   metadataHandler.on('onUpdateRecordVersion', listener);
  //
  //   return () => {
  //     metadataHandler.off('onUpdateRecordVersion', listener);
  //   };
  // }, [currentGame, currentGame?.slug, reloadGame]);

  useEffect(() => {
    const gameListSub = apiSDK.subscribeGameList().subscribe((data) => {
      setGameList(data);
    });
    const gameEventListSub = apiSDK.subscribeGameEventList().subscribe((data) => {
      setGameEvents(data);
    });

    return () => {
      gameListSub.unsubscribe();
      gameEventListSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setContainerClass('events-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      <MainScreenHeader
        title={t('Events')}
      />

      {currentGame && currentGameEvent && <div className={'game-play'}>
        <iframe
          className={'game-iframe'}
          key={`gameplay-${currentGame.id}`}
          ref={gameIframe}
          src={currentGame.url}
        />
      </div>}

      <FilterTabs
        className={'filter-tabs-container'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedFilterTab}
      />

      <EventListContainer
        className={'event-list-container'}
        gameEvents={gameEvents}
        selectedTab={selectedFilterTab}
      />
    </div>
  );
};

const Event = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',

    '.game-iframe': {
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      position: 'fixed',
      border: 'none',
      zIndex: 999,
      backgroundColor: '#000'
    },

    '.filter-tabs-container': {
      marginBottom: 16
    },

    '.event-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingTop: 12,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 12
    }
  };
});

export default Event;
