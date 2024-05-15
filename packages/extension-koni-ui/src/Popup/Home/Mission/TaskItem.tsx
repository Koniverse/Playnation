// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import CountDown from '@subwallet/extension-koni-ui/components/Common/CountDown';
import { GamePoint } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task, TaskHistoryStatus } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatInteger } from '@subwallet/extension-koni-ui/utils';
import { actionTaskOnChain } from '@subwallet/extension-koni-ui/utils/game/task';
import { Button, Icon, Image, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = {
  task: Task
} & ThemeProps;

const apiSDK = BookaSdk.instance;

const _TaskItem = ({ className, task }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const notify = useNotification();
  const [account, setAccount] = useState(apiSDK.account);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(!!task.completedAt);
  const [checking, setChecking] = useState(task.status === TaskHistoryStatus.CHECKING);

  useEffect(() => {
    let taskItemUpdaterInterval: NodeJS.Timer;

    if (checking) {
      taskItemUpdaterInterval = setInterval(() => {
        apiSDK.completeTask(task.taskHistoryId)
          .then((data: any) => {
            if (data.completed) {
              // @ts-ignore
              clearInterval(taskItemUpdaterInterval);
              setCompleted(true);
              setChecking(false);
            }
          })
          .catch(console.error);
      }, 10000);
    }

    return () => clearInterval(taskItemUpdaterInterval);
  }, [checking]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const finishTask = useCallback(async () => {
    const taskId = task.id;
    const onChainType = task.onChainType;
    const { address } = account?.info || {};

    if (!address) {
      return;
    }

    setTaskLoading(true);
    let res: SWTransactionResponse | null = null;
    const networkKey = 'alephTest';

    if (onChainType) {
      const now = new Date();
      const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const data = JSON.stringify({ address, type: onChainType, date });

      res = await actionTaskOnChain(onChainType, 'alephTest', address, data);

      if ((res && res.errors.length > 0) || !res) {
        setTaskLoading(false);
        let message = t(`Network ${networkKey} not enable`);
        if (res && res.errors.length > 0) {
          const error = res?.errors[0] || {};
          // @ts-ignore
          message = error?.message || '';
        }

        notify({
          message: message,
          type: 'error'
        });

        return;
      }
    }

    let extrinsicHash = '';

    if (res) {
      extrinsicHash = res.extrinsicHash || '';
    }

    apiSDK.finishTask(taskId, extrinsicHash, networkKey)
      .finally(() => {
        setTaskLoading(false);

        if (onChainType) {
          setChecking(true);
        } else {
          setCompleted(true);
        }
      })
      .catch(console.error);

    setTimeout(() => {
      // task.url && telegramConnector.openLink(task.url);
    }, 100);
  }, [task.id, task.url]);

  const { endTime,
    isDisabled,
    isEnd, isInTimeRange,
    isNotStarted,
    startTime } = (() => {
    const now = Date.now();

    const startTime = task.startTime ? new Date(task.startTime).getTime() : undefined;
    const endTime = task.endTime ? new Date(task.endTime).getTime() : undefined;
    const isNotStarted = !completed && !!startTime && startTime > now;
    const isInTimeRange = !completed && !!endTime && endTime > now;
    const isEnd = !completed && !!endTime && endTime <= now;

    return {
      startTime,
      endTime,
      isNotStarted,
      isInTimeRange,
      isEnd,
      isDisabled: isNotStarted || isEnd
    };
  })();

  return <div
    className={CN(className, { disabled: isDisabled })}
    key={task.id}
  >
    <Image
      className={'task-banner'}
      src={task.icon || undefined}
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
        <GamePoint text={`${formatInteger(task.pointReward || 0)}`} />

        {
          isNotStarted && !!startTime && (
            <CountDown
              prefix={t('Begins in ')}
              targetTime={startTime}
            />
          )
        }
        {
          isInTimeRange && !!endTime && (
            <CountDown
              prefix={t('Ends in ')}
              targetTime={endTime}
            />
          )
        }
        {
          isEnd && (<span>{t('Ended')}</span>)
        }
      </Typography.Text>
    </div>
    {!completed && !checking && <Button
      className={'play-button'}
      disabled={isDisabled}
      loading={taskLoading}
      onClick={finishTask}
      size={'xs'}
    >
      {t('Go')}
    </Button>}
    {completed && !checking && <Button
      className={'checked-button'}
      icon={<Icon
        phosphorIcon={CheckCircle}
        weight={'fill'}
      />}
      size={'xs'}
      type={'ghost'}
    />}
    {checking && !completed && <Button
      className={'checked-button'}
      icon={<Icon
        iconColor={'#FFD700'}
        phosphorIcon={CheckCircle}
        weight={'fill'}
            />}
      size={'xs'}
      type={'ghost'}
    />}
  </div>;
};

const TaskItem = styled(_TaskItem)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return { alignItems: 'center',
    display: 'flex',
    marginBottom: token.marginXS,
    padding: token.paddingSM,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgSecondary,

    '&.disabled': {
      opacity: 0.6
    },

    '.task-banner': {
      marginRight: token.marginSM
    },

    '.task-title': {
      flex: 1,

      '.__title': {
        marginBottom: 0
      },

      '.__sub-title': {
        color: token.colorTextDark4
      }
    },

    '.play-button, .checked-button': {
      marginLeft: token.marginSM
    },

    '.checked-button': {
      color: token.colorSuccess
    } };
});

export default TaskItem;
