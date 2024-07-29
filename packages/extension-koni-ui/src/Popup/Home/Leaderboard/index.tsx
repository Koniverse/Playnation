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
import { populateTemplateString } from '@subwallet/extension-koni-ui/utils';
import { calculateStartAndEnd } from '@subwallet/extension-koni-ui/utils/date';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { t } = useTranslation();
  const { setContainerClass } = useContext(HomeContext);

  const [account, setAccount] = useState(apiSDK.account);
  const [configList, setConfigList] = useState(apiSDK.configList);
  const [tabGroupItems, setTabGroupItems] = useState<LeaderboardTabGroupItemType[]>([]);

  const onClickShare = useCallback((contentShare: string, contentNotShowPoint: string, urlShare: string | undefined, hashtags: string | undefined) => {
    return (personMine?: LeaderboardPerson) => {
      if (!account) {
        return;
      }

      let content = contentNotShowPoint;

      if (personMine) {
        content = populateTemplateString(contentShare, personMine);
      }

      let hashtagsContent = '';

      if (hashtags) {
        hashtagsContent = `hashtags=${hashtags}`;
      }

      const linkShare = `${urlShare}?startApp=${account?.info.inviteCode || 'booka'}`;

      const url = `http://x.com/share?text=${content}&url=${linkShare}%0A&${hashtagsContent}`;

      telegramConnector.openLink(url);
    };
  }, [account]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const configSub = apiSDK.subscribeConfigList().subscribe((data) => {
      setConfigList(data);
    });

    return () => {
      accountSub.unsubscribe();
      configSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getTabGroupInfo = (): LeaderboardTabGroupItemType[] => {
      const leaderBoard = configList.find((item) => item.slug === 'leaderboard');

      if (leaderBoard) {
        // @ts-ignore
        return leaderBoard?.value.map((item) => {
          let startDate = item.from_date;
          let endDate = item.to_date;
          let _onClickShare = null;

          if (item.content_share) {
            _onClickShare = onClickShare(item.content_share, item.content_not_show_point, item.url, item.hashtags);
          }

          if (item.timeRange) {
            const { end, start } = calculateStartAndEnd(item.timeRange);

            startDate = start;
            endDate = end;
          }

          return {
            label: item.name,
            value: item.slug,
            leaderboardInfo: {
              onClickShare: _onClickShare,
              startDate,
              endDate,
              type: item.type,
              gameId: item.gameId
            }
          };
        });
      }

      return [];
    };

    setTabGroupItems(getTabGroupInfo());

    // Auto refresh every 10 minute for weekly leaderboard only
    const timer: NodeJS.Timer = setInterval(() => {
      setTabGroupItems(getTabGroupInfo());
    }, 600000);

    return () => {
      clearInterval(timer);
    };
  }, [onClickShare, t, configList]);

  useEffect(() => {
    setContainerClass('leaderboard-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <LeaderboardContent
      className={className}
      defaultSelectedTab={tabGroupItems.length > 0 ? tabGroupItems[0].value : ''}
      tabGroupItems={tabGroupItems}
    />
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Leaderboard;
