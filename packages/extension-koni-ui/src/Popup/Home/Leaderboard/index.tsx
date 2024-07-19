// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LeaderboardContent } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { calculateStartAndEnd } from '@subwallet/extension-koni-ui/utils/date';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

enum TabType {
  WEEKLY = 'weekly',
  DED_PLAYDROP = 'ded_playdrop',
  VARA_PLAYDROP = 'vara_playdrop',
}

const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardPerson[]>(apiSDK.leaderBoard);
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);
  const [selectedTab, setSelectedTab] = useState<string>(TabType.VARA_PLAYDROP);
  const [account, setAccount] = useState(apiSDK.account);

  const tabGroupItems = useMemo<TabGroupItemType[]>(() => {
    return [
      {
        label: t('Kick-to-Airdrop'),
        value: TabType.VARA_PLAYDROP
      },
      {
        label: t('DED'),
        value: TabType.DED_PLAYDROP
      },
      {
        label: t('Weekly'),
        value: TabType.WEEKLY
      }
    ];
  }, [t]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

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
        setLeaderboardItems(data);
      });
    } else if (selectedTab === TabType.VARA_PLAYDROP) {
      varaBoardSub = apiSDK.subscribeLeaderboard(start, end, 0, 100).subscribe((data) => {
        setLeaderboardItems(data);
      });
    } else {
      weeklyBoardSub = apiSDK.subscribeLeaderboard(start, end, 0, 100).subscribe((data) => {
        setLeaderboardItems(data);
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

  const onClickShare = useCallback(() => {
    if (!leaderboardItems || !account) {
      return;
    }

    const personMine = leaderboardItems.find((item) => item.mine);
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
  }, [leaderboardItems, account, selectedTab]);

  const tabGroupInfo = useMemo(() => ({
    onSelectTab,
    selectedTab,
    tabGroupItems
  }), [onSelectTab, selectedTab, tabGroupItems]);

  return (
    <LeaderboardContent
      className={className}
      leaderboardItems={leaderboardItems}
      onClickShare={onClickShare}
      showShareButton={selectedTab !== TabType.WEEKLY}
      tabGroupInfo={tabGroupInfo}
    />
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Leaderboard;
