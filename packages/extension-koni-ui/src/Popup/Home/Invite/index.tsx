// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { EmptyList, GameAccountAvatar, GamePoint, Layout } from '@subwallet/extension-koni-ui/components';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount, ReferralRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { detailScreensLayoutBackgroundImages, rankPointMap } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, Plus, SmileySad, UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/invite');
  const { t } = useTranslation();
  const [referralList, setReferralList] = useState<ReferralRecord[]>(apiSDK.referralList);
  const stickyRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const notify = useNotification();

  const totalCount = useMemo(() => {
    if (referralList.length === 0) {
      return 0;
    }

    const item = referralList[0];

    return item.total_count;
  }, [referralList]);

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

  const subHeaderIcons = useMemo(() => {
    return [{
      icon: (
        <Icon
          customSize={'24px'}
          phosphorIcon={Plus}
        />
      ),
      onClick: inviteFriend
    }];
  }, [inviteFriend]);

  useEffect(() => {
    const currentElement = stickyRef.current;
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (currentElement && scrollContainer) {
        const stickyTop = currentElement.getBoundingClientRect().top;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const isStickyNow = stickyTop <= containerTop;

        console.log('isStickyNow', isStickyNow, stickyTop, containerTop);

        setIsSticky(isStickyNow);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <Layout.WithSubHeaderOnly
      backgroundImages={detailScreensLayoutBackgroundImages}
      backgroundStyle={'primary'}
      className={CN(className)}
      subHeaderIcons={subHeaderIcons}
      title={t('Invite friends')}
    >
      <img
        alt='game_background_image'
        className={'__background-image-1'}
        src={DefaultLogosMap.game_background_image}
      />

      <img
        alt='game_background_image'
        className={'__background-image-2'}
        src={DefaultLogosMap.game_background_image}
      />

      <div className={CN('account-info-area', {
        '-sticky': isSticky
      })}
      >
        <div className='account-info-area-left-part'>
          <GameAccountAvatar
            avatarPath={account?.info.photoUrl || undefined}
            className={'account-avatar'}
            size={'custom'}
          />

        </div>
        <div className='account-info-area-center-part'>
          <GamePoint
            className={'account-point'}
            point={formatIntegerShort(account?.attributes.point || 0)}
            size={18}
          />
          <div className='friend-count'>
            {totalCount} {t(totalCount > 1 ? 'frens' : 'fren')}
          </div>
        </div>

        <div className={CN('account-info-area-right-part', {
          hidden: !isSticky
        })}
        >
          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={UserCirclePlus}
                weight={'fill'}
              />
            )}
            onClick={inviteFriend}
            shape={'round'}
            size={'xs'}
            type={'ghost'}
          />

          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={Copy}
                weight={'fill'}
              />
            )}
            onClick={copyLink}
            shape={'round'}
            size={'xs'}
            type={'ghost'}
          />
        </div>
      </div>

      <div
        className='scroll-container'
        ref={scrollContainerRef}
      >
        <div className='invitation-area'>
          <div className='invitation-text'>
            {t('Invite frens and play together!')}
          </div>

          <div className='invitation-reward'>
            {t('Up to')} {formatIntegerShort(invitePoint)}

            <img
              alt='token'
              className={'invitation-reward-token'}
              src={DefaultLogosMap.token_icon}
            />
          </div>

          <div className='invitation-buttons'>
            <Button
              block={true}
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={UserCirclePlus}
                  weight={'fill'}
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
              {t('Copy link')}
            </Button>
          </div>
        </div>

        <div
          className={'friend-list-title'}
          ref={stickyRef}
        >
          {t('Invite list')}
        </div>

        <div className={CN('friend-list-container', { '-empty': !referralList.length })}>
          {referralList.map((item, index) => (
            <GameAccount
              avatar={item.accountInfo.avatar}
              className={CN('friend-item')}
              key={`${item.accountInfo.id}-${index}`}
              name={`${item.accountInfo.firstName || ''} ${item.accountInfo.lastName || ''}`}
              point={item.point}
            />
          ))}

          {
            !referralList.length && (
              <EmptyList
                className={'empty-list-block'}
                emptyMessage={t('Invite now')}
                emptyTitle={t('Uh oh, no frens invited')}
                phosphorIcon={SmileySad}
              />
            )
          }
        </div>
      </div>
    </Layout.WithSubHeaderOnly>
  );
};

const Invite = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-screen-layout-body-inner': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      position: 'relative'
    },

    '.ant-sw-screen-layout-body-inner > div': {
      position: 'relative',
      zIndex: 5
    },

    '.__background-image-1, .__background-image-2': {
      position: 'absolute',
      width: 138,
      height: 'auto',
      zIndex: 0
    },

    '.__background-image-1': {
      left: -17,
      top: 4
    },

    '.__background-image-2': {
      right: -30,
      top: 51
    },

    '.account-info-area': {
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 20,
      paddingTop: token.paddingSM,
      paddingBottom: token.paddingSM,
      paddingRight: token.padding,
      paddingLeft: token.padding,
      display: 'flex',
      overflow: 'hidden',
      marginBottom: token.margin,
      gap: token.sizeSM,
      alignItems: 'center'
    },

    '.account-info-area-center-part': {
      flex: 1,
      overflow: 'hidden'
    },

    '.account-info-area-right-part': {
      marginRight: -token.marginXS
    },

    '.account-avatar': {
      borderWidth: 2,
      width: 80,
      height: 80,
      minWidth: 80,

      '.__inner': {
        borderWidth: 4
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    },

    '.account-point': {
      marginBottom: token.marginXXS,

      '.__point-value': {
        fontSize: token.fontSizeHeading3,
        lineHeight: token.lineHeightHeading3,
        fontWeight: token.headingFontWeight,
        color: token.colorTextDark1
      }
    },

    '.friend-count': {
      color: token.colorTextDark1,
      fontSize: token.fontSizeLG,
      lineHeight: '21px',
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '.account-info-area.-sticky': {
      '.account-avatar': {
        width: 64,
        height: 64,
        minWidth: 64,

        '.__inner': {
          borderWidth: 3
        }
      }
    },

    '.scroll-container': {
      flex: 1,
      overflow: 'auto',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      display: 'flex',
      flexDirection: 'column'
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

    '.friend-list-title': {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'sticky',
      top: 0,
      minHeight: 52,
      backgroundColor: extendToken.colorBgSecondary1,
      display: 'flex',
      alignItems: 'center',
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: token.paddingXS,
      fontWeight: token.headingFontWeight,
      paddingBottom: token.paddingXXS,
      zIndex: 10
    },

    '.friend-list-container': {
      flex: 1,
      backgroundColor: extendToken.colorBgSecondary1,
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: token.paddingXS
    },

    '.friend-list-container.-empty': {
      flex: '0 1 auto',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      marginBottom: token.margin
    },

    '.friend-item': {
      marginBottom: token.marginXS
    },

    '.empty-list-block': {
      paddingTop: 24,
      paddingBottom: 24,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    }
  };
});

export default Invite;
