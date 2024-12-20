// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyListContent } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Reward } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { RewardHistoryItem } from './RewardHistoryItem';

type Props = ThemeProps;
const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [rewardHistories, setRewardHistories] = useState<Reward[]>(apiSDK.getRewardHistoryList());

  useEffect(() => {
    const unsub = apiSDK.subscribeRewardList().subscribe((rewards) => {
      setRewardHistories(rewards);
    });

    return () => {
      unsub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>
      {rewardHistories.length > 0
        ? (
          <>
            <div className='__area-label'>
              {t('Reward history')}
            </div>

            <div className='__list-container'>
              {
                rewardHistories.map((item) => (
                  <RewardHistoryItem
                    className={'reward-history-item'}
                    key={item.airdrop_record_id}
                    reward={item}
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

    '.__list-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    },

    '.empty-list-content': {
      paddingBottom: 103,
      paddingTop: 56
    },

    '.reward-history-item + .reward-history-item': {
      marginTop: 4
    }
  };
});
