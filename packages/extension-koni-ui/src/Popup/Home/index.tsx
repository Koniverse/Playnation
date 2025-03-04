// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AddRewardsModal, AddRewardsModalProps, CampaignBannerModal, InitRewardsModal, InitRewardsModalProps, Layout, LoadingScreen, MainnetProfileModal } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import PWAInstruction from '@subwallet/extension-koni-ui/components/Modal/PWA/PWAIntruction';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ACCOUNT_ADD_POINT_MODAL, ACCOUNT_INIT_POINT_MODAL, homeScreensLayoutBackgroundImages, MAINNET_PROFILE_MODAL, PWA_INSTRUCTION_MODAL, SHOW_INSTRUCTION_MODAL, SHOW_MAINNET_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetBannerByScreen, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { useGetChainSlugsByAccountType } from '@subwallet/extension-koni-ui/hooks/screen/home/useGetChainSlugsByAccountType';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isAndroid, isPWABrowser } from '@subwallet/extension-koni-ui/utils';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
const apiSDK = BookaSdk.instance;
const metadataHandler = MetadataHandler.instance;
let isAddPointShowed = false; // Use let instead of ref to avoid reload all components
const instructionPWAModalId = PWA_INSTRUCTION_MODAL;
const instructionLocalKey = SHOW_INSTRUCTION_MODAL;
const mainnetProfileLocalKey = SHOW_MAINNET_PROFILE_MODAL;
const mainnetProfileModalId = MAINNET_PROFILE_MODAL;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [containerClass, setContainerClass] = useState<string | undefined>();
  const [addRewardModalProps, setAddRewardModalProps] = useState<AddRewardsModalProps | undefined>();
  const [initRewardModalProps, setInitRewardModalProps] = useState<InitRewardsModalProps | undefined>();
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const waitMainnetProfileModal = useRef<VoidFunction| undefined>(undefined);

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

  const openInitRewardModal = useCallback((props: InitRewardsModalProps) => {
    setInitRewardModalProps(props);
    activeModal(ACCOUNT_INIT_POINT_MODAL);
  }, [activeModal]);

  const closeInitRewardModal = useCallback(() => {
    inactiveModal(ACCOUNT_INIT_POINT_MODAL);
    setInitRewardModalProps(undefined);
  }, [inactiveModal]);

  const openAddRewardsModal = useCallback((props: AddRewardsModalProps) => {
    setAddRewardModalProps(props);
    activeModal(ACCOUNT_ADD_POINT_MODAL);
  }, [activeModal]);

  const closeAddRewardsModal = useCallback(() => {
    inactiveModal(ACCOUNT_ADD_POINT_MODAL);
    setAddRewardModalProps(undefined);
  }, [inactiveModal]);

  const onOkRewardModal = useCallback(() => {
    closeAddRewardsModal();
  }, [closeAddRewardsModal]);

  const onCancelRewardModal = useCallback(() => {
    closeAddRewardsModal();
  }, [closeAddRewardsModal]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount()
      .subscribe((data) => {
        setAccount(data);
      });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const isShowMainnetProfile = localStorage.getItem(mainnetProfileLocalKey);

    if (!Telegram?.WebApp?.initData && !isShowMainnetProfile) {
      activeModal(mainnetProfileModalId);
    }
  }, [activeModal]);

  useEffect(() => {
    const handleMaintenance = (info: MaintenanceInfo) => {
      if (info.isMaintenance) {
        navigate('/maintenance');
      }
    };

    const unsub1 = metadataHandler.maintenanceSubject.subscribe(handleMaintenance);

    const handleAccountAction = async (action: string) => {
      if (action === 'banned') {
        navigate('/account-banned');
      } else if (action === 'login-pwa-confirm') {
        navigate('/login-pwa-confirm');
      } else if (action === 'login-failed') {
        navigate('/login-select');
      } else if (action === 'login-success') {
        const isShowMainnetProfile = localStorage.getItem(mainnetProfileLocalKey);

        if (!isShowMainnetProfile) {
          const { promise, resolve } = createPromiseHandler<void>();

          waitMainnetProfileModal.current = resolve;
          await promise;
        }

        const isShowInstruction = localStorage.getItem(instructionLocalKey);

        if (!Telegram?.WebApp?.initData && !isShowInstruction && !isPWABrowser() && isAndroid()) {
          activeModal(instructionPWAModalId);
        }
      }
    };

    const unsub2 = apiSDK.handleAccountAction.subscribe((action: string) => {
      handleAccountAction(action).catch(console.error);
    });

    return () => {
      unsub1.unsubscribe();
      unsub2.unsubscribe();
    };
  }, [activeModal, navigate]);

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

  useEffect(() => {
    const initNps = account?.initNps || [];
    const newInitNps = initNps.filter((np) => np.isNew);
    const isAllNew = newInitNps.length === initNps.length;

    if (newInitNps.length > 0 && !isAddPointShowed) {
      const totalPoint = newInitNps.reduce((acc, item) => acc + item.point, 0);

      if (isAllNew) {
        openInitRewardModal({
          isInit: true,
          rewards: newInitNps.map((item) => ({
            id: item.id,
            name: item.note,
            point: item.point
          })),
          totalPoint: totalPoint,
          onContinue: closeInitRewardModal
        });
      } else {
        openAddRewardsModal({
          onViewDetail: () => {
            openInitRewardModal({
              isInit: false,
              rewards: newInitNps.map((item) => ({
                id: item.id,
                name: item.note,
                point: item.point
              })),
              totalPoint: totalPoint,
              onContinue: closeInitRewardModal
            });
            closeAddRewardsModal();
          },
          onOk: onOkRewardModal,
          onCancel: onCancelRewardModal,
          rewardInfo: {
            iconSrc: DefaultLogosMap.token_icon,
            value: totalPoint,
            symbol: 'SP'
          }
        });
      }

      isAddPointShowed = true;
    }
  }, [account, closeInitRewardModal, onCancelRewardModal, onOkRewardModal, openInitRewardModal, openAddRewardsModal, closeAddRewardsModal]);

  return (
    <>
      {!account && <LoadingScreen />}
      {!!account && <HomeContext.Provider value={{
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
        >
          <Outlet />
        </Layout.Home>
      </HomeContext.Provider>}

      <GlobalSearchTokenModal
        id={GlobalSearchTokenModalId}
        onCancel={onCloseGlobalSearchToken}
        sortedTokenSlugs={tokenGroupStructure.sortedTokenSlugs}
        tokenBalanceMap={accountBalance.tokenBalanceMap}
      />

      <PWAInstruction />
      <MainnetProfileModal handleSuccess={waitMainnetProfileModal?.current} />

      {firstBanner && <CampaignBannerModal banner={firstBanner} />}
      {
        !!addRewardModalProps && (
          <AddRewardsModal
            {...addRewardModalProps}
          />
        )
      }
      {
        !!initRewardModalProps && (
          <InitRewardsModal
            {...initRewardModalProps}
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
