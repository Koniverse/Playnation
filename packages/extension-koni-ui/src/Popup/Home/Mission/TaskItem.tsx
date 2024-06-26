// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { GamePoint } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ShareLeaderboard, Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, formatInteger } from '@subwallet/extension-koni-ui/utils';
import { actionTaskOnChain } from '@subwallet/extension-koni-ui/utils/game/task';
import { Button, Icon, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = {
  task: Task,
  actionReloadPoint: VoidFunction;
  actionOpenPopup: (task: Task) => void;
} & ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const _TaskItem = ({ actionOpenPopup, actionReloadPoint, className, task }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const notify = useNotification();
  const [account, setAccount] = useState(apiSDK.account);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(!!task.completedAt);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const finishTask = useCallback(() => {
    (async () => {
      const taskId = task.id;
      const onChainType = task.onChainType;
      const { address } = account?.info || {};

      if (!address) {
        return;
      }

      setTaskLoading(true);
      let res: SWTransactionResponse | null = null;
      const networkKey = task.network || '';

      if (onChainType) {
        const now = new Date();
        const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        const data = JSON.stringify({ address, type: onChainType, date });

        res = await actionTaskOnChain(onChainType, networkKey, address, data);

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

      let shareLeaderboard: ShareLeaderboard | null = null;

      if (task.share_leaderboard) {
        try {
          shareLeaderboard = JSON.parse(task.share_leaderboard) as ShareLeaderboard;
        } catch (e) {
          console.error('shareLeaderboard', e);
        }
      }

      try {
        const result = await apiSDK.finishTask(taskId, extrinsicHash, networkKey);

        setTaskLoading(false);
        setCompleted(result.success);
        actionReloadPoint();

        setTimeout(async () => {
          let urlRedirect = task.url;

          if (result.openUrl) {
            urlRedirect = result.openUrl;
          }

          if (shareLeaderboard && shareLeaderboard.content) {
            const startEnv = shareLeaderboard.start_time;
            const endEnv = shareLeaderboard.end_time;

            urlRedirect = await apiSDK.getShareTwitterURL(startEnv, endEnv, shareLeaderboard.content, task.gameId ?? 0, shareLeaderboard.url);
          }

          if (urlRedirect && result.isOpenUrl) {
            telegramConnector.openLink(urlRedirect);
          }
        }, 100);
      } catch (e) {
        setTaskLoading(false);
        setCompleted(false);
      }
    })().catch(console.error);
  }, [account?.info, actionReloadPoint, notify, t, task.gameId, task.id, task.network, task.onChainType, task.share_leaderboard, task.url]);

  const { endTime,
    isDisabled,
    isInTimeRange,
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
      // @ts-ignore
      isEnd,
      isDisabled: isNotStarted || isEnd
    };
  })();

  const renderTaskDate = () => {
    const now = Date.now();

    let content: string | undefined;

    if (isNotStarted && !!startTime && startTime < now) {
      content = `${t('Begins at')} ${customFormatDate(startTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    } else if (isInTimeRange && !!endTime && endTime > now) {
      content = `${t('Ends at')} ${customFormatDate(endTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    }

    if (content) {
      return (
        <div className='__task-date'>
          {content}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={CN(className, { disabled: isDisabled })}
      key={task.id}
    >
      <div className='__left-part'>
        <Image
          className={'__task-banner'}
          src={task.icon || undefined}
          width={40}
        />
      </div>

      <div className='__mid-part'>
        <div className='__min-part-line-1'>
          <div className='__task-name'>
            {task.name}
          </div>
        </div>
        <div className='__min-part-line-2'>
          <GamePoint
            className={'__game-point'}
            point={`${formatInteger(task.pointReward || 0)}`}
          />

          {renderTaskDate()}
        </div>
      </div>

      <div className='__right-part'>
        {!completed && (
          <Button
            disabled={isDisabled}
            loading={taskLoading}
            onClick={finishTask}
            shape={'round'}
            size={'xs'}
          >
            {t('Go')}
          </Button>
        )}

        {
          completed && (
            <Icon
              className={'background-icon -size-4 -primary-2'}
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          )
        }
      </div>
    </div>
  );
};

const TaskItem = styled(_TaskItem)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    alignItems: 'center',
    display: 'flex',
    padding: token.paddingSM,
    borderRadius: token.borderRadius,

    '&.disabled': {
      opacity: 0.6
    },

    '.__mid-part': {
      flex: 1
    },

    '.__task-banner': {
      marginRight: token.marginXS
    },

    '.__min-part-line-1': {

    },

    '.__min-part-line-2': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__task-name': {
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__task-date': {
      display: 'flex',
      fontSize: 10,
      lineHeight: '16px',
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark3,
      paddingLeft: token.paddingXS,
      alignItems: 'center',

      '&:before': {
        content: '""',
        marginRight: token.marginXS,
        backgroundColor: token.colorTextDark4,
        height: 12,
        width: 1
      }
    }
  };
});

export default TaskItem;
