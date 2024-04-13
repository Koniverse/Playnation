// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [account, setAccount] = useState(apiSDK.account);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>([]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const leaderBoardSub = apiSDK.subscribeLeaderboard().subscribe((data) => {
      setLeaderBoard(data);
    });

    return () => {
      accountSub.unsubscribe();
      leaderBoardSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <div>
      <h1>Account Information</h1>
      <p>Energy: {account.attributes.energy}</p>
      <p>Point: {account.attributes.point}</p>
    </div>}
    <div className={'leader-board'}>
      <h1>Leader board</h1>
      {leaderBoard.map((item) => (<div
        className={'task-item'}
        key={item.rank}
      >
        <h3 className={'game-title'}>{item.rank}: {item.firstName} {item.lastName}: {item.point}</h3>
      </div>))}
    </div>
  </div>;
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Leaderboard;
