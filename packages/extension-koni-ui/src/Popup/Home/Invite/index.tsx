// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { GameLogo, GamePoint } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount, ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, formatInteger } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const rankPointMap: Record<string, number> = {
  iron: 600,
  bronze: 1500,
  silver: 4500,
  gold: 13500,
  platinum: 40500,
  diamond: 121500
};

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/invite');
  const { t } = useTranslation();
  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList);
  const [account, setAcount] = useState<BookaAccount | undefined>(apiSDK.account);
  const notify = useNotification();

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAcount(data);
    });

    const referralSub = apiSDK.subscribeReferralList().subscribe((data) => {
      setReferralList(data);
    });

    return () => {
      accountSub.unsubscribe();
      referralSub.unsubscribe();
    };
  }, []);

  const invitePoint = useMemo(() => {
    if (!account) {
      return 0;
    }

    const rank = account.attributes?.rank || 'iron';
    const point = rankPointMap[rank] || 0;

    return point;
  }, [account]);

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

  return <div className={className}>
    <div className={'invite-data'}>
      <div className={'invite-reward'}>
        <Typography.Title level={4}>
          {t('Invite your friends and earn rewards!')}
        </Typography.Title>
        <div
          className={'invite-item'}
        >
          <GameLogo size={40} />
          <div className='invite-title'>
            <Typography.Title
              className={'__title'}
              level={6}
            >{t('Invite friend with link')}</Typography.Title>
            <Typography.Text
              className={'__sub-title'}
              size={'sm'}
            >
              <GamePoint
                preText={'up to'}
                text={formatInteger(invitePoint)}
              />
            </Typography.Text>
          </div>
          <Button
            icon={<Icon
              phosphorIcon={Copy}
              size={'sm'}
            />}
            onClick={copyLink}
            size={'xs'}
            type={'ghost'}
          />
          <Button
            icon={<Icon
              phosphorIcon={UserCirclePlus}
              size={'sm'}
            />}
            onClick={inviteFriend}
            size={'xs'}
            type={'ghost'}
          />
        </div>
      </div>
      <div className='invite-friends'>
        <Typography.Title level={4}>
          {t('Your friends list')}
        </Typography.Title>
        <div className={'ref-list'}>
          {referralList.map((item) => (
            <GameAccount
              avatar={item.accountInfo.avatar}
              className={CN('account-info')}
              key={item.accountInfo.id}
              name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
              point={item.point}
            />
          ))}
        </div>
      </div>
    </div>
    <div className={'invite-footer'}>
      <Button
        icon={<Icon
          phosphorIcon={UserCirclePlus}
          size={'lg'}
        />}
        onClick={inviteFriend}
      >
        {t('Invite Friends')}
      </Button>
    </div>
  </div>;
};

const Invite = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    height: '100%',
    padding: token.padding,
    display: 'flex',
    flexDirection: 'column',

    '.invite-data': {
      flex: 1,
      overflow: 'auto'
    },

    '.invite-item': {
      alignItems: 'center',
      display: 'flex',
      marginBottom: token.marginXS,
      padding: token.paddingSM,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgSecondary,

      '.invite-banner': {
        marginRight: token.marginSM
      },

      '.invite-title': {
        flex: 1,
        marginLeft: token.marginSM,

        '.__title': {
          marginBottom: 0
        }
      }
    },

    '.ref-list': {
      '.account-info': {
        marginBottom: token.marginXS
      }
    },

    '.invite-footer': {
      '.ant-btn': {
        width: '100%'
      }
    }
  };
});

export default Invite;
