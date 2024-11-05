// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { CampaignBannerModal, Layout, YourRewardsModal, YourRewardsModalProps } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { homeScreensLayoutBackgroundImages, YOUR_REWARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetBannerByScreen, useGetChainSlugsByAccountType, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
const apiSDK = BookaSdk.instance;
const metadataHandler = MetadataHandler.instance;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const [containerClass, setContainerClass] = useState<string | undefined>();
  const [yourRewardsModalProps, setYourRewardsModalProps] = useState<YourRewardsModalProps | undefined>();

  const banners = useGetBannerByScreen('home');

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const firstBanner = useMemo((): CampaignBanner | undefined => banners[0], [banners]);

  const [backgroundStyle, setBackgroundStyle] = useState<LayoutBaseProps['backgroundStyle'] | undefined>();
  const navigate = useNavigate();

  const onOpenGlobalSearchToken = useCallback(() => {
    activeModal(GlobalSearchTokenModalId);
  }, [activeModal]);

  const onCloseGlobalSearchToken = useCallback(() => {
    inactiveModal(GlobalSearchTokenModalId);
  }, [inactiveModal]);

  useEffect(() => {
    const handleMaintenance = (info: MaintenanceInfo) => {
      if (info.isMaintenance) {
        navigate('/maintenance');
      }
    };

    const unsub1 = metadataHandler.maintenanceSubject.subscribe(handleMaintenance);

    const handleBanedAccount = (isEnabled: boolean) => {
      if (!isEnabled) {
        navigate('/account-banned');
      }
    };

    const unsub2 = apiSDK.isAccountEnable.subscribe(handleBanedAccount);

    return () => {
      unsub1.unsubscribe();
      unsub2.unsubscribe();
    };
  }, [navigate]);

  const onTabSelected = useCallback(
    (key: string) => {
      if (key === 'tokens') {
        setBackgroundStyle(undefined);
      } else {
        setBackgroundStyle('primary');
      }
    },
    []
  );

  const openYourRewardsModal = useCallback((props: YourRewardsModalProps) => {
    setYourRewardsModalProps(props);
    activeModal(YOUR_REWARD_MODAL);
  }, [activeModal]);

  const closeYourRewardsModal = useCallback(() => {
    inactiveModal(YOUR_REWARD_MODAL);
    setYourRewardsModalProps(undefined);
  }, [inactiveModal]);

  const onViewDetailRewardModal = useCallback(() => {
    navigate('/reward-detail');
    closeYourRewardsModal();
  }, [closeYourRewardsModal, navigate]);

  const onOkRewardModal = useCallback(() => {
    closeYourRewardsModal();
  }, [closeYourRewardsModal]);

  const onCancelRewardModal = useCallback(() => {
    closeYourRewardsModal();
  }, [closeYourRewardsModal]);

  useEffect(() => {
    openYourRewardsModal({
      onViewDetail: onViewDetailRewardModal,
      onOk: onOkRewardModal,
      onCancel: onCancelRewardModal,
      rewardInfo: {
        iconSrc: '/images/games/token-icon.png',
        value: 200,
        symbol: 'SP'
      }
    });
  }, [onCancelRewardModal, onOkRewardModal, onViewDetailRewardModal, openYourRewardsModal]);

  return (
    <>
      <HomeContext.Provider value={{
        tokenGroupStructure,
        accountBalance,
        setContainerClass
      }}
      >
        <Layout.Home
          backgroundImages={homeScreensLayoutBackgroundImages}
          backgroundStyle={backgroundStyle}
          className={CN('home', 'home-container', className, containerClass)}
          onClickSearchIcon={onOpenGlobalSearchToken}
          onTabSelected={onTabSelected}
          showGiftIcon
        >
          <Outlet />
        </Layout.Home>
      </HomeContext.Provider>

      <GlobalSearchTokenModal
        id={GlobalSearchTokenModalId}
        onCancel={onCloseGlobalSearchToken}
        sortedTokenSlugs={tokenGroupStructure.sortedTokenSlugs}
        tokenBalanceMap={accountBalance.tokenBalanceMap}
      />
      {firstBanner && <CampaignBannerModal banner={firstBanner} />}
      {
        !!yourRewardsModalProps && (
          <YourRewardsModal
            {...yourRewardsModalProps}
          />
        )
      }
    </>
  );
}

const Home = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    height: '100%',

    '&.leaderboard-screen-wrapper': {
      '> .ant-sw-screen-layout-body > .ant-sw-screen-layout-body-inner': {
        paddingBottom: 0,

        '> div': {
          height: '100%'
        }
      }
    },

    [`
      &.wallet-screen-wrapper,
      &.game-screen-wrapper,
      &.invitation-screen-wrapper,
      &.mission-screen-wrapper,
      &.airdrop-screen-wrapper,
      &.history-screen-wrapper
    `]: {
      '> .ant-sw-screen-layout-body > .ant-sw-screen-layout-body-inner': {
        paddingBottom: 56,

        '> div': {
          height: '100%'
        }
      }
    },

    '&.game-screen-wrapper.-show-game': {
      '.ant-sw-screen-layout-body-inner': {
        position: 'static'
      },

      '.ant-sw-screen-layout-footer, .layout-background-image': {
        opacity: 0,
        pointerEvents: 'none'
      }
    }
  });
});

export default Home;
