// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task, TaskCategory, TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { TaskList } from '@subwallet/extension-koni-ui/Popup/Home/Mission/TaskList';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { TaskCategoryList } from './TaskCategoryList';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

enum ViewMode {
  CATEGORY_LIST = 'category_list',
  TASK_LIST = 'task_list',
}

function getTaskCategoryInfoMap (tasks: Task[]): Record<number, TaskCategoryInfo> {
  const result: Record<number, TaskCategoryInfo> = {};
  const now = Date.now();

  tasks.forEach((t) => {
    if (!t.categoryId) {
      return;
    }

    if (!result[t.categoryId]) {
      result[t.categoryId] = {
        id: t.categoryId,
        minPoint: t.pointReward || 0,
        tasks: [t]
      };
    } else {
      result[t.categoryId].tasks.push(t);

      if (t.completedAt || t.status > 0) {
        return;
      }

      if (t.startTime && (now < new Date(t.startTime).getTime())) {
        return;
      }

      if (t.endTime && (now >= new Date(t.endTime).getTime())) {
        return;
      }

      result[t.categoryId].minPoint += (t.pointReward || 0);
    }
  });

  return result;
}

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskCategoryList, setTaskCategoryList] = useState<TaskCategory[]>(apiSDK.taskCategoryList);
  const [taskCategoryInfoMap, setTaskCategoryInfoMap] = useState<Record<number, TaskCategoryInfo>>(getTaskCategoryInfoMap(apiSDK.taskList));
  const [account, setAccount] = useState(apiSDK.account);
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(ViewMode.CATEGORY_LIST);
  const [currentTaskCategory, setCurrentTaskCategory] = useState<number | undefined>();
  const [taskCategory, setTaskCategory] = useState<TaskCategory | undefined>();
  const [reloadAccount, setReloadAccount] = useState<number>(0);
  const [point, setPoint] = useState(account?.attributes.point || 0);

  const actionReloadPoint = useCallback(() => {
    setReloadAccount(reloadAccount + 1);
  }, [reloadAccount]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
      setPoint(data?.attributes.point || 0);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, [reloadAccount]);

  useEffect(() => {
    const taskCategoryListSub = apiSDK.subscribeTaskCategoryList().subscribe((data) => {
      setTaskCategoryList(data);
    });

    let taskListUpdaterInterval: NodeJS.Timer;

    const taskListSub = apiSDK.subscribeTaskList().subscribe((data) => {
      clearInterval(taskListUpdaterInterval);

      setTaskCategoryInfoMap(getTaskCategoryInfoMap(data));

      taskListUpdaterInterval = setInterval(() => {
        setTaskCategoryInfoMap(getTaskCategoryInfoMap(data));
      }, 10000);
    });

    return () => {
      taskCategoryListSub.unsubscribe();
      taskListSub.unsubscribe();
      clearInterval(taskListUpdaterInterval);
    };
  }, []);

  const onClickCategoryItem = useCallback((categoryId: number) => {
    setCurrentViewMode(ViewMode.TASK_LIST);
    setCurrentTaskCategory(categoryId);
    setTaskCategory(taskCategoryList.find((tc) => tc.id === categoryId));
  }, []);

  const onBackToCategoryList = useCallback(() => {
    setCurrentViewMode(ViewMode.CATEGORY_LIST);
    setCurrentTaskCategory(undefined);
  }, []);

  return <div className={className}>
    <div className={'task-list'}>
      {account && (
        <GameAccount
          avatar={account.info.photoUrl}
          className={'account-info'}
          name={`${account.info.firstName || ''} ${account.info.lastName || ''}`}
          point={point}
        />
      )}

      {
        currentViewMode === ViewMode.CATEGORY_LIST && (
          <TaskCategoryList
            onClickCategoryItem={onClickCategoryItem}
            taskCategoryInfoMap={taskCategoryInfoMap}
            taskCategoryList={taskCategoryList}
          />
        )
      }

      {
        currentViewMode === ViewMode.TASK_LIST && (
          <TaskList
            currentTaskCategory={currentTaskCategory}
            onBackToCategoryList={onBackToCategoryList}
            taskCategory={taskCategory}
            actionReloadPoint={actionReloadPoint}
            taskCategoryInfoMap={taskCategoryInfoMap}
          />
        )
      }
    </div>
  </div>;
};

const Mission = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.task-list': {
      padding: token.padding,

      '.account-info': {
        marginBottom: token.marginSM
      }
    }
  };
});

export default Mission;
