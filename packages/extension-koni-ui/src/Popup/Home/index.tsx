// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { AddRewardsModal, AddRewardsModalProps, CampaignBannerModal, InitRewardsModal, InitRewardsModalProps, Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ACCOUNT_ADD_POINT_MODAL, ACCOUNT_INIT_POINT_MODAL, homeScreensLayoutBackgroundImages } from '@subwallet/extension-koni-ui/constants';
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
  const [addRewardModalProps, setAddRewardModalProps] = useState<AddRewardsModalProps | undefined>();
  const [initRewardModalProps, setInitRewardModalProps] = useState<InitRewardsModalProps | undefined>();
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);

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

  const openYourRewardsModal = useCallback((props: AddRewardsModalProps) => {
    setAddRewardModalProps(props);
    activeModal(ACCOUNT_ADD_POINT_MODAL);
  }, [activeModal]);

  const closeYourRewardsModal = useCallback(() => {
    inactiveModal(ACCOUNT_ADD_POINT_MODAL);
    setAddRewardModalProps(undefined);
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
    const accountSub = apiSDK.subscribeAccount()
      .subscribe((data) => {
        setAccount(data);
      });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

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

  useEffect(() => {
    const initNps = account?.initNps || [];

    initNps.forEach((np) => {
      np.isNew = true;
    });

    const newInitNps = initNps.filter((np) => np.isNew);

    if (newInitNps.length > 0) {
      openInitRewardModal({
        isInit: true,
        rewards: [
          { id: 1, name: 'Join Story Telegram group' },
          { id: 2, name: 'Join Mycellium Telegram group' },
          { id: 3, name: 'Message count bonus' },
          { id: 4, name: 'OG status bonus' }
        ],
        totalPoint: 200,
        onContinue: closeInitRewardModal
      });
      // if (newInitNps.length === initNps.length) {
      //   openInitRewardModal({
      //     rewards: [
      //       { id: 1, name: 'Join Story Telegram group' },
      //       { id: 2, name: 'Join Mycellium Telegram group' },
      //       { id: 3, name: 'Message count bonus' },
      //       { id: 4, name: 'OG status bonus' }
      //     ],
      //     totalPoint: 200
      //   });
      // } else {
      //   openYourRewardsModal({
      //     onViewDetail: onViewDetailRewardModal,
      //     onOk: onOkRewardModal,
      //     onCancel: onCancelRewardModal,
      //     rewardInfo: {
      //       iconSrc: '/images/games/token-icon.png',
      //       value: 200,
      //       symbol: 'SP'
      //     }
      //   });
      // }
    }
  }, [account, closeInitRewardModal, onCancelRewardModal, onOkRewardModal, onViewDetailRewardModal, openInitRewardModal, openYourRewardsModal]);

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
