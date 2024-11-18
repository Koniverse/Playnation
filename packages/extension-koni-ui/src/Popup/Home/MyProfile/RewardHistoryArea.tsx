// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyListContent } from '@subwallet/extension-koni-ui/components/Mythical';
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
    ] as RewardHistoryItemType[];
  }, []);

  return (
    <div className={className}>
      {items.length > 0
        ? (
          <>
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
          </>
        )
        : (
          <EmptyListContent
            className={'empty-list-content'}
            content={t('Complete events and tasks for MYTH rewards')}
            title={t('oops! no rewards yet')}
          />
        )}
    </div>
  );
};

export const RewardHistoryArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    paddingBottom: 98,
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

    '.empty-list-content': {
      paddingBottom: 32,
      paddingTop: 16
    },

    '.reward-history-item + .reward-history-item': {
      marginTop: 4
    }
  };
});
