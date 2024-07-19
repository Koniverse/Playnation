// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ShareNetwork } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

import TopAccountItem from './TopAccountItem';

type Props = ThemeProps & {
  showShareButton?: boolean;
  onClickShare?: VoidFunction;
  leaderboardItems: LeaderboardPerson[];
  tabGroupItems: TabGroupItemType[];
  onSelectTab: (value: string) => void;
  selectedTab: string;
};

type GameItemPlaceholderType = {
  rank: number;
};

const Component = ({ className, leaderboardItems, onClickShare, onSelectTab, selectedTab, showShareButton, tabGroupItems }: Props): React.ReactElement => {
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
      {showShareButton && (
        <Button
          className={'__share-button -primary-3'}
          icon={(
            <Icon
              phosphorIcon={ShareNetwork}
              size={'md'}
            />
          )}
          onClick={onClickShare}
          shape={'round'}
          size={'xs'}
        />
      )}
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            isPlaceholder={!filteredLeaderboardItems[1]}
            leaderboardInfo={filteredLeaderboardItems[1]}
            rank={2}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            isFirst
            isPlaceholder={!filteredLeaderboardItems[0]}
            leaderboardInfo={filteredLeaderboardItems[0]}
            rank={1}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            isPlaceholder={!filteredLeaderboardItems[2]}
            leaderboardInfo={filteredLeaderboardItems[2]}
            rank={3}
          />
        }
      </div>
    </div>

    <div className={'leaderboard-item-list-container'}>
      {filteredLeaderboardItems.length >= 3 && filteredLeaderboardItems.slice(3).map((item) => (
        <div
          className={CN('leaderboard-item-wrapper', {
            '-is-sticky': item.mine
          })}
          key={item.rank}
        >
          <GameAccount
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
              className={CN('leaderboard-item')}
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
      paddingLeft: token.padding,
      paddingRight: token.padding
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
      minHeight: 252,
      display: 'flex',
      alignItems: 'flex-end',
      paddingTop: token.size,
      paddingBottom: token.size,
      justifyContent: 'center',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      position: 'relative',
      '.__share-button': {
        position: 'absolute',
        right: token.padding,
        top: 0
      }
    },

    '.leaderboard-item-wrapper': {
      marginBottom: token.marginXS
    },

    '.leaderboard-item-wrapper.-is-sticky': {
      position: 'sticky',
      bottom: token.size,
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
