// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TaskCategory, TaskCategoryInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatInteger } from '@subwallet/extension-koni-ui/utils';
import { Icon, Image, Typography } from '@subwallet/react-ui';
import { CaretRight } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  taskCategoryList: TaskCategory[];
  taskCategoryInfoMap: Record<number, TaskCategoryInfo>;
  onClickCategoryItem: (categoryId: number) => void;
};

const Component = ({ className, onClickCategoryItem, taskCategoryInfoMap, taskCategoryList }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const filteredTaskCategoryList = useMemo(() => {
    return taskCategoryList.filter((tc) => {
      return taskCategoryInfoMap[tc.id] && taskCategoryInfoMap[tc.id].tasks.length;
    });
  }, [taskCategoryInfoMap, taskCategoryList]);

  const onClickItem = useCallback((categoryId: number) => {
    return () => {
      onClickCategoryItem(categoryId);
    };
  }, [onClickCategoryItem]);

  return (
    <div className={className}>
      <Typography.Title level={4}>
        {t('Categories')}
      </Typography.Title>

      {
        filteredTaskCategoryList.map((tc) => (
          <div
            className={'task-category-item'}
            key={tc.id}
            onClick={onClickItem(tc.id)}
          >
            <Image
              className={'task-category-banner'}
              src={tc.icon || undefined}
              width={40}
            ></Image>
            <div className={'task-category-item-content'}>
              <div>{tc.name}</div>

              <div>
                Min point can earn: {formatInteger(taskCategoryInfoMap[tc.id]?.minPoint || 0)}
              </div>
            </div>
            <div className={'task-category-item-caret-icon'}>
              <Icon
                customSize={'20px'}
                phosphorIcon={CaretRight}
              />
            </div>
          </div>
        ))
      }
    </div>
  );
};

export const TaskCategoryList = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.task-category-banner': {
      marginRight: token.marginSM
    },

    '.task-category-item': {
      display: 'flex',
      backgroundColor: token.colorBgSecondary,
      minHeight: 50,
      borderRadius: token.borderRadiusLG,
      padding: token.padding,
      cursor: 'pointer',
      alignItems: 'center'
    },

    '.task-category-item-content': {
      flex: 1
    },

    '.task-category-item-caret-icon': {
      minWidth: 40,
      marginRight: -token.marginXS,
      display: 'flex',
      justifyContent: 'center'
    },

    '.task-category-item + .task-category-item': {
      marginTop: token.marginXS
    }
  };
});
