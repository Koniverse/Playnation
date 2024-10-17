// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { EventDifficulty, EventItem, EventItemHelper, EventStatus } from '@subwallet/extension-koni-ui/components/Mythical';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

// note: this is for mocking, will remove on production
type EventItemType = {
  id: string;
  difficulty: EventDifficulty;
  status: EventStatus;
};

const eventItemButtonMaskId = 'event-item-button-mask';

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/events');
  const { setContainerClass } = useContext(HomeContext);

  const { t } = useTranslation();
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(EventStatus.READY);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('All events'),
        value: EventStatus.READY
      },
      {
        label: t('Upcoming'),
        value: EventStatus.COMING_SOON
      },
      {
        label: t('Completed'),
        value: EventStatus.COMPLETED
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const eventItems: EventItemType[] = useMemo(() => {
    return [
      {
        id: '1',
        difficulty: EventDifficulty.EASY,
        status: selectedFilterTab
      },
      {
        id: '2',
        difficulty: EventDifficulty.MEDIUM,
        status: selectedFilterTab
      },
      {
        id: '3',
        difficulty: EventDifficulty.HARD,
        status: selectedFilterTab
      }
    ] as EventItemType[];
  }, [selectedFilterTab]);

  useEffect(() => {
    setContainerClass('events-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      <FilterTabs
        className={'filter-tabs-container'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedFilterTab}
      />

      <EventItemHelper
        buttonSvgMaskId={eventItemButtonMaskId}
      />

      <div className='event-list-container'>
        {
          eventItems.map((item) => (
            <EventItem
              buttonSvgMaskId={eventItemButtonMaskId}
              className={'event-item'}
              difficulty={item.difficulty}
              key={item.id}
              status={item.status}
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
    backgroundColor: '#000',

    '.event-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 34
    },

    '.event-item + .event-item': {
      marginTop: 12
    }
  };
});

export default Event;
