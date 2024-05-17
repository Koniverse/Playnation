// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { EXTENSION_VERSION, SUPPORT_URL } from '@subwallet/extension-koni-ui/constants/common';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Icon, SettingItem, SwIconProps } from '@subwallet/react-ui';
import { ArrowSquareOut, BookBookmark, CaretRight, Coins, GlobeHemisphereEast, Graph, Headset } from 'phosphor-react';
import React, { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

type SettingItemType = {
  key: string,
  leftIcon: SwIconProps['phosphorIcon'] | React.ReactNode,
  rightIcon: SwIconProps['phosphorIcon'],
  title: string,
  onClick?: () => void,
  isHidden?: boolean,
};

type SettingGroupItemType = {
  key: string,
  items: SettingItemType[],
};

const isReactNode = (element: unknown): element is React.ReactNode => {
  return React.isValidElement(element);
};

const telegramConnector = TelegramConnector.instance;

function generateLeftIcon (icon: SwIconProps['phosphorIcon'] | React.ReactNode): React.ReactNode {
  const isNode = isReactNode(icon);

  return (
    <BackgroundIcon
      customIcon={isNode ? icon : undefined}
      phosphorIcon={isNode ? undefined : icon}
      size='sm'
      type={isNode ? 'customIcon' : 'phosphor'}
      weight='fill'
    />
  );
}

function generateRightIcon (icon: SwIconProps['phosphorIcon']): React.ReactNode {
  return (
    <Icon
      className='__right-icon'
      customSize={'20px'}
      phosphorIcon={icon}
      type='phosphor'
    />
  );
}

// const modalId = 'about-subwallet-modal';

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const navigate = useNavigate();

  const { goHome } = useDefaultNavigate();
  const { t } = useTranslation();

  // todo: i18n all titles, labels below
  const SettingGroupItemType = useMemo((): SettingGroupItemType[] => ([
    {
      key: 'general',
      items: [
        {
          key: 'general-settings',
          leftIcon: GlobeHemisphereEast,
          rightIcon: CaretRight,
          title: t('General settings'),
          onClick: () => {
            navigate('/settings/general');
          }
        }
        // {
        //   key: 'security-settings',
        //   leftIcon: ShieldCheck,
        //   leftIconBgColor: token['green-6'],
        //   rightIcon: CaretRight,
        //   title: t('Security settings'),
        //   onClick: () => {
        //     navigate('/settings/security', { state: true });
        //   }
        // }
        // {
        //   key: 'mission-pools',
        //   leftIcon: Parachute,
        //   leftIconBgColor: token['cyan-5'],
        //   rightIcon: CaretRight,
        //   title: t('Mission pools'),
        //   onClick: () => {
        //     navigate('/settings/mission-pools', { state: true });
        //   }
        // }
      ]
    },
    // {
    //   key: 'website-access',
    //   label: t('Website access'),
    //   items: [
    //     {
    //       key: 'wallet-connect',
    //       leftIcon: (
    //         <WalletConnect
    //           height='1em'
    //           width='1em'
    //         />
    //       ),
    //       leftIconBgColor: token['geekblue-6'],
    //       rightIcon: CaretRight,
    //       title: t('WalletConnect'),
    //       onClick: () => {
    //         navigate('/wallet-connect/list');
    //       }
    //     }
    //   ]
    // },
    {
      key: 'assets-&-addresses',
      items: [
        {
          key: 'manage-networks',
          leftIcon: Graph,
          rightIcon: CaretRight,
          title: t('Manage networks'),
          onClick: () => {
            navigate('/settings/chains/manage');
          }
        },
        {
          key: 'manage-tokens',
          leftIcon: Coins,
          rightIcon: CaretRight,
          title: t('Manage tokens'),
          onClick: () => {
            navigate('/settings/tokens/manage');
          }
        },
        {
          key: 'manage-address-book',
          leftIcon: BookBookmark,
          rightIcon: CaretRight,
          title: t('Manage address book'),
          onClick: () => {
            navigate('/settings/address-book');
          }
        }
      ]
    },
    {
      key: 'community-&-support',
      items: [
        {
          key: 'contact-support',
          leftIcon: Headset,
          rightIcon: ArrowSquareOut,
          title: t('Contact support'),
          onClick: () => {
            telegramConnector.openTelegramLink(SUPPORT_URL);
          }
        }
        // {
        //   key: 'user-manual',
        //   leftIcon: Book,
        //   leftIconBgColor: token['green-6'],
        //   rightIcon: ArrowSquareOut,
        //   title: t('User guide'),
        //   onClick: openInNewTab(WIKI_URL)
        // },
        // {
        //   key: 'request-a-feature',
        //   leftIcon: ChatTeardropText,
        //   leftIconBgColor: token['magenta-7'],
        //   rightIcon: ArrowSquareOut,
        //   title: t('Request a feature'),
        //   onClick: () => {
        //     window.open(`${SUPPORT_MAIL}?subject=[SubWallet In-app Feedback]`, '_self');
        //   }
        // },
        // {
        //   key: 'about-subwallet',
        //   leftIcon: (
        //     <Image
        //       className='__subwallet-logo'
        //       height={24}
        //       shape='squircle'
        //       src={DefaultLogosMap.subwallet}
        //       width={24}
        //     />
        //   ),
        //   leftIconBgColor: 'transparent',
        //   rightIcon: CaretRight,
        //   title: t('About SubWallet'),
        //   onClick: () => {
        //     activeModal(modalId);
        //   }
        // }
      ]
    }
  ]), [navigate, t]);

  // const aboutSubwalletType = useMemo<SettingItemType[]>(() => {
  //   return [
  //     {
  //       key: 'website',
  //       leftIcon: Globe,
  //       rightIcon: ArrowSquareOut,
  //       leftIconBgColor: token['purple-7'],
  //       title: t('Website'),
  //       onClick: openInNewTab(WEBSITE_URL)
  //     },
  //     {
  //       key: 'terms-of-use',
  //       leftIcon: BookBookmark,
  //       rightIcon: ArrowSquareOut,
  //       leftIconBgColor: token['volcano-7'],
  //       title: t('Terms of use'),
  //       onClick: openInNewTab(TERMS_OF_SERVICE_URL)
  //     },
  //     {
  //       key: 'x',
  //       leftIcon: (
  //         <Image
  //           height={24}
  //           shape='squircle'
  //           src={DefaultLogosMap.xtwitter}
  //           width={24}
  //         />
  //       ),
  //       rightIcon: ArrowSquareOut,
  //       leftIconBgColor: token.colorBgSecondary,
  //       title: t('X (Twitter)'),
  //       onClick: openInNewTab(TWITTER_URL)
  //     }
  //   ];
  // }, [t, token]);

  // const closeModal = useCallback(() => {
  //   inactiveModal(modalId);
  // }, [inactiveModal]);

  return (
    <PageWrapper className={`settings ${className}`}>
      <>
        <Layout.WithSubHeaderOnly
          backgroundStyle={'secondary'}
          onBack={goHome}
          title={t('Settings')}
        >
          <div className={'__scroll-container'}>
            {
              SettingGroupItemType.map((group) => {
                return (
                  <div
                    className={'__group-container setting-group-container'}
                    key={group.key}
                  >
                    {group.items.map((item) => item.isHidden
                      ? null
                      : (
                        <SettingItem
                          className={'__setting-item setting-group-item'}
                          key={item.key}
                          leftItemIcon={generateLeftIcon(item.leftIcon)}
                          name={item.title}
                          onPressItem={item.onClick}
                          rightItem={
                            <>
                              {generateRightIcon(item.rightIcon)}
                            </>
                          }
                        />
                      ))}
                  </div>
                );
              })
            }
            <div className={'__version'}>
              PlayNation v {EXTENSION_VERSION}
            </div>
          </div>
        </Layout.WithSubHeaderOnly>

        <Outlet />
      </>
    </PageWrapper>
  );
}

export const Settings = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.settings': {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',

      '.ant-sw-header-center-part': {
        fontSize: token.fontSizeHeading4,
        lineHeight: token.lineHeightHeading4,
        fontWeight: token.headingFontWeight
      },

      '.__scroll-container': {
        overflow: 'auto',
        paddingTop: token.paddingXS,
        paddingRight: token.padding,
        paddingLeft: token.padding,
        paddingBottom: token.paddingLG
      },

      '.__group-container + .__group-container': {
        marginTop: token.margin
      },

      '.__version': {
        paddingTop: token.padding,
        textAlign: 'center',
        fontSize: token.size,
        lineHeight: token.lineHeight
      },
      '.__subwallet-logo': {
        borderRadius: '50%'
      }
    }
  });
});

export default Settings;
