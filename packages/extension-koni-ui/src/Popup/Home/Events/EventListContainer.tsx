// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EventDifficulty, EventItem, EventItemType, EventState } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameEvent } from '@subwallet/extension-koni-ui/connector/booka/types';
import { EventTab } from '@subwallet/extension-koni-ui/Popup/Home/Events/shared';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  gameEvents: GameEvent[];
  selectedTab: string;
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

// todo: update logic for ongoing event (filter the completed game)
function isEventOngoing (gameEvent: GameEvent, dateNow: number): boolean {
  const startTime = new Date(gameEvent.startTime).getTime();
  const endTime = new Date(gameEvent.endTime).getTime();

  return dateNow < endTime && dateNow >= startTime;
}

function isEventUpcoming (gameEvent: GameEvent, dateNow: number): boolean {
  const startTime = new Date(gameEvent.startTime).getTime();

  return dateNow < startTime;
}

// todo: update logic for completed event (with score)
function isEventCompleted (gameEvent: GameEvent, dateNow: number): boolean {
  return gameEvent.gamePlays?.length >= gameEvent.tossUpInfo.gameplayPerEvent;
}

function getEventState (gameEvent: GameEvent, dateNow: number): EventState {
  if (isEventCompleted(gameEvent, dateNow)) {
    return EventState.COMPLETED;
  }

  if (isEventOngoing(gameEvent, dateNow)) {
    return EventState.AVAILABLE;
  }

  if (isEventUpcoming(gameEvent, dateNow)) {
    return EventState.COMING_SOON;
  }

  return EventState.UNKNOWN;
}

function getTimeRemaining (dateNow: number, targetTime: string): string {
  const end = new Date(targetTime).getTime();
  const diff = end - dateNow;

  if (diff <= 0) {
    return "Time's up!";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const dayLabel = days === 1 ? 'day' : 'days';
  const hourLabel = hours === 1 ? 'hr' : 'hrs';
  const minuteLabel = minutes === 1 ? 'minute' : 'minutes';

  if (days > 0) {
    return `${days} ${dayLabel} ${hours} ${hourLabel}`;
  } else if (hours > 0) {
    return `${hours} ${hourLabel} ${minutes} ${minuteLabel}`;
  } else {
    return `0 hr ${minutes} ${minuteLabel}`;
  }
}

const Component = ({ className, gameEvents, onPlayEvent, selectedTab }: Props): React.ReactElement => {
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

      _completedItems.sort((a: GameEvent, b: GameEvent) => {
        // most recently completed events appear first
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      });

      return [
        ..._completedItems
      ];
    }

    return [];
  }, [gameEvents, selectedTab]);

  const getEventItems = useCallback(() => {
    const dateNow = Date.now();

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
          return customFormatDate(eventInfo.endTime, '#MM#/#DD#/#YY# #hh#:#mm#');
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
        onPlayEvent
      });
    });

    return result;
  }, [getProcessedGameEvents, onPlayEvent]);

  useEffect(() => {
    setEventItems(getEventItems());

    const timer = setInterval(() => {
      setEventItems(getEventItems());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [getEventItems]);

  return (
    <div className={className}>
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
  );
};

export const EventListContainer = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.event-item + .event-item': {
      marginTop: 12
    }
  };
});
