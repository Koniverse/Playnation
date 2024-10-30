// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { EventDifficulty, EventItem, EventItemType, EventState, MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
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

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

function getEventDifficult (difficult: number): EventDifficulty {
  if (difficult <= 10 && difficult >= 7) {
    return EventDifficulty.HARD;
  }

  if (difficult <= 6 && difficult >= 4) {
    return EventDifficulty.HARD;
  }

  return EventDifficulty.EASY;
}

function getEventState (gameEvent: GameEvent, dateNow: number): EventState {
  const startTime = new Date(gameEvent.startTime).getTime();
  const endTime = new Date(gameEvent.endTime).getTime();

  if (dateNow < startTime) {
    return EventState.COMING_SOON;
  }

  if (dateNow < endTime && dateNow >= startTime) {
    return EventState.AVAILABLE;
  }

  return EventState.UNKNOWN;
}

function getTimeRemaining (dateNow: number, targetTime: string) {
  const end = new Date(targetTime).getTime();
  const diff = end - dateNow;

  if (diff <= 0) {
    return '---';
  }

  let days = Math.floor(diff / (1000 * 60 * 60 * 24));
  let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // Adjust hours to ensure it’s always less than 24
  if (hours === 24) {
    days += 1;
    hours = 0;
  }

  const dayLabel = days === 1 ? 'day' : 'days';
  const hourLabel = hours === 1 ? 'hr' : 'hrs';

  if (days > 0) {
    return `${days} ${dayLabel} ${hours} ${hourLabel}`;
  } else {
    return `${hours} ${hourLabel}`;
  }
}

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/events');
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(EventState.AVAILABLE);
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
        value: EventState.AVAILABLE
      },
      {
        label: t('Upcoming'),
        value: EventState.COMING_SOON
      },
      {
        label: t('Completed'),
        value: EventState.COMPLETED
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const getEventItems = useCallback(() => {
    const dateNow = Date.now();

    const result: EventItemType[] = [];

    gameEvents.forEach((eventInfo) => {
      const eventState = getEventState(eventInfo, dateNow);

      if (selectedFilterTab !== eventState) {
        return;
      }

      const datetime = (() => {
        if (eventState === EventState.COMING_SOON) {
          return getTimeRemaining(dateNow, eventInfo.startTime);
        }

        if (eventState === EventState.AVAILABLE) {
          return getTimeRemaining(dateNow, eventInfo.endTime);
        }

        return '---';
      })();

      result.push({
        id: eventInfo.id,
        difficulty: getEventDifficult(eventInfo.tossUpInfo.difficulty),
        state: eventState,
        stats: eventInfo.tossUpInfo.stats,
        round: eventInfo.tossUpInfo.round,
        logoSrc: eventInfo.icon,
        datetime,
        bonusText: eventInfo.description,
        name: eventInfo.name,
        onPlayEvent: onPlayEvent
      });
    });

    return result;
  }, [gameEvents, onPlayEvent, selectedFilterTab]);

  useEffect(() => {
    setEventItems(getEventItems());

    const timer = setInterval(() => {
      setEventItems(getEventItems());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [getEventItems, setContainerClass]);

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

      <div className='event-list-container'>
        {
          eventItems.map((item) => (
            <EventItem
              {...item}
              className={'event-item'}
              key={item.id}
            />
          ))
        }
      </div>
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
    },

    '.event-item + .event-item': {
      marginTop: 12
    }
  };
});

export default Event;
