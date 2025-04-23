// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyListContent, EventDifficulty, EventItem, EventItemType, EventState } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameEvent } from '@subwallet/extension-koni-ui/connector/booka/types';
import { EventTab } from '@subwallet/extension-koni-ui/Popup/Home/Events/shared';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, getTimeRemaining } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  gameEvents: GameEvent[];
  selectedTab: string;
  serverTime: number;
  onPlayEvent: (eventID: number) => void;
};

function getEventDifficult (difficult: number): EventDifficulty {
  if (difficult <= 10 && difficult >= 7) {
    return EventDifficulty.HARD;
  }

  if (difficult <= 6 && difficult >= 4) {
    return EventDifficulty.MEDIUM;
  }

  return EventDifficulty.EASY;
}

function isEventExpired (gameEvent: GameEvent, dateNow: number): boolean {
  const endTime = new Date(gameEvent.endTime).getTime();

  return dateNow >= endTime && (!gameEvent.gamePlays || ((gameEvent.gamePlays?.length || 0) < (gameEvent.tossUpInfo?.gameplayPerEvent || 1)));
}

function isEventCompleted (gameEvent: GameEvent, dateNow: number): boolean {
  const endTime = new Date(gameEvent.endTime).getTime();

  // Completed when:
  // - The user continues playing and finishes all required Rounds of the Event and gamePlay is finished
  // - The user stops playing but the Event has expired and the event will be marked as completed at the moment the event expires.

  if (dateNow >= endTime) {
    return true;
  }

  const lastGamePlay = gameEvent.gamePlays?.length ? gameEvent.gamePlays[gameEvent.gamePlays.length - 1] : undefined;

  if (lastGamePlay) {
    const stateGameData = lastGamePlay.stateData as { state: string };

    if (stateGameData.state === 'finished') {
      return true;
    }
  }

  return false;
}

function isEventOngoing (gameEvent: GameEvent, dateNow: number): boolean {
  if (isEventCompleted(gameEvent, dateNow)) {
    return false;
  }

  const startTime = new Date(gameEvent.startTime).getTime();
  const endTime = new Date(gameEvent.endTime).getTime();

  return dateNow < endTime && dateNow >= startTime;
}

function isEventRemuse (gameEvent: GameEvent, dateNow: number): boolean {
  if (!isEventOngoing(gameEvent, dateNow)) {
    return false;
  }

  const lastGamePlay = gameEvent.gamePlays?.length ? gameEvent.gamePlays[gameEvent.gamePlays.length - 1] : undefined;

  if (lastGamePlay) {
    const stateGameData = lastGamePlay.stateData as { state: string };

    if (stateGameData.state === 'finished') {
      return false;
    } else {
      return true;
    }
  }

  return false;
}

function isEventUpcoming (gameEvent: GameEvent, dateNow: number): boolean {
  const startTime = new Date(gameEvent.startTime).getTime();

  return dateNow < startTime;
}

function getEventState (gameEvent: GameEvent, dateNow: number): EventState {
  if (isEventCompleted(gameEvent, dateNow)) {
    return EventState.COMPLETED;
  }

  if (isEventOngoing(gameEvent, dateNow)) {
    if (isEventRemuse(gameEvent, dateNow)) {
      return EventState.RESUME;
    }

    return EventState.AVAILABLE;
  }

  if (isEventUpcoming(gameEvent, dateNow)) {
    return EventState.COMING_SOON;
  }

  return EventState.UNKNOWN;
}

function getEventGameEndTime (gameEvent: GameEvent) {
  const latestGamePlay = gameEvent.gamePlays?.length ? gameEvent.gamePlays[gameEvent.gamePlays.length - 1] : undefined;

  if (latestGamePlay) {
    return latestGamePlay.endTime || latestGamePlay.startTime;
  }

  return gameEvent.endTime;
}

