// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { EventDifficulty, EventItem, EventItemType, EventState, MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { GameEvent } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
  const { setContainerClass } = useContext(HomeContext);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>(apiSDK.gameEventList);

  console.log('gameEvents', gameEvents);

  const [eventItems, setEventItems] = useState<EventItemType[]>([]);

  const { t } = useTranslation();
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(EventState.AVAILABLE);

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
        name: eventInfo.name
      });
    });

    return result;
  }, [gameEvents, selectedFilterTab]);

  useEffect(() => {
    setEventItems(getEventItems());

    const timer = setInterval(() => {
      setEventItems(getEventItems());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [getEventItems, setContainerClass]);

  useEffect(() => {
    const gameEventListSub = apiSDK.subscribeGameEventList().subscribe((data) => {
      setGameEvents(data);
    });

    return () => {
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
