// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/GameAccountItem';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount, LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import React, { useEffect, useMemo, useState } from 'react';

type Props = {
  leaderboardPersonItems: LeaderboardPerson[];
  isLoading: boolean;
};

function getGameAccountItem (leaderboardPersonItem: LeaderboardPerson): GameAccountItemType {
  return {
    name: `${leaderboardPersonItem.accountInfo.firstName} ${leaderboardPersonItem.accountInfo.lastName}`,
    prefix: `${leaderboardPersonItem.rank}`,
    point: leaderboardPersonItem.point,
    avatarSrc: leaderboardPersonItem.accountInfo.avatar,
    isMine: leaderboardPersonItem.mine
  };
}

const apiSDK = BookaSdk.instance;

export const GameAccountListArea = ({ isLoading, leaderboardPersonItems }: Props): React.ReactElement => {
  const [mineAccount, setMineAccount] = useState<BookaAccount | undefined>(apiSDK.account);

  const items = useMemo<GameAccountItemType[]>(() => {
    const indexOfMine = leaderboardPersonItems.findIndex((i) => i.mine);

    if (indexOfMine < 0) {
      if (!mineAccount) {
        return [];
      }

      const telegramAccountName = (mineAccount?.info.firstName || mineAccount?.info.lastName)
        ? `${mineAccount?.info.firstName || ''} ${mineAccount?.info.lastName || ''}`.trim()
        : mineAccount.info.telegramUsername;

      return [{
        name: telegramAccountName,
        prefix: '---',
        point: 0,
        avatarSrc: mineAccount.info.photoUrl,
        isMine: true
      }];
    }

    const mineRank = leaderboardPersonItems[indexOfMine].rank;
    const rankGap = 20;
    let firstItemRank = mineRank - rankGap;

    if (firstItemRank <= 0) {
      firstItemRank = 1;
    }

    let lastItemRank = mineRank + rankGap;

    if (lastItemRank >= leaderboardPersonItems.length) {
      lastItemRank = leaderboardPersonItems.length;
    }

    const result: GameAccountItemType[] = [];

    for (let r = firstItemRank; r <= lastItemRank; r++) {
      if (!leaderboardPersonItems[r - 1]) {
        continue;
      }

      result.push(getGameAccountItem(leaderboardPersonItems[r - 1]));
    }

    return result;
  }, [leaderboardPersonItems, mineAccount]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setMineAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <></>
    );
  }

  return (
    <>
      {
        items.map((item) => (
          <GameAccountItem
            {...item}
            className={'game-account-item'}
            key={item.prefix}
          />
        ))
      }
    </>
  );
};
