// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TopAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { TopAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/TopAccountItem';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  leaderboardPersonItems: LeaderboardPerson[];
  isLoading: boolean;
  customDateTimeHandler?: (currentTime?: number) => string | undefined;
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

const apiSDK = BookaSdk.instance;

const Component = ({ className, customDateTimeHandler, isLoading, leaderboardPersonItems }: Props): React.ReactElement => {
  const [serverTime, setServerTime] = useState<number | undefined>();

  useEffect(() => {
    const serverTimeSubject = apiSDK.subscribeServerTime();

    const updateDateTime = (value: number) => {
      setServerTime(value);
    };

    updateDateTime(serverTimeSubject.value);

    const timeSub = serverTimeSubject.subscribe((value) => {
      updateDateTime(value);
    });

    return () => {
      timeSub.unsubscribe();
    };
  }, []);

  const isShowToken = useMemo(() => !!customDateTimeHandler?.(serverTime), [customDateTimeHandler, serverTime]);

  return (
    <div
      className={className}
    >
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[1], 2)}
            isLoading={isLoading}
            isShowToken={isShowToken}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[0], 1)}
            isLoading={isLoading}
            isShowToken={isShowToken}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            {...getTopAccountItem(leaderboardPersonItems[2], 3)}
            isLoading={isLoading}
            isShowToken={isShowToken}
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
