// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { CallToAction, EmptyListContent, GameAccountItem, MythButton, SubScreenHeader, UsersIcon } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/GameAccountItem';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { LINK_NFL_APP_DOWNLOAD } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { sendEventGA } from '@subwallet/extension-koni-ui/utils/googleAnalytics';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { InviteFriendsArea } from './InviteFriendsArea';
import { InviteMissionArea } from './InviteMissionArea';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/invite');
  const { goBack } = useDefaultNavigate();
  const notify = useNotification();

  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList?.data || []);

  const { t } = useTranslation();

  const friendItems = useMemo(() => {
    const result: GameAccountItemType[] = [];

    referralList.forEach((r) => {
      result.push({
        avatarSrc: r.accountInfo.avatar,
        name: `${r.accountInfo.firstName} ${r.accountInfo.lastName}`,
        point: r.accountInfo.point
      });
    });

    return result;
  }, [referralList]);

  const inviteURL = useMemo(() => {
    const encodeURL = apiSDK.getInviteURL();

    return `https://t.me/share/url?url=${encodeURL}&text=${encodeURIComponent('Come join me in Football Rivals. This mini-app is quite fun and allows you to win weekly real rewards.')}`;
  }, []);

  const inviteFriend = useCallback(() => {
    telegramConnector.openTelegramLink(inviteURL);
  }, [inviteURL]);

  const openAppStoreLink = useCallback(() => {
    sendEventGA('nfl-rivals-download-link-click');
    openInNewTab(LINK_NFL_APP_DOWNLOAD)();
  }, []);

  const copyLink = useCallback(() => {
    copyToClipboard(apiSDK.getInviteURL());

    notify({
      key: 'invite-copied',
      message: t('Copied to clipboard')
    });
  }, [notify, t]);

  useEffect(() => {
    const referralSub = apiSDK.subscribeReferralList().subscribe((refData) => {
      setReferralList(refData?.data || []);
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
          !!friendItems.length && friendItems.map((item) => (
            <GameAccountItem
              {...item}
              className={'friend-item'}
              key={item.prefix}
            />
          ))
        }
        {
          !friendItems.length && (
            <div className={'empty-list-area'}>
              <EmptyListContent
                className={'empty-list-content'}
                content={t('Invite friends and play together now!')}
                title={t('oops! no friends yet')}
              />

              <MythButton
                className={CN('invite-button')}
                icon={(
                  <span className={'__button-icon'}>
                    <UsersIcon />
                  </span>
                )}
                onClick={inviteFriend}
              >
                {t('Invite now')}
              </MythButton>
            </div>
          )
        }
      </div>

      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        onAction={openAppStoreLink}
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

    '.empty-list-area': {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',

      '&:before, &:after': {
        content: '""',
        display: 'block',
        minHeight: 32,
        flex: 1
      }
    },

    '.empty-list-content': {
      marginBottom: 16
    },

    '.invite-button': {
      minWidth: 160,
      marginLeft: 'auto',
      marginRight: 'auto',
      minHeight: 40,
      paddingLeft: 12,
      paddingRight: 10,
      color: extendToken.mythColorDark,

      '.__button-icon': {
        fontSize: 20
      },

      '.__button-inner': {
        gap: 6
      },

      '.__button-background': {
        // filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/invite/button-background.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.call-to-action': {}
  };
});

export default Invite;
