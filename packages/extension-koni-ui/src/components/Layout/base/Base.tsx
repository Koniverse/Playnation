// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { GameSVG } from '@subwallet/extension-koni-ui/components';
import { useDefaultNavigate, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { LayoutBackgroundImages, LayoutBackgroundStyle, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, SwScreenLayout, SwScreenLayoutProps } from '@subwallet/react-ui';
import { SwTabBarItem } from '@subwallet/react-ui/es/sw-tab-bar';
import CN from 'classnames';
import { ArrowLeft, ChartBar, Parachute, Target, Wallet } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SelectAccount from '../parts/SelectAccount';

export interface LayoutBaseProps extends Omit<
SwScreenLayoutProps,
'tabBarItems' | 'footer' | 'headerContent' | 'selectedTabBarItem'
>, ThemeProps {
  children: React.ReactNode | React.ReactNode[];
  backgroundStyle?: LayoutBackgroundStyle;
  backgroundImages?: LayoutBackgroundImages;
  onTabSelected?: (key: string) => void
}

const specialLanguages: Array<LanguageType> = ['ja', 'ru'];

const Component = ({ backgroundImages, backgroundStyle, children, className, headerIcons, onBack, onTabSelected, ...props }: LayoutBaseProps) => {
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { language } = useSelector((state) => state.settings);

  const tabBarItems = useMemo((): Array<Omit<SwTabBarItem, 'onClick'> & { url: string }> => ([
    {
      icon: {
        type: 'customIcon',
        customIcon: <GameSVG />
      },
      label: t('Games'),
      key: 'games',
      url: '/home/games'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Target,
        weight: 'fill'
      },
      label: t('Missions'),
      key: 'mission',
      url: '/home/mission'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: ChartBar,
        weight: 'fill'
      },
      label: t('Leaderboard'),
      key: 'leaderboard',
      url: '/home/leaderboard'
    },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: UserCirclePlus,
    //     weight: 'fill'
    //   },
    //   label: t('Invite'),
    //   key: 'invite',
    //   url: '/home/invite'
    // },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Parachute,
        weight: 'fill'
      },
      label: t('Airdrop'),
      key: 'airdrop',
      url: '/home/airdrop'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Wallet,
        weight: 'fill'
      },
      label: t('Wallet'),
      key: 'tokens',
      url: '/home/tokens'
    }
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Aperture,
    //     weight: 'fill'
    //   },
    //   label: t('NFTs'),
    //   key: 'nfts',
    //   url: '/home/nfts/collections'
    // },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Vault,
    //     weight: 'fill'
    //   },
    //   label: t('Earning'),
    //   key: 'earning',
    //   url: '/home/earning'
    // },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Rocket,
    //     weight: 'fill'
    //   },
    //   label: t('Crowdloans'),
    //   key: 'crowdloans',
    //   url: '/home/crowdloans'
    // },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Database,
    //     weight: 'fill'
    //   },
    //   label: t('Staking'),
    //   key: 'staking',
    //   url: '/home/staking'
    // },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Clock,
    //     weight: 'fill'
    //   },
    //   label: t('History'),
    //   key: 'history',
    //   url: '/home/history'
    // }
  ]), [t]);

  const selectedTab = useMemo((): string => {
    const isHomePath = pathname.includes('/home');

    if (isHomePath) {
      const pathExcludeHome = pathname.split('/home')[1];
      const currentTab = pathExcludeHome.split('/')[1];

      return currentTab || '';
    }

    return '';
  }, [pathname]);

  const onSelectTab = useCallback(
    (url: string) => () => {
      navigate(url);
    },
    [navigate]
  );

  const defaultOnBack = useCallback(() => {
    goHome();
  }, [goHome]);

  useEffect(() => {
    onTabSelected?.(selectedTab);
  }, [onTabSelected, selectedTab]);

  return (
    <SwScreenLayout
      subHeaderLeft={(
        <Icon
          phosphorIcon={ArrowLeft}
          size='md'
          type='phosphor'
        />
      )}
      {...props}
      className={CN(className, {
        'special-language': specialLanguages.includes(language),
        '-show-tab-bar': props.showTabBar,
        '-primary-style': backgroundStyle === 'primary',
        '-secondary-style': backgroundStyle === 'secondary',
        '-has-game-bgi': backgroundImages?.game,
        '-has-euro-bgi': backgroundImages?.euro
      })}
      headerContent={props.showHeader && <SelectAccount />}
      headerIcons={headerIcons}
      onBack={onBack || defaultOnBack}
      selectedTabBarItem={selectedTab}
      tabBarItems={tabBarItems.map((item) => ({
        ...item,
        onClick: onSelectTab(item.url)
      }))}
    >
      <div className={'ant-sw-screen-layout-body-inner'}>
        {children}
      </div>
      {
        backgroundImages && (
          <>
            {
              backgroundImages.game && (
                <img
                  alt='game_background_image'
                  className={'game-background-image layout-background-image'}
                  src={DefaultLogosMap.game_background_image}
                />
              )
            }
            {
              backgroundImages.euro && (
                <img
                  alt='euro_background_image'
                  className={'euro-background-image layout-background-image'}
                  src={DefaultLogosMap.euro_background_image}
                />
              )
            }
          </>
        )
      }
    </SwScreenLayout>
  );
};