const Component = ({ className, gameEvents, onPlayEvent, selectedTab, serverTime }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [eventItems, setEventItems] = useState<EventItemType[]>([]);

  // get gameEvents that is sorted and filtered
  const getProcessedGameEvents = useCallback((dateNow: number): GameEvent[] => {
    const sortUpcoming = (a: GameEvent, b: GameEvent) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    };

    // user chooses tab "ALL EVENTS"
    if (selectedTab === EventTab.ALL_EVENTS) {
      const _ongoingItems: GameEvent[] = [];
      const _upcomingItems: GameEvent[] = [];

      gameEvents.forEach((gameEvent: GameEvent) => {
        if (isEventOngoing(gameEvent, dateNow)) {
          _ongoingItems.push(gameEvent);
        } else if (isEventUpcoming(gameEvent, dateNow)) {
          _upcomingItems.push(gameEvent);
        }
      });

      _ongoingItems.sort((a: GameEvent, b: GameEvent) => {
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });

      _upcomingItems.sort(sortUpcoming);

      return [
        ..._ongoingItems,
        ..._upcomingItems
      ];
    }

    // user chooses tab "UPCOMING"
    if (selectedTab === EventTab.UPCOMING) {
      const _upcomingItems: GameEvent[] = [];

      gameEvents.forEach((gameEvent: GameEvent) => {
        if (isEventUpcoming(gameEvent, dateNow)) {
          _upcomingItems.push(gameEvent);
        }
      });

      _upcomingItems.sort(sortUpcoming);

      return [
        ..._upcomingItems
      ];
    }

    // user chooses "COMPLETED"
    if (selectedTab === EventTab.COMPLETED) {
      const _completedItems: GameEvent[] = [];

      gameEvents.forEach((gameEvent: GameEvent) => {
        if (isEventCompleted(gameEvent, dateNow)) {
          _completedItems.push(gameEvent);
        }
      });

      // console.log("_completedItems: ", _completedItems);
      _completedItems.sort((a: GameEvent, b: GameEvent) => {
        // most recently completed events appear first
        return new Date(getEventGameEndTime(b)).getTime() - new Date(getEventGameEndTime(a)).getTime();
      });

      return [
        ..._completedItems
      ];
    }

    return [];
  }, [gameEvents, selectedTab]);

  const getEventItems = useCallback(() => {
    const dateNow = serverTime;

    const result: EventItemType[] = [];
    const processedGameEvents = getProcessedGameEvents(dateNow);

    processedGameEvents.forEach((eventInfo) => {
      const eventState = getEventState(eventInfo, dateNow);

      const datetime = (() => {
        if (eventState === EventState.COMING_SOON) {
          return getTimeRemaining(dateNow, eventInfo.startTime);
        }

        if (eventState === EventState.AVAILABLE) {
          return getTimeRemaining(dateNow, eventInfo.endTime);
        }

        if (eventState === EventState.COMPLETED) {
          return customFormatDate(getEventGameEndTime(eventInfo), '#MM#/#DD#/#YY# #hhhh#:#mm#');
        }

        if (eventState === EventState.RESUME) {
          return getTimeRemaining(dateNow, eventInfo.endTime);
        }

        return '---';
      })();

      const score = (() => {
        if (eventState === EventState.COMPLETED && eventInfo.gamePlays) {
          return eventInfo.gamePlays.reduce((totalScore, game) => {
            return totalScore + (game.point || 0);
          }, 0);
        }

        return undefined;
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
        onPlayEvent,
        isExpired: isEventExpired(eventInfo, dateNow),
        score
      });
    });

    return result;
  }, [getProcessedGameEvents, onPlayEvent, serverTime]);

  useEffect(() => {
    setEventItems(getEventItems());
  }, [getEventItems]);

  return (
    <div className={className}>
      {
        !eventItems.length && (
          <EmptyListContent
            className={'empty-list-content'}
            content={t('Look for ongoing events in the “All Events” tab')}
            title={t('oops! no events found')}
          />
        )
      }

      {
        !!eventItems.length && eventItems.map((item) => (
          <EventItem
            {...item}
            className={'event-item'}
            key={item.id}
          />
        ))
      }
    </div>
  );
};

export const EventListContainer = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.empty-list-content': {
      paddingTop: 136
    },

    '.event-item + .event-item': {
      marginTop: 12
    }
  };
});
