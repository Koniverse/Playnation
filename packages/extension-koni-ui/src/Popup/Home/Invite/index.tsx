// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { GameLogo, GamePoint } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/invite');
  const { t } = useTranslation();
  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList);

  useEffect(() => {
    const referralSub = apiSDK.subscribeReferralList().subscribe((data) => {
      console.log('referralList', data);
      setReferralList(data);
    });

    return () => {
      referralSub.unsubscribe();
    };
  }, []);

  const inviteFriend = useCallback(() => {
    const encodeURL = apiSDK.getInviteURL();
    const inviteURL = `https://t.me/share/url?url=${encodeURL}&text=${encodeURIComponent('Invite your friend and earn a bonus gift for each friend you bring in!')}`;

    telegramConnector.openTelegramLink(inviteURL);
  }, []);

  return <div className={className}>
    <div className={'invite-data'}>
      <div className={'invite-reward'}>
        <Typography.Title level={4}>
          {t('Invite your friends and play together !')}
        </Typography.Title>
        <div
          className={'task-item'}
        >
          <GameLogo size={40} />
          <div className='task-title'>
            <Typography.Title
              className={'__title'}
              level={6}
            >{t('Invite friend')}</Typography.Title>
            <Typography.Text
              className={'__sub-title'}
              size={'sm'}
            >
              <GamePoint text={' x 100 for you and friend'} />
            </Typography.Text>
          </div>
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
              info={item.point.toString()}
              key={item.accountInfo.id}
              name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
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

    '.task-item': {
      alignItems: 'center',
      display: 'flex',
      marginBottom: token.marginXS,
      padding: token.paddingSM,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgSecondary,

      '.task-banner': {
        marginRight: token.marginSM
      },

      '.task-title': {
        flex: 1,
        marginLeft: token.marginSM,

        '.__title': {
          marginBottom: 0
        }
      },

      '.play-button': {
        marginLeft: token.marginSM
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