const Base = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({
  '.ant-sw-screen-layout-body': {
    overflow: 'hidden'
  },

  '.ant-sw-screen-layout-body-inner': {
    overflow: 'auto',
    position: 'relative',
    height: '100%',
    zIndex: 5
  },

  '&.-primary-style': {
    background: extendToken.colorBgGradient || token.colorPrimary
  },

  '&.-secondary-style': {
    backgroundColor: token.colorBgSecondary
  },

  '&.-has-game-bgi': {
    '.game-background-image': {
      position: 'fixed',
      top: '56%',
      width: 138,
      height: 'auto',
      left: -17,
      zIndex: 0
    }
  },

  '&.-has-euro-bgi.-show-tab-bar': {
    '.euro-background-image': {
      position: 'fixed',
      pointerEvents: 'none',
      left: 'calc(50% - 370px)',
      width: 740,
      height: 'auto',
      bottom: -155,
      zIndex: 6
    }
  },

  '&.-has-euro-bgi:not(.-show-tab-bar)': {
    '.euro-background-image': {
      position: 'fixed',
      pointerEvents: 'none',
      left: 'calc(50% - 288px)',
      width: 576,
      opacity: 0.65,
      height: 'auto',
      bottom: 0,
      zIndex: 0
    }
  },

  '> .ant-sw-screen-layout-header .ant-sw-header-bg-default': {
    backgroundColor: 'transparent'
  },

  '&.-show-tab-bar > .ant-sw-screen-layout-body > .ant-sw-screen-layout-body-inner': {
    paddingBottom: 90
  },

  '.ant-sw-tab-bar-container': {
    position: 'fixed',
    width: 'auto',
    bottom: 24,
    left: token.sizeXS,
    right: token.sizeXS,
    padding: `9px ${token.padding}px`,
    borderRadius: 40,
    alignItems: 'flex-start',
    backgroundColor: extendToken.colorBgSecondary2,
    zIndex: 500,

    '.ant-sw-tab-bar-item': {
      gap: token.sizeXXS,

      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: token.colorTextLight3
      }
    },

    '.ant-sw-tab-bar-item:hover': {
      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: token.colorTextLight1
      }
    },

    '.ant-sw-tab-bar-item.ant-sw-tab-bar-item-active': {
      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: token.colorPrimary
      }
    },

    '.ant-sw-tab-bar-item-label': {
      textAlign: 'center',
      fontSize: 10,
      lineHeight: 1.6
    }
  },

  '&.special-language': {
    '.ant-sw-tab-bar-container': {
      paddingBottom: token.padding,

      '.ant-sw-tab-bar-item': {
        gap: token.sizeXXS,

        '.ant-sw-tab-bar-item-label': {
          fontSize: token.fontSizeXS,
          lineHeight: 1,
          maxWidth: token.sizeXXL,
          overflowWrap: 'break-word'
        }
      }
    }
  }
}));

export default Base;
