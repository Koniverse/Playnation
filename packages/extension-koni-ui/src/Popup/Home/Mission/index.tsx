// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountBlock } from '@subwallet/extension-koni-ui/components';
import { AirlyftConnector } from '@subwallet/extension-koni-ui/connector/airlyft';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { EnergyConfig, Task, TaskCategory, TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { TaskList } from '@subwallet/extension-koni-ui/Popup/Home/Mission/TaskList';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

function getTaskCategoryMap (taskCategories: TaskCategory[]): Record<number, TaskCategory> {
  const result: Record<number, TaskCategory> = {};

  taskCategories.forEach((tc) => {
    result[tc.id] = tc;
  });

  return result;
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
        completeCount: 0,
        tasks: []
      };
    }

    if (t.endTime && new Date(t.endTime).getTime() < now) {
      return;
    }

    if (t.completedAt) {
      result[t.categoryId].completeCount = result[t.categoryId].completeCount + 1;
    }

    result[t.categoryId].tasks.push(t);
  });

  Object.values(result).forEach((tci) => {
    tci.tasks.sort((a, b) => {
      const aDisabled = ((a.startTime && new Date(a.startTime).getTime() > now) || (a.endTime && new Date(a.endTime).getTime() < now));
      const bDisabled = ((b.startTime && new Date(b.startTime).getTime() > now) || (b.endTime && new Date(b.endTime).getTime() < now));

      if (aDisabled && !bDisabled) {
        return 1;
      }

      if (!aDisabled && bDisabled) {
        return -1;
      }

      if (a.completedAt && !b.completedAt) {
        return 1;
      }

      if (!a.completedAt && b.completedAt) {
        return -1;
      }

      return 0;
    });
  });

  return result;
}

const airlyftConnector = AirlyftConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskCategoryMap, setTaskCategoryMap] = useState<Record<number, TaskCategory>>({});
  const [taskCategoryInfoMap, setTaskCategoryInfoMap] = useState<Record<number, TaskCategoryInfo>>({});
  const [account, setAccount] = useState(apiSDK.account);
  const [energyConfig, setEnergyConfig] = useState<EnergyConfig | undefined>(apiSDK.energyConfig);
  const [reloadAccount, setReloadAccount] = useState<number>(0);
  const { setContainerClass } = useContext(HomeContext);
  const [isOpenWidget, setIsOpenWidget] = useState<boolean>(false);
  const [reloadTask, setReloadTask] = useState(0);

  useEffect(() => {
    airlyftConnector.openingModal.subscribe((modal) => {
      setIsOpenWidget((before) => {
        const after = !!modal;

        // on close modal
        if (before && !after) {
          setReloadTask((x) => x + 1);
        }

        return after;
      });
    });
  }, [isOpenWidget, reloadTask]);

  const actionReloadPoint = useCallback(() => {
    setReloadAccount(reloadAccount + 1);
  }, [reloadAccount]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const energyConfigSub = apiSDK.subscribeEnergyConfig().subscribe((data) => {
      setEnergyConfig(data);
    });

    return () => {
      accountSub.unsubscribe();
      energyConfigSub.unsubscribe();
    };
  }, [reloadAccount]);

  useEffect(() => {
    setTaskCategoryMap(getTaskCategoryMap(apiSDK.taskCategoryList));
    setTaskCategoryInfoMap(getTaskCategoryInfoMap(apiSDK.taskList));

    const taskCategoryListSub = apiSDK.subscribeTaskCategoryList().subscribe((data) => {
      setTaskCategoryMap(getTaskCategoryMap(data));
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
  }, [reloadTask]);

  useEffect(() => {
    setContainerClass('mission-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      <div className='game-account-block-wrapper'>
        <GameAccountBlock
          accountInfo={account}
          maxEnergy={energyConfig?.maxEnergy}
        />
      </div>

      <div className={'task-list-container'}>
        <TaskList
          actionReloadPoint={actionReloadPoint}
          openWidget={airlyftConnector.openTask}
          reloadTask={reloadTask}
          taskCategoryInfoMap={taskCategoryInfoMap}
          taskCategoryMap={taskCategoryMap}
        />
      </div>
    </div>
  );
};

const Mission = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    '.game-account-block-wrapper': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: token.paddingSM
    },

    '.task-list-container': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      overflow: 'auto',
      paddingBottom: 34
    }
  };
});

export default Mission;
