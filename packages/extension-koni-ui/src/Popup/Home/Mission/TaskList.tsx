// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TaskCategory, TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import TaskItem from '@subwallet/extension-koni-ui/Popup/Home/Mission/TaskItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import { CaretLeft } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  currentTaskCategory?: number;
  taskCategoryInfoMap: Record<number, TaskCategoryInfo>;
  onBackToCategoryList: VoidFunction;
  actionReloadPoint: VoidFunction;
  taskCategory: TaskCategory | undefined;
};

const Component = ({ actionReloadPoint, className, currentTaskCategory, onBackToCategoryList, taskCategory, taskCategoryInfoMap }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const sortedTaskList = useMemo(() => {
    const now = Date.now();

    const taskList = currentTaskCategory ? taskCategoryInfoMap[currentTaskCategory]?.tasks || [] : [];

    return taskList.filter((task) => {
      // Filter out the task that ended more than 1 day ago
      if (!task.completedAt && task.endTime && new Date(task.endTime).getTime() < now) {
        return false;
      } else {
        return true;
      }
    })
      .sort((a, b) => {
        const aDisabled = ((a.startTime && new Date(a.startTime).getTime() > now) || (a.endTime && new Date(a.endTime).getTime() < now));
        const bDisabled = ((b.startTime && new Date(b.startTime).getTime() > now) || (b.endTime && new Date(b.endTime).getTime() < now));

        if (aDisabled && !bDisabled) {
          return 1;
        }

        if (!aDisabled && bDisabled) {
          return -1;
        }

        if (a.status === 0 && b.status !== 0) {
          return -1;
        }

        if (a.status !== 0 && b.status === 0) {
          return 1;
        }

        return a.status - b.status;
      });
  }, [currentTaskCategory, taskCategoryInfoMap]);

  return (
    <div className={className}>
      <div className={'__list-header'}>
        <Button
          icon={(
            <Icon
              phosphorIcon={CaretLeft}
            />
          )}
          onClick={onBackToCategoryList}
          size='xs'
          type='ghost'
        />

        <Typography.Title level={4}>
          {taskCategory ? taskCategory.name : t('Missions')}
        </Typography.Title>
      </div>

      {sortedTaskList.map((task) => (
        <TaskItem
          actionReloadPoint={actionReloadPoint}
          key={task.id}
          task={task}
        />
      ))}
    </div>
  );
};

export const TaskList = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__list-header': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: token.marginXS,

      '.ant-typography': {
        marginBottom: 0
      }
    },

    '.task-list': {
      padding: token.padding,

      '.account-info': {
        marginBottom: token.marginSM
      }
    }
  };
});
