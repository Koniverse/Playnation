// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TaskCategory, TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import TaskItem from '@subwallet/extension-koni-ui/Popup/Home/Mission/TaskItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  taskCategoryMap: Record<number, TaskCategory>;
  taskCategoryInfoMap: Record<number, TaskCategoryInfo>;
  actionReloadPoint: VoidFunction;
  openWidget: (widgetId: string, taskId: string) => Promise<void>;
};

const Component = ({ actionReloadPoint, className, taskCategoryInfoMap, taskCategoryMap, openWidget }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const taskCategoryInfoList = useMemo(() => {
    const checkInCatId = Object.values(taskCategoryMap).find((tci) => tci.slug === 'check_in')?.id;

    if (!checkInCatId) {
      return Object.values(taskCategoryInfoMap);
    }

    return Object.values(taskCategoryInfoMap).sort((a, b) => {
      if (a.id === checkInCatId) {
        return -1;
      }

      if (b.id === checkInCatId) {
        return 1;
      }

      return 0;
    });
  }, [taskCategoryInfoMap, taskCategoryMap]);

  return (
    <div className={className}>
      {
        taskCategoryInfoList.map((tci) => (
          tci.tasks.length > 0 && (
            <div
              className={'__task-category-item'}
              key={tci.id}
            >
              <div className='__task-category-info'>
                <div className='__task-category-name'>
                  {taskCategoryMap[tci.id]?.name}
                </div>

                <div className='__complete-missions'>
                  {`${tci.completeCount}/${tci.tasks.length}`} {t('missions')}
                </div>
              </div>
              <div className='__tasks-container'>
                {
                  tci.tasks.map((t) => (
                    <TaskItem
                      actionReloadPoint={actionReloadPoint}
                      openWidget={openWidget}
                      className={'__task-item'}
                      key={t.id}
                      task={t}
                    />
                  ))
                }
              </div>
            </div>
          )
        ))
      }
    </div>
  );
};

export const TaskList = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__task-category-item': {
      marginBottom: token.marginXS
    },

    '.__tasks-container': {
      backgroundColor: token.colorWhite,
      borderRadius: 20,
      paddingTop: token.paddingXXS,
      paddingBottom: token.paddingXXS
    },

    '.__task-category-info': {
      color: token.colorTextDark1,
      display: 'flex',
      gap: token.sizeXS,
      overflow: 'hidden',
      paddingLeft: token.paddingSM,
      paddingRight: token.paddingSM,
      marginBottom: token.marginXS
    },

    '.__task-category-name': {
      fontSize: token.fontSizeLG,
      flex: 1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      fontWeight: token.headingFontWeight
    },

    '.__complete-missions': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__task-item + .__task-item': {
      marginTop: token.marginXXS
    }
  };
});
