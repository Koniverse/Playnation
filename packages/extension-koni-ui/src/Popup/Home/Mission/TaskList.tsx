// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
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
};

const Component = ({ className, currentTaskCategory, onBackToCategoryList, taskCategoryInfoMap }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const sortedTaskList = useMemo(() => {
    const now = Date.now();

    const taskList = currentTaskCategory ? taskCategoryInfoMap[currentTaskCategory]?.tasks || [] : [];

    return taskList.sort((a, b) => {
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
          {t('Missions')}
        </Typography.Title>
      </div>

      {sortedTaskList.map((task) => (
        <TaskItem
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
