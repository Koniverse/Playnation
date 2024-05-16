// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CountDown from '@subwallet/extension-koni-ui/components/Common/CountDown';
import { GamePoint } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatInteger } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Image, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = {
  task: Task
} & ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const _TaskItem = ({ className, task }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const completed = !!task.completedAt;

  const finishTask = useCallback(() => {
    const taskId = task.id;

    setTaskLoading(true);

    apiSDK.finishTask(taskId)
      .finally(() => {
        setTaskLoading(false);
      })
      .catch(console.error);

    setTimeout(() => {
      task.url && telegramConnector.openLink(task.url);
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
    {!completed && <Button
      className={'play-button'}
      disabled={isDisabled}
      loading={taskLoading}
      onClick={finishTask}
      size={'xs'}
    >
      {t('Go')}
    </Button>}
    {completed && <Button
      className={'checked-button'}
      icon={<Icon
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
