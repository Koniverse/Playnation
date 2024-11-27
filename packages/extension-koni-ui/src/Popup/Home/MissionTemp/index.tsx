// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterTabItemType, FilterTabs } from '@subwallet/extension-koni-ui/components/FilterTabs';
import { CallToAction, MainScreenHeader, TimeRemaining } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement, Task, TaskCategory, TaskCategoryType } from '@subwallet/extension-koni-ui/connector/booka/types';
import { LINK_NFL_APP_DOWNLOAD } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import MissionSectionListContainer from './MissionSectionListContainer';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const { setBackgroundStyle } = useContext(HomeContext);
  const { t } = useTranslation();
  const [accountInfo, setAccountInfo] = useState(apiSDK.account);
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(apiSDK.taskCategoryList);
  const [tasks, setTasks] = useState<Task[]>(apiSDK.taskList);
  const [achievements, setAchievements] = useState<Achievement[]>(apiSDK.achievementList);
  const [selectedFilterTab, setSelectedFilterTab] = useState<string>(TaskCategoryType.DAILY);
  const [metadata, setMetadata] = useState(apiSDK.getMetadata());
  const [serverTime, setServerTime] = useState<number>(apiSDK.serverTime);

  const filterTabItems = useMemo<FilterTabItemType[]>(() => {
    return [
      {
        label: t('Daily'),
        value: TaskCategoryType.DAILY
      },
      {
        label: t('Weekly'),
        value: TaskCategoryType.WEEKLY
      },
      {
        label: t('Featured'),
        value: TaskCategoryType.FEATURED
      }
    ];
  }, [t]);

  const onSelectFilterTab = useCallback((value: string) => {
    setSelectedFilterTab(value);
  }, []);

  const openAppStoreLink = useCallback(() => {
    openInNewTab(LINK_NFL_APP_DOWNLOAD)();
  }, []);

  const endTime = useMemo(() => {
    if (selectedFilterTab === TaskCategoryType.DAILY && metadata?.timeRange?.daily) {
      return new Date(metadata?.timeRange?.daily?.end).toString();
    } else if (selectedFilterTab === TaskCategoryType.WEEKLY && metadata?.timeRange?.weekly) {
      return new Date(metadata?.timeRange?.weekly?.end).toString();
    } else {
      return undefined;
    }
  }, [metadata?.timeRange, selectedFilterTab]);

  useEffect(() => {
    const timeSub = apiSDK.subscribeServerTime().subscribe((time) => {
      setServerTime(time);
    });

    return () => {
      timeSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setBackgroundStyle('style-2');

    return () => {
      setBackgroundStyle(undefined);
    };
  }, [setBackgroundStyle]);

  useEffect(() => {
    const metadataSub = apiSDK.subscribeMetadata().subscribe((data) => {
      setMetadata(data);
    });
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccountInfo(data);
    });

    return () => {
      metadataSub.unsubscribe();
      accountSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const taskCategoryListSub = apiSDK.subscribeTaskCategoryList().subscribe((data) => {
      setTaskCategories(data);
    });
    const taskListSubjectSub = apiSDK.subscribeTaskList().subscribe((data) => {
      setTasks(data);
    });
    const achievementListSub = apiSDK.subscribeAchievementList().subscribe((data) => {
      setAchievements(data);
    });

    apiSDK.fetchTaskCategoryList().catch(console.error);
    apiSDK.fetchTaskList().catch(console.error);
    apiSDK.fetchAchievementList().catch(console.error);

    return () => {
      taskCategoryListSub.unsubscribe();
      taskListSubjectSub.unsubscribe();
      achievementListSub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>
      <MainScreenHeader
        title={t('Tasks')}
      />

      <FilterTabs
        className={'filter-tabs-container'}
        items={filterTabItems}
        onSelect={onSelectFilterTab}
        selectedItem={selectedFilterTab}
      />

      {endTime && <div className='time-remaining-wrapper'>
        <TimeRemaining endTime={endTime} />
      </div>}

      <MissionSectionListContainer
        accountInfo={accountInfo}
        achievements={achievements}
        className={'task-section-list-container'}
        endTime={serverTime}
        selectedTab={selectedFilterTab as TaskCategoryType}
        taskCategories={taskCategories}
        tasks={tasks}
      />

      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        onAction={openAppStoreLink}
        subtitle={'Download NFL Rivals App'}
        title={'Want to score more points?'}
      />
      <div className={'__padding-area'}></div>
    </div>
  );
};

const MissionTemp = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',

    '.filter-tabs-container': {
      marginBottom: 24
    },

    '.time-remaining-wrapper': {
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 24
    },

    '.task-section-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingBottom: 12
    },

    '.call-to-action': {
      marginBottom: 12,
      zIndex: 10
    },

    '.__padding-area': {
      position: 'fixed',
      zIndex: 1,
      height: 21,
      width: '100%',
      bottom: 85,
      backgroundColor: '#000'
    }
  };
});

export default MissionTemp;
