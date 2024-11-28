// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TopAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { TopAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/TopAccountItem';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  leaderboardPersonItems: LeaderboardPerson[];
  isLoading: boolean;
};

function getTopAccountItem (gameAccountItem: LeaderboardPerson | undefined, rank: number): TopAccountItemType {
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
    tokenValue: 0
  };
}

const Component = ({ className, isLoading, leaderboardPersonItems }: Props): React.ReactElement => {
  return (
    <div
      className={className}
    >
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[1], 2)}
            isLoading={isLoading}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[0], 1)}
            isLoading={isLoading}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[2], 3)}
            isLoading={isLoading}
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
