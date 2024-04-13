// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Image } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskList, setTaskList] = useState<Task[]>(apiSDK.taskList);
  const [account, setAccount] = useState(apiSDK.account);
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});

  const finishTask = useCallback((taskId: number) => {
    return () => {
      setTaskLoading((prev) => ({
        ...prev,
        [taskId]: true
      }));
      apiSDK.finishTask(taskId)
        .finally(() => {
          setTaskLoading((prev) => ({
            ...prev,
            [taskId]: false
          }));
        })
        .catch(console.error);
    };
  }, []);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const taskListSub = apiSDK.subscribeTaskList().subscribe((data) => {
      setTaskList(data);
    });

    return () => {
      accountSub.unsubscribe();
      taskListSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <div>
      <h1>Account Information</h1>
      <p>Energy: {account.attributes.energy}</p>
      <p>Point: {account.attributes.point}</p>
    </div>}
    <div className={'task-list'}>
      <h1>Tasks</h1>
      {taskList.map((task) => (<div
        className={'task-item'}
        key={task.id}
      >
        <Image
          className={'task-banner'}
          src={task.icon}
          width={36}
        ></Image>
        <h3 className={'game-title'}>{task.name}</h3>
        <Button
          className={'play-button'}
          disabled={!!(task.status && task.status > 0)}
          loading={taskLoading[task.id]}
          onClick={finishTask(task.id)}
          size={'sm'}
        >{`Claim ${task.pointReward} point`}</Button>
      </div>))}
    </div>
  </div>;
};

const Mission = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Mission;
