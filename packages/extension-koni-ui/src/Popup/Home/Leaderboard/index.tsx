// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { calculateStartAndEnd } from '@subwallet/extension-koni-ui/utils/date';
import { Button, Icon, Typography } from '@subwallet/react-ui';
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
  const listButton = [
    { name: t('Weekly'), key: 'weekly' }, { name: t('Monthly'), key: 'monthly' }, { name: t('Yearly'), key: 'yearly' }
  ];
  const [buttonCurrent, setButtonCurrent] = useState('weekly');

  useEffect(() => {
    const { end, start } = calculateStartAndEnd(buttonCurrent);
    const leaderBoardSub = apiSDK.subscribeLeaderboard(start, end, 1, 100).subscribe((data) => {
      setLeaderBoard(data);
    });

    return () => {
      leaderBoardSub.unsubscribe();
    };
  }, [buttonCurrent]);

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
      <div className={'leaderboard-tab'}>
        {listButton.map((item) => (
          <Button
            block={true}
            className={buttonCurrent === item.key ? 'button-default' : ''}
            key={item.key}
            onClick={() => setButtonCurrent(item.key)}
            size={'xs'}
          >
            {item.name}
          </Button>
        ))}
      </div>

      <div className={'leaderboard-list'}>
        {filteredLeaderBoard.map((item) => (<div
          className={CN('leaderboard-item', { 'current-user-item': item.mine })}
          key={item.rank}
        >
          <GameAccount
            avatar={item.accountInfo.avatar}
            className={'account-info'}
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

    '.leaderboard-item': {
      marginBottom: token.marginSM,

      '&.current-user-item': {
        position: 'sticky',
        top: token.marginSM,
        bottom: token.marginSM,
        zIndex: 100,
        '.account-info': {
          boxShadow: `0 0 6px ${token.colorPrimary}`
        }
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
        '.account-info': {
          border: '1px solid transparent'
        },

        '&:nth-child(1)': {
          '.account-info': {
            border: `1px solid ${token.colorWarning}`,
            backgroundColor: 'rgba(255, 233, 67, 0.10)'
          }
        },

        '&:nth-child(2)': {
          '.account-info': {
            border: '1px solid #9BA9BB',
            backgroundColor: 'rgba(43, 135, 255, 0.10)'
          }
        },

        '&:nth-child(3)': {
          '.account-info': {
            border: '1px solid #FFBA38',
            backgroundColor: 'rgba(255, 186, 56, 0.10)'
          }
        }
      },
      '.leaderboard-tab': {
        padding: '6px 10px 6px 10px',
        gap: 12,
        borderRadius: '24px 0px 0px 0px',
        marginBottom: token.margin,
        display: 'flex',
        '.button-default': {
          backgroundColor: token.colorWhite,
          color: token.colorTextBase,
          border: `1px solid ${token.colorTextBase}`
        }

      }
    }
  };
});

export default Leaderboard;
