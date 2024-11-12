// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { GameAccountItem, SubScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/GameAccountItem';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useDefaultNavigate, useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import CallToAction from '../../../components/Mythical/Common/CallToAction';
import { InviteFriendsArea } from './InviteFriendsArea';
import { InviteMissionArea } from './InviteMissionArea';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/invite');
  const { goBack } = useDefaultNavigate();
  const notify = useNotification();

  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList);

  const { t } = useTranslation();

  const friendItems = useMemo(() => {
    const result: GameAccountItemType[] = [];

    referralList.forEach((r) => {
      result.push({
        avatarSrc: r.accountInfo.avatar,
        name: r.accountInfo.telegramUsername,
        point: r.point
      });
    });

    return result;
  }, [referralList]);

  const inviteURL = useMemo(() => {
    const encodeURL = apiSDK.getInviteURL();

    return `https://t.me/share/url?url=${encodeURL}&text=${encodeURIComponent('Invite your friend and earn a bonus gift for each friend you bring in!')}`;
  }, []);

  const inviteFriend = useCallback(() => {
    telegramConnector.openTelegramLink(inviteURL);
  }, [inviteURL]);

  const copyLink = useCallback(() => {
    copyToClipboard(apiSDK.getInviteURL());

    notify({
      key: 'invite-copied',
      message: t('Copied to clipboard')
    });
  }, [notify, t]);

  useEffect(() => {
    const referralSub = apiSDK.subscribeReferralList().subscribe((data) => {
      setReferralList(data);
    });

    return () => {
      referralSub.unsubscribe();
    };
  }, []);

  return (
    <Layout.Base
      className={className}
      showHeader={false}
    >
      <SubScreenHeader
        className={'header-area'}
        onBack={goBack}
        title={t('Your friends')}
      />

      <InviteFriendsArea
        className={'invite-friends-area'}
        onCopy={copyLink}
        onInvite={inviteFriend}
      />

      <InviteMissionArea className={'invite-mission-area'} />

      <div className='friend-list-container'>
        {
          friendItems.map((item) => (
            <GameAccountItem
              {...item}
              className={'friend-item'}
              key={item.prefix}
            />
          ))
        }
      </div>

      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        subtitle={'Download NFL Rivals App'}
        title={'Want more friends?'}
      />
    </Layout.Base>
  );
};

const Invite = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-screen-layout-body-inner': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 38
    },

    '.header-area': {
      marginBottom: 12
    },

    '.invite-friends-area': {
      paddingTop: 26,
      paddingLeft: 24,
      paddingRight: 24,
      marginBottom: 8
    },

    '.invite-mission-area': {
      marginBottom: 8
    },

    '.friend-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingBottom: 4
    },

    '.friend-item + .friend-item': {
      marginTop: 4
    },

    '.call-to-action': {

    }
  };
});

export default Invite;
