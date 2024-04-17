// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { GamePoint } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Image, Typography } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskList, setTaskList] = useState<Task[]>(apiSDK.taskList);
  const [account, setAccount] = useState(apiSDK.account);
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});
  const { t } = useTranslation();

  const finishTask = useCallback((task: Task) => {
    return () => {
      const taskId = task.id;

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
      setTimeout(() => {
        telegramConnector.openLink(task.url);
      }, 100);
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
    <div className={'task-list'}>
      {account && <GameAccount
        avatar={account.info.photoUrl}
        className={'account-info'}
        info={account.attributes.point.toString()}
        name={`${account.info.firstName || ''} ${account.info.lastName || ''}`}
      />}
      <Typography.Title level={4}>
        {t('Missions')}
      </Typography.Title>
      {taskList.map((task) => (<div
        className={'task-item'}
        key={task.id}
      >
        <Image
          className={'task-banner'}
          src={task.icon}
          width={40}
        ></Image>
        <div className='task-title'>
          <Typography.Title
            className={'__title'}
            level={6}
          >{task.name}</Typography.Title>
          <Typography.Text
            className={'__sub-title'}
            size={'sm'}
          >
            <GamePoint text={` x ${task.pointReward}`} />
          </Typography.Text>
        </div>
        {!(task.status && task.status > 0) && <Button
          className={'play-button'}
          loading={taskLoading[task.id]}
          onClick={finishTask(task)}
          size={'xs'}
        >{t('Go')}</Button>}
        {!!(task.status && task.status > 0) && <Button
          className={'checked-button'}
          icon={<Icon
            phosphorIcon={CheckCircle}
            weight={'fill'}
                />}
          loading={taskLoading[task.id]}
          size={'xs'}
          type={'ghost'}
                                               />}
      </div>))}
    </div>
  </div>;
};

const Mission = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.task-list': {
      padding: token.padding,

      '.account-info': {
        marginBottom: token.marginSM
      },

      '.task-item': {
        alignItems: 'center',
        display: 'flex',
        marginBottom: token.marginXS,
        padding: token.paddingSM,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgSecondary,

        '.task-banner': {
          marginRight: token.marginSM
        },

        '.task-title': {
          flex: 1,

          '.__title': {
            marginBottom: 0
          }
        },

        '.play-button, .checked-button': {
          marginLeft: token.marginSM
        },

        '.checked-button': {
          color: token.colorSuccess
        }
      }
    }
  };
});

export default Mission;
