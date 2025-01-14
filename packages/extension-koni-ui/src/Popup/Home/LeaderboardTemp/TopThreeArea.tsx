// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TopAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { TopAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/TopAccountItem';
import { LeaderboardPerson, RewardConfigItem } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  leaderboardPersonItems: LeaderboardPerson[];
  isLoading: boolean;
  shouldShowToken?: boolean;
  rewardConfigs: RewardConfigItem[];
};

function getTokenValue (rank: number, rewardConfigs: RewardConfigItem[]) {
  return rewardConfigs
    .filter((item) => item.from <= rank && item.to >= rank) // Lọc các rank phù hợp
    .reduce((total, item) => total + item.amount, 0);
}

function getTopAccountItem (gameAccountItem: LeaderboardPerson | undefined, rank: number, rewardConfigs: RewardConfigItem[]): TopAccountItemType {
  if (!gameAccountItem) {
    return {
      isFirst: rank === 1,
      rank,
      name: '---'
    };
  }

  return {
    isFirst: rank === 1,
    rank,
    point: gameAccountItem.point,
    name: `${gameAccountItem.accountInfo.firstName} ${gameAccountItem.accountInfo.lastName}`,
    avatarSrc: gameAccountItem.accountInfo.avatar,
    tokenValue: getTokenValue(rank, rewardConfigs)
  };
}

const Component = ({ className, isLoading, leaderboardPersonItems, rewardConfigs, shouldShowToken }: Props): React.ReactElement => {
  const top1Props = useMemo(() => {
    return getTopAccountItem(leaderboardPersonItems[0], 1, rewardConfigs);
  }, [leaderboardPersonItems, rewardConfigs]);

  const top2Props = useMemo(() => {
    return getTopAccountItem(leaderboardPersonItems[1], 2, rewardConfigs);
  }, [leaderboardPersonItems, rewardConfigs]);

  const top3Props = useMemo(() => {
    return getTopAccountItem(leaderboardPersonItems[2], 3, rewardConfigs);
  }, [leaderboardPersonItems, rewardConfigs]);

  return (
    <div
      className={className}
    >
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...top2Props}
            isLoading={isLoading}
            shouldShowToken={shouldShowToken}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            {...top1Props}
            isLoading={isLoading}
            shouldShowToken={shouldShowToken}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...top3Props}
            isLoading={isLoading}
            shouldShowToken={shouldShowToken}
          />
        }
      </div>
    </div>
  );
};

export const TopThreeArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,

    '.top-account-item-wrapper': {
      flex: 1,
      overflow: 'hidden',
      minWidth: 94
    },

    '.top-account-item-wrapper.-is-first': {
      flex: '0 1 auto',
      minWidth: 123
    }
  };
});
