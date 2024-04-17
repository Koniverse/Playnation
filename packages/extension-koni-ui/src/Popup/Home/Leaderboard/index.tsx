// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { Trophy } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>(apiSDK.leaderBoard);
  const { t } = useTranslation();

  useEffect(() => {
    const leaderBoardSub = apiSDK.subscribeLeaderboard().subscribe((data) => {
      setLeaderBoard(data);
    });

    return () => {
      leaderBoardSub.unsubscribe();
    };
  }, []);

  const filteredLeaderBoard = leaderBoard.filter((item) => item.point > 0);

  return <div className={className}>
    <div className={'leader-board'}>
      <div className='board-header'>
        <div className='icon-wrapper'>
          <Icon
            customSize={'64px'}
            phosphorIcon={Trophy}
            weight={'fill'}
          />
        </div>
        <Typography.Title
          className={'title'}
          level={4}
        >
          {t('Top Ranking')}
        </Typography.Title>
      </div>
      <div className={'leaderboard-list'}>
        {filteredLeaderBoard.map((item) => (<div
          className={'leaderboard-item'}
          key={item.rank}
        >
          <GameAccount
            avatar={item.accountInfo.avatar}
            className={CN('account-info', { 'current-account': item.mine })}
            isLeaderboard={true}
            name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
            point={item.point}
            prefix={`${item.rank}`}
          />
        </div>))}
      </div>
    </div>
  </div>;
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

    '.account-info': {
      marginBottom: token.marginSM,

      '&.current-account': {
        outline: `1px solid ${token.colorPrimary}`
      }
    },

    '.leader-board': {
      '.board-header': {
        textAlign: 'center'
      },

      '.icon-wrapper': {
        backgroundColor: token['colorWarning-2'],
        color: token.colorWarning,
        borderRadius: '50%',
        padding: token.paddingXS,
        width: 112,
        height: 112,
        display: 'inline-flex',
        justifyContent: 'center',
        marginBottom: token.marginSM
      },

      '.title': {
        marginBottom: token.margin
      },

      '.leaderboard-item': {
        marginBottom: token.marginSM,

        '&:nth-child(1), &:nth-child(2), &:nth-child(3)': {
          '.account-info': {
            backgroundColor: token['colorWarning-2']
          }
        }
      }
    }
  };
});

export default Leaderboard;
