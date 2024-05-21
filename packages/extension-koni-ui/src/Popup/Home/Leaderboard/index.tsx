// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { TopAccountItem } from '@subwallet/extension-koni-ui/Popup/Home/Leaderboard/TopAccountItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

enum TabType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>(apiSDK.leaderBoard);
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [selectedTab, setSelectedTab] = useState<string>(TabType.WEEKLY);

  const tabGroupItems = useMemo<TabGroupItemType[]>(() => {
    return [
      {
        label: t('Weekly'),
        value: TabType.WEEKLY
      },
      {
        label: t('Monthly'),
        value: TabType.MONTHLY
      },
      {
        label: t('Yearly'),
        value: TabType.YEARLY
      }
    ];
  }, [t]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  useEffect(() => {
    const leaderBoardSub = apiSDK.subscribeLeaderboard().subscribe((data) => {
      setLeaderBoard(data);
    });

    return () => {
      leaderBoardSub.unsubscribe();
    };
  }, []);

  const filteredLeaderBoard = leaderBoard.filter((item) => item.point > 0);

  useEffect(() => {
    setContainerClass('leaderboard-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return <div className={className}>
    <div className='tab-group-wrapper'>
      <TabGroup
        className={'tab-group'}
        items={tabGroupItems}
        onSelect={onSelectTab}
        selectedItem={selectedTab}
      />
    </div>
    <div className='top-three-area'>
      <div className='top-account-item-wrapper'>
        {
          !!filteredLeaderBoard[1] && (
            <TopAccountItem
              {...filteredLeaderBoard[1]}
            />
          )
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          !!filteredLeaderBoard[0] && (
            <TopAccountItem
              {...filteredLeaderBoard[0]}
              isFirst
            />
          )
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          !!filteredLeaderBoard[2] && (
            <TopAccountItem
              {...filteredLeaderBoard[2]}
            />
          )
        }
      </div>
    </div>
    <div className={'leaderboard-container'}>
      {filteredLeaderBoard.length >= 3 && filteredLeaderBoard.slice(3).map((item) => (
        <GameAccount
          avatar={item.accountInfo.avatar}
          className={CN('leaderboard-item')}
          key={item.rank}
          name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
          point={item.point}
          prefix={`${item.rank}`}
        />
      ))}
    </div>
  </div>;
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    '.tab-group-wrapper': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.top-account-item-wrapper': {
      maxWidth: 120,
      flex: 1,
      overflow: 'hidden'
    },

    '.top-account-item-wrapper.-is-first': {
      maxWidth: 134,
      minWidth: 134,
      marginBottom: 24
    },

    '.top-three-area': {
      minHeight: 252,
      display: 'flex',
      alignItems: 'flex-end',
      paddingTop: token.size,
      paddingBottom: token.size,
      justifyContent: 'center',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.leaderboard-item': {
      marginBottom: token.marginXS,

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

    '.leaderboard-container': {
      overflow: 'auto',
      flex: 1,
      paddingBottom: 90,
      paddingRight: 20,
      paddingLeft: 20,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: token.colorWhite
    }
  };
});

export default Leaderboard;
