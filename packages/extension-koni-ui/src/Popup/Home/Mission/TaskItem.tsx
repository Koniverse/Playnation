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
  const [disabled, setDisabled] = useState<boolean>(false);
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
      telegramConnector.openLink(task.url);
    }, 100);
  }, [task.id, task.url]);

  const CountDownElement = useCallback(() => {
    if (completed) {
      return <></>;
    }

    const now = Date.now();

    if (task.startTime) {
      const startTime = new Date(task.startTime).getTime();

      if (startTime > now) {
        setDisabled(true);

        return <CountDown
          prefix={t('Begins in ')}
          targetTime={startTime}
        />;
      }
    }

    if (task.endTime) {
      const endTime = new Date(task.endTime).getTime();

      if (endTime > now) {
        return <CountDown
          prefix={t('Ends in ')}
          targetTime={endTime}
        />;
      } else {
        setDisabled(true);

        return <span>{t('Ended')}</span>;
      }
    }

    return <></>;
  }, [completed, t, task.endTime, task.startTime]);

  return <div
    className={CN(className, { disabled: disabled })}
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
        <GamePoint text={`${formatInteger(task.pointReward)}`} />
        <CountDownElement />
      </Typography.Text>
    </div>
    {!completed && <Button
      className={'play-button'}
      disabled={disabled}
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
