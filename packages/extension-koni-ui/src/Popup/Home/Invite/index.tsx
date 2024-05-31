// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount, ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { rankPointMap } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, UserPlus } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/invite');
  const { t } = useTranslation();
  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList);
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const { setContainerClass } = useContext(HomeContext);
  const notify = useNotification();

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
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

    return rankPointMap[rank] || 0;
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

  useEffect(() => {
    setContainerClass('invitation-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      <div className='account-info-area'>
        <GameAccountAvatar
          avatarPath={account?.info.photoUrl || undefined}
          className={'account-avatar'}
          hasBoxShadow
          size={5}
        />
        <div className='account-point'>
          <div className='account-point-value'>
            {formatIntegerShort(account?.attributes.point || 0)}
          </div>
          <img
            alt={'token'}
            className='account-point-token'
            src={DefaultLogosMap.token_icon}
          />
        </div>

        <div className='friend-count'>
          {referralList.length} {t('Friends')}
        </div>
      </div>

      <div className='invitation-area'>
        <div className='invitation-text'>
          {t('Invite your friends and play together !')}
        </div>

        <div className='invitation-reward'>
          {t('Up to')} {formatIntegerShort(invitePoint)}

          <img
            alt='token'
            className={'invitation-reward-token'}
            src={DefaultLogosMap.token_icon}
          />
        </div>

        {
          account && (
            <div className='invitation-buttons'>
              <Button
                block={true}
                icon={(
                  <Icon
                    customSize={'20px'}
                    phosphorIcon={UserPlus}
                  />
                )}
                onClick={inviteFriend}
                schema={'primary'}
                shape={'round'}
                size={'xs'}
              >
                {t('Invite now')}
              </Button>

              <Button
                block={true}
                icon={(
                  <Icon
                    customSize={'20px'}
                    phosphorIcon={Copy}
                    weight={'fill'}
                  />
                )}
                onClick={copyLink}
                schema={'secondary'}
                shape={'round'}
                size={'xs'}
              >
                {t('Copy Link')}
              </Button>
            </div>
          )
        }
      </div>

      {
        !!referralList.length && (
          <div className={'friend-list-area'}>
            <div className={'friend-list-title'}>
              {t('Your friends list')}
            </div>

            <div className={'friend-list-scroller'}>
              {referralList.map((item, index) => (
                <GameAccount
                  avatar={item.accountInfo.avatar}
                  className={CN('friend-item')}
                  key={`${item.accountInfo.id}-${index}`}
                  name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
                  point={item.point}
                />
              ))}
            </div>
          </div>
        )
      }
    </div>
  );
};

const Invite = styled(Component)<ThemeProps>(({theme: {extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: token.paddingXS,
    paddingRight: token.paddingXS,

    '.account-info-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: token.paddingXXS,
      paddingBottom: token.padding
    },

    '.account-avatar': {
      marginBottom: token.marginXS
    },

    '.account-point': {
      display: 'flex',
      gap: token.sizeXXS,
      alignItems: 'center',
      marginBottom: token.margin
    },

    '.account-point-value': {
      color: token.colorTextDark2,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight
    },

    '.account-point-token': {
      minWidth: 20,
      height: 20
    },

    '.friend-count': {
      color: token.colorTextDark1,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      paddingTop: token.paddingXXS,
      paddingBottom: token.paddingXXS,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.invitation-area': {
      backgroundColor: token.colorWhite,
      borderRadius: 20,
      padding: token.padding,
      marginBottom: token.margin
    },

    '.invitation-text': {
      color: token.colorTextDark1,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.headingFontWeight,
      textAlign: 'center',
      marginBottom: token.marginXS
    },

    '.invitation-reward': {
      color: token.colorTextDark3,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      verticalAlign: 'baseline',
      textAlign: 'center',
      marginBottom: 22
    },

    '.invitation-reward-token': {
      display: 'inline-block',
      width: 20,
      height: 20,
      marginLeft: token.marginXXS
    },

    '.invitation-buttons': {
      display: 'flex',
      gap: token.sizeSM
    },

    '.friend-list-area': {
      backgroundColor: token.colorWhite,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: token.paddingXS,
      paddingBottom: 34,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    '.friend-list-title': {
      minHeight: 40,
      display: 'flex',
      alignItems: 'center',
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      paddingLeft: 24,
      paddingRight: 24,
      fontWeight: token.headingFontWeight,
      marginBottom: token.marginXS
    },

    '.friend-list-scroller': {
      overflow: 'auto',
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.friend-item': {
      marginBottom: token.marginXS
    }
  };
});

export default Invite;
