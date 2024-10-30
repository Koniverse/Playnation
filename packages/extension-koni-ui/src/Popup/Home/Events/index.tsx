// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { GameEvent } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { EventListContainer } from './EventListContainer';
import { EventTab } from './shared';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/events');
  const { setContainerClass } = useContext(HomeContext);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>(apiSDK.gameEventList);

  const { t } = useTranslation();
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(EventTab.ALL_EVENTS);

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
