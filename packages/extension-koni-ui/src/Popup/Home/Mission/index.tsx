// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import TaskItem from '@subwallet/extension-koni-ui/Popup/Home/Mission/TaskItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Typography } from '@subwallet/react-ui';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskList, setTaskList] = useState<Task[]>(apiSDK.taskList);
  const [account, setAccount] = useState(apiSDK.account);
  const { t } = useTranslation();

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

  const sortedTaskList = useMemo(() => {
    const now = Date.now();

    return taskList
      .filter((task) => {
        // Filter out the task that ended more than 1 day ago
        if (!task.completedAt && task.endTime && new Date(task.endTime).getTime() < now) {
          return false;
        } else {
          return true;
        }
      })
      .sort((a, b) => {
        if (a.status < b.status) {
          return -1;
        }

        const aDisabled = ((a.startTime && new Date(a.startTime).getTime() > now) || (a.endTime && new Date(a.endTime).getTime() < now));
        const bDisabled = ((b.startTime && new Date(b.startTime).getTime() > now) || (b.endTime && new Date(b.endTime).getTime() < now));

        if (aDisabled && !bDisabled) {
          return 1;
        }

        if (!aDisabled && bDisabled) {
          return -1;
        }

        return 0;
      });
  }, [taskList]);

  return <div className={className}>
    <div className={'task-list'}>
      {account && <GameAccount
        avatar={account.info.photoUrl}
        className={'account-info'}
        name={`${account.info.firstName || ''} ${account.info.lastName || ''}`}
        point={account.attributes.point}
      />}
      <Typography.Title level={4}>
        {t('Missions')}
      </Typography.Title>
      {sortedTaskList.map((task) => (<TaskItem
        key={task.id}
        task={task}
      />))}
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
