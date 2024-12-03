// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NftMintingLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { CONFIRM_SHOW_MINTING_FAILED_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useConfirmModal, useDefaultNavigate, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { LayoutBackgroundImages, LayoutBackgroundStyle, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, SwModalFuncProps, SwScreenLayout, SwScreenLayoutProps } from '@subwallet/react-ui';
import { SwTabBarItem } from '@subwallet/react-ui/es/sw-tab-bar';
import CN from 'classnames';
import { ArrowLeft, ChartBar, CheckCircle, Gift, House, Target, UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

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

type TabItemType = Omit<SwTabBarItem, 'onClick'> & { url: string };
const apiSDK = BookaSdk.instance;

const Component = ({ backgroundImages, backgroundStyle, children, className, headerIcons, onBack, onTabSelected, ...props }: LayoutBaseProps) => {
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { language } = useSelector((state) => state.settings);

  const { token } = useTheme() as Theme;

  const [mintingLog, setMintingLog] = useState<NftMintingLog | undefined>();
  const [isShowPopupMintFailed, setIsShowPopupMintFailed] = useLocalStorage(CONFIRM_SHOW_MINTING_FAILED_MODAL, 'nonConfirmed');

  const tabBarItems = useMemo((): TabItemType[] => ([
    // {
    //   icon: {
    //     type: 'customIcon',
    //     customIcon: <GameSVG />
    //   },
    //   label: t('Games'),
    //   key: 'games',
    //   url: '/home/games'
    // },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: House,
        weight: 'fill'
      },
      label: t('Home'),
      key: 'account',
      url: '/home/account'
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
        phosphorIcon: UserCirclePlus,
        weight: 'fill'
      },
      label: t('Invite'),
      key: 'invite',
      url: '/home/invite'
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
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Gift,
        weight: 'fill'
      },
      label: t('Mint'),
      key: 'mint',
      url: '/home/mint'
    }
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Parachute,
    //     weight: 'fill'
    //   },
    //   label: t('Airdrop'),
    //   key: 'airdrop',
    //   url: '/home/airdrop'
    // },
    // {
    //   icon: {
    //     type: 'phosphor',
    //     phosphorIcon: Wallet,
    //     weight: 'fill'
    //   },
    //   label: t('Wallet'),
    //   key: 'tokens',
    //   url: '/home/tokens'
    // }
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
    (item: TabItemType) => () => {
      navigate(item.url);
    },
    [navigate]
  );

  const defaultOnBack = useCallback(() => {
    goHome();
  }, [goHome]);

  const mintingFailedModalProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'alert-minting-failed',
    className: CN('general-confirmation-modal', className),
    title: t('Badge minting failed'),
    okText: t('I understand'),
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Mint your badge again')}</div>
        <div className={'__sub-title-modal'}>{t('Due to technical issues, your badge wasn’t minted in Phase 1. Click the Mint tab to mint your badge again on December 6')}</div>
      </div>
    ),
    icon: (
      <div className={'__icon-modal'}>
        <Icon
          customSize={'60px'}
          iconColor={token.colorIconHover}
          phosphorIcon={Gift}
          size='md'
          weight={'fill'}
        />
      </div>
    ),
    closable: true,
    maskClosable: true,
    okCancel: false,
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={CheckCircle}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIconHover]);

  const { handleSimpleConfirmModal: handleMintingFailedModal } = useConfirmModal(mintingFailedModalProps);

  useEffect(() => {
    const fetchMintingLog = async () => {
      try {
        const mintingLog = await apiSDK.getNftMintingLog();

        setMintingLog(mintingLog);
      } catch (error) {
        console.error('Error fetching minting log:', error);
      }
    };

    fetchMintingLog().catch(console.error);
  }, []);

  useEffect(() => {
    if (mintingLog?.notify && isShowPopupMintFailed.includes('nonConfirmed')) {
      setIsShowPopupMintFailed('confirmed');
      handleMintingFailedModal().then().catch(console.error);
    }
  }, [handleMintingFailedModal, isShowPopupMintFailed, mintingLog?.notify, navigate, setIsShowPopupMintFailed]);

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
        onClick: onSelectTab(item)
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

  '.layout-background-image': {
    opacity: 0
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
