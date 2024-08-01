// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LeaderboardContent } from '@subwallet/extension-koni-ui/components';
import { LeaderboardTabGroupItemType } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardContent';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { LeaderboardItem, LeaderboardPerson, LeaderboardGroups } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { populateTemplateString } from '@subwallet/extension-koni-ui/utils';
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
  const [keyValueList, setKeyValueList] = useState(apiSDK.keyValueList);
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

    const keyValueSub = apiSDK.subscribeKeyValueList().subscribe((data) => {
      setKeyValueList(data);
    });

    return () => {
      accountSub.unsubscribe();
      keyValueSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const getTabGroupInfo = (): LeaderboardTabGroupItemType[] => {
      const leaderboardGeneral = keyValueList.leaderboard_general as unknown as LeaderboardGroups[];
      const leaderboards = keyValueList.leaderboard_map as unknown as LeaderboardItem[];

      if (leaderboardGeneral && leaderboards) {
        const value = leaderboardGeneral.length > 0 ? leaderboardGeneral[0] : null;

        if (!value) {
          return [];
        }

        const data: LeaderboardTabGroupItemType[] = [];

        // @ts-ignore
        value.leaderboards.forEach((item: Leaderboard) => {
          const id = item.id;
          const leaderboard = leaderboards.find((l) => l.id === id);
          let _onClickShare = null;

          if (leaderboard) {
            if (leaderboard.sharing) {
              const { content, hashtags, url } = leaderboard.sharing;

              _onClickShare = onClickShare(content, content, url, hashtags);
            }

            data.push({
              label: leaderboard.name,
              value: leaderboard.slug,
              leaderboardInfo: {
                onClickShare: _onClickShare,
                id: leaderboard.id
              }
            } as LeaderboardTabGroupItemType);
          }
        });

        return data;
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
  }, [onClickShare, t, keyValueList]);

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
