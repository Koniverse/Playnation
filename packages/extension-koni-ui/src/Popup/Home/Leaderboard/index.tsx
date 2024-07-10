// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { TopAccountItem } from '@subwallet/extension-koni-ui/Popup/Home/Leaderboard/TopAccountItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { calculateStartAndEnd } from '@subwallet/extension-koni-ui/utils/date';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ShareNetwork } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

enum TabType {
  WEEKLY = 'weekly',
  DED_PLAYDROP = 'ded_playdrop',
  VARA_PLAYDROP = 'vara_playdrop',
}

type GameItemPlaceholderType = {
  rank: number;
};
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>(apiSDK.leaderBoard);
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [selectedTab, setSelectedTab] = useState<string>(TabType.DED_PLAYDROP);
  const [account, setAccount] = useState(apiSDK.account);

  const tabGroupItems = useMemo<TabGroupItemType[]>(() => {
    return [
      {
        label: t('DED'),
        value: TabType.DED_PLAYDROP
      },
      {
        label: t('VARA'),
        value: TabType.VARA_PLAYDROP
      },
      {
        label: t('Weekly'),
        value: TabType.WEEKLY
      },
    ];
  }, [t]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const filteredLeaderBoard = leaderBoard.filter((item) => item.point > 0);

  const placeholderItems = (() => {
    if (filteredLeaderBoard.length >= 10) {
      return [];
    }

    const items: GameItemPlaceholderType[] = [];

    for (let i = filteredLeaderBoard.length; i < 10; i++) {
      if (i < 3) {
        continue;
      }

      items.push({
        rank: i + 1
      });
    }

    return items;
  })();

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const { end, start } = calculateStartAndEnd(selectedTab);
    let weeklyBoardSub: { unsubscribe: () => void } | null = null;
    let dedBoardSub: { unsubscribe: () => void } | null = null;
    let varaBoardSub: { unsubscribe: () => void } | null = null;

    if (selectedTab === TabType.DED_PLAYDROP) {
      dedBoardSub = apiSDK.subscribeLeaderboard(start, end, 0, 100).subscribe((data) => {
        setLeaderBoard(data);
      });
    } else if (selectedTab === TabType.VARA_PLAYDROP) {
      varaBoardSub = apiSDK.subscribeLeaderboard(start, end, 0, 100).subscribe((data) => {
        setLeaderBoard(data);
      });
    } else {
      weeklyBoardSub = apiSDK.subscribeLeaderboard(start, end, 0, 100).subscribe((data) => {
        setLeaderBoard(data);
      });
    }

    return () => {
      if (weeklyBoardSub) {
        weeklyBoardSub.unsubscribe();
      }

      if (dedBoardSub) {
        dedBoardSub.unsubscribe();
      }

      if (varaBoardSub) {
        varaBoardSub.unsubscribe();
      }
    };
  }, [selectedTab]);

  useEffect(() => {
    setContainerClass('leaderboard-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  const onClickShare = useCallback(async () => {
    if (!leaderBoard || !account) {
      return;
    }

    const personMine = leaderBoard.find((item) => item.mine);
    let content = '';

    if (personMine) {
      content += `Woohoo! I scored ${personMine.point} Points and ranked ${personMine.rank} on the DED Egg Hunt Airdrop`;
    }

    content += 'Leaderboard! Want to join the fun and get a chance to win $DED rewards? Join me now! 🚀';

    let urlShareImage = 'https://x.playnation.app/playnation-ded';
    let hashtags = 'hashtags=DEDEggHunt,Playnation,DOTisDED,Airdrop';

    if (selectedTab === TabType.VARA_PLAYDROP) {
      content = '';
      urlShareImage = 'https://x.playnation.app/playnation-vara';
      hashtags = 'hashtags=PlaynationKickToAirdrop,Playnation,VARAtoken,Airdrop';

      if (personMine) {
        content = `Woohoo! I scored ${personMine.point} Points and ranked ${personMine.rank}  on the Playnation Kick-to-Airdrop Leaderboard! %0A `;
      }

      content += 'Want to join the fun and get a chance to win $VARA rewards? Join me now! 🚀 ';
    }

    const linkShare = `${urlShareImage}?startApp=${account?.info.inviteCode || 'booka'}`;

    const url = `http://x.com/share?text=${content}&url=${linkShare}%0A&${hashtags}`;

    telegramConnector.openLink(url);
  }, [leaderBoard, account, selectedTab]);

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
      {selectedTab !== TabType.WEEKLY && (
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
            isPlaceholder={!filteredLeaderBoard[1]}
            leaderboardInfo={filteredLeaderBoard[1]}
            rank={2}
          />
        }
      </div>
      <div className='top-account-item-wrapper -is-first'>
        {
          <TopAccountItem
            isFirst
            isPlaceholder={!filteredLeaderBoard[0]}
            leaderboardInfo={filteredLeaderBoard[0]}
            rank={1}
          />
        }
      </div>
      <div className='top-account-item-wrapper'>
        {
          <TopAccountItem
            isPlaceholder={!filteredLeaderBoard[2]}
            leaderboardInfo={filteredLeaderBoard[2]}
            rank={3}
          />
        }
      </div>
    </div>

    <div className={'leaderboard-container'}>
      {filteredLeaderBoard.length >= 3 && filteredLeaderBoard.slice(3).map((item) => (
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

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
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
