// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { RewardHistoryItem, RewardHistoryItemType } from './RewardHistoryItem';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  const items: RewardHistoryItemType[] = useMemo(() => {
    return [
      {
        ordinal: 1,
        name: 'Won tournament',
        date: 'May 12th',
        tokenValue: '2'
      },
      {
        ordinal: 2,
        name: '#1 on the leaderboard',
        date: 'Given week',
        tokenValue: '25'
      },
      {
        ordinal: 3,
        name: 'Completed 10 amount of daily of weekly tasks',
        date: 'May 10th',
        tokenValue: '8'
      },
      {
        ordinal: 4,
        name: 'Completed 10 amount of daily of weekly tasks',
        date: 'May 10th',
        tokenValue: '8'
      },
      {
        ordinal: 5,
        name: 'Completed 10 amount of daily of weekly tasks',
        date: 'May 10th',
        tokenValue: '8'
      },
      {
        ordinal: 6,
        name: 'Completed 10 amount of daily of weekly tasks',
        date: 'May 10th',
        tokenValue: '8'
      }
    ] as RewardHistoryItemType[];
  }, []);

  return (
    <div className={className}>
      <div className='__area-label'>
        {t('Reward history')}
      </div>

      <div className='__list-container'>
        {
          items.map((item) => (
            <RewardHistoryItem
              {...item}
              className={'reward-history-item'}
              key={item.ordinal}
            />
          ))
        }
      </div>
    </div>
  );
};

export const RewardHistoryArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__area-label': {
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '-0.6px',
      textTransform: 'uppercase',
      color: token.colorWhite,
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 12
    },

    '.reward-history-item + .reward-history-item': {
      marginTop: 4
    }
  };
});
