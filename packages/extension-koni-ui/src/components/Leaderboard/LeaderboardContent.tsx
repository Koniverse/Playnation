// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { leaderboardPointIconMap } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ShareNetwork } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import TopAccountItem from './TopAccountItem';

export type LeaderboardTabGroupItemType = TabGroupItemType & {
  leaderboardInfo: {
    onClickShare?: (mine?: LeaderboardPerson) => void;
    id: number;
    type: string;
    context?: Record<string, unknown>
  }
}

export type LeaderboardContentProps = {
  gameId?: number;
  tabGroupItems: LeaderboardTabGroupItemType[];
  defaultSelectedTab: string;
};

type Props = ThemeProps & LeaderboardContentProps;

type GameItemPlaceholderType = {
  rank: number;
};

const apiSDK = BookaSdk.instance;

const Component = ({ className, defaultSelectedTab, gameId, tabGroupItems }: Props): React.ReactElement => {
  const [selectedTab, setSelectedTab] = useState<string>(defaultSelectedTab);
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardPerson[]>(apiSDK.leaderBoard);
  const [mine, setMine] = useState<LeaderboardPerson | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredLeaderboardItems = leaderboardItems.filter((item) => item.point > 0);

  const placeholderItems = (() => {
    if (filteredLeaderboardItems.length >= 10) {
      return [];
    }

    const items: GameItemPlaceholderType[] = [];

    for (let i = filteredLeaderboardItems.length; i < 10; i++) {
      if (i < 3) {
        continue;
      }

      items.push({
        rank: i + 1
      });
    }

    return items;
  })();

  const currentTabInfo = useMemo(() => {
    return tabGroupItems.find((i) => i.value === selectedTab);
  }, [selectedTab, tabGroupItems]);

  const _onClickShare = useCallback(() => {
    currentTabInfo?.leaderboardInfo?.onClickShare?.(leaderboardItems.find((item) => item.mine));
  }, [currentTabInfo?.leaderboardInfo, leaderboardItems]);

  const pointIconSrc = useMemo(() => {
    if (!currentTabInfo) {
      return leaderboardPointIconMap.default;
    }

    return leaderboardPointIconMap[currentTabInfo.leaderboardInfo.type] || leaderboardPointIconMap.default;
  }, [currentTabInfo]);

  useEffect(() => {
    setSelectedTab(defaultSelectedTab);
  }, [defaultSelectedTab]);

  useEffect(() => {
    let cancel = false;

    setLeaderboardItems([]);
    setIsLoading(true);

    currentTabInfo && apiSDK.fetchLeaderboard(currentTabInfo.leaderboardInfo.id, currentTabInfo.leaderboardInfo.context)
      .then((data) => {
        if (cancel) {
          return;
        }

        setLeaderboardItems(data);

        const mine = data.find((item) => item.mine);

        if (mine) {
          setMine(mine);
        }

        setIsLoading(false);
      })
      .catch(() => console.log('error'));

    return () => {
      cancel = true;
    };
  }, [currentTabInfo]);

  return <div className={className}>
    {
      tabGroupItems.length > 1 && (
        <div className='tab-group-wrapper'>
          <TabGroup
            className={'tab-group'}
            items={tabGroupItems}
            onSelect={setSelectedTab}
            selectedItem={selectedTab}
          />
        </div>
      )
    }
    <div className='top-three-area'>
      {(!!currentTabInfo?.leaderboardInfo.onClickShare && mine && mine.rank <= 3) && <div className='top-three-share-button'>
        <Button
          className={'top-button-share'}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={ShareNetwork}
              weight={'fill'}
            />
          )}
          onClick={_onClickShare}
          shape={'round'}
          size={'xs'}
          type={'ghost'}
        />
      </div>}
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            isLoading={isLoading}
            isPlaceholder={!filteredLeaderboardItems[1]}
            leaderboardInfo={filteredLeaderboardItems[1]}
            pointIconSrc={pointIconSrc}
            rank={2}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            isFirst
            isLoading={isLoading}
            isPlaceholder={!filteredLeaderboardItems[0]}
            leaderboardInfo={filteredLeaderboardItems[0]}
            pointIconSrc={pointIconSrc}
            rank={1}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            isLoading={isLoading}
            isPlaceholder={!filteredLeaderboardItems[2]}
            leaderboardInfo={filteredLeaderboardItems[2]}
            pointIconSrc={pointIconSrc}
            rank={3}
          />
        }
      </div>
    </div>

    <div
      className={'leaderboard-item-list-container'}
    >
      {filteredLeaderboardItems.length >= 3 && filteredLeaderboardItems.slice(3).map((item) => (
        <div
          className={CN('leaderboard-item-wrapper', {
            '-is-sticky': item.mine
          })}
          key={item.rank}
        >
          <GameAccount
            actionNode={!!currentTabInfo?.leaderboardInfo.onClickShare && item.mine
              ? (
                <Button
                  className={'__share-button'}
                  icon={(
                    <Icon
                      customSize={'20px'}
                      phosphorIcon={ShareNetwork}
                      weight={'fill'}
                    />
                  )}
                  onClick={_onClickShare}
                  shape={'round'}
                  size={'xs'}
                  type={'ghost'}
                />
              )
              : undefined}
            avatar={item.accountInfo.avatar}
            className={CN('leaderboard-item')}
            name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
            point={item.point}
            prefix={`${item.rank}`.padStart(2, '0')}
          />
        </div>
      ))}

      {
        placeholderItems.map((item) => (
          <div
            className={CN('leaderboard-item-wrapper')}
            key={item.rank}
          >
            <GameAccount
              className={CN('leaderboard-item', { __loading: isLoading })}
              isPlaceholder
              prefix={`${item.rank}`.padStart(2, '0')}
            />
          </div>
        ))
      }
    </div>
  </div>;
};

const LeaderboardContent = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    '.tab-group-wrapper': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      marginBottom: token.margin
    },

    '.top-button-share': {
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
      display: 'flex',
      alignItems: 'flex-end',
      paddingBottom: token.size,
      justifyContent: 'center',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      position: 'relative'
    },

    '.top-three-share-button': {
      position: 'absolute',
      top: -10,
      right: 0,
      zIndex: 10
    },

    '.leaderboard-item-wrapper': {
      marginBottom: token.marginXS
    },

    '.leaderboard-item-wrapper.-is-sticky': {
      position: 'sticky',
      bottom: token.size,
      top: 0,
      zIndex: 100,

      '.leaderboard-item': {
        position: 'relative',
        background: extendToken.colorBgGradient || token.colorPrimary,

        '&:before': {
          inset: 0,
          borderRadius: 40,
          display: 'block',
          position: 'absolute',
          content: '""',
          border: `1px solid ${token.colorBgBorder}`
        }
      }
    },

    '.__share-button': {
      marginRight: -10
    },

    '.leaderboard-item-list-container': {
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

export default LeaderboardContent;
