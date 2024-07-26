// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LeaderboardContent } from '@subwallet/extension-koni-ui/components';
import { LeaderboardTabGroupItemType } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardContent';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { calculateStartAndEnd } from '@subwallet/extension-koni-ui/utils/date';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

enum TabType {
  WEEKLY = 'weekly',
  INVITE_TO_PLAY = 'invite_to_play',
  VARA_PLAYDROP = 'vara_playdrop',
}

const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);

  const [account, setAccount] = useState(apiSDK.account);
  const [tabGroupItems, setTabGroupItems] = useState<LeaderboardTabGroupItemType[]>([]);

  const onClickShare = useCallback((selectedTab: string) => {
    return (personMine?: LeaderboardPerson) => {
      if (!account) {
        return;
      }

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
    };
  }, [account]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getTabGroupInfo = (): LeaderboardTabGroupItemType[] => {
      const baseItems: LeaderboardTabGroupItemType[] = [
        {
          label: t('Kick-to-Airdrop'),
          value: TabType.VARA_PLAYDROP,
          leaderboardInfo: {
            onClickShare: onClickShare(TabType.VARA_PLAYDROP)
          }
        },
        {
          label: t('Invite to Play'),
          value: TabType.INVITE_TO_PLAY,
          leaderboardInfo: {
            onClickShare: onClickShare(TabType.INVITE_TO_PLAY)
          }
        },
        {
          label: t('Weekly'),
          value: TabType.WEEKLY,
          leaderboardInfo: {

          }
        }
      ];

      return baseItems.map((item) => {
        const { end: endDate, start: startDate } = calculateStartAndEnd(item.value);
        let type = 'all';
        let gameId = 0;

        if (item.value === TabType.INVITE_TO_PLAY){
          type = 'inviteToPlay';
          gameId = 7;
        }

        return {
          ...item,
          leaderboardInfo: {
            ...item.leaderboardInfo,
            startDate,
            endDate,
            type,
            gameId
          }
        };
      });
    };

    setTabGroupItems(getTabGroupInfo());

    // Auto refresh every 10 minute for weekly leaderboard only
    const timer: NodeJS.Timer = setInterval(() => {
      setTabGroupItems(getTabGroupInfo());
    }, 600000);

    return () => {
      clearInterval(timer);
    };
  }, [onClickShare, t]);

  useEffect(() => {
    setContainerClass('leaderboard-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <LeaderboardContent
      className={className}
      defaultSelectedTab={TabType.VARA_PLAYDROP}
      tabGroupItems={tabGroupItems}
    />
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Leaderboard;
