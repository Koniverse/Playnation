// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { SWStorage } from '@subwallet/extension-base/storage';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AddRewardsModal, AddRewardsModalProps, CampaignBannerModal, InitRewardsModal, InitRewardsModalProps, Layout, LoadingScreen, NewAiChatModal } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ACCOUNT_ADD_POINT_MODAL, ACCOUNT_INIT_POINT_MODAL, homeScreensLayoutBackgroundImages, NEW_CHAT_AI_MODAL, ON_CHAIN_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useAccountBalance, useGetBannerByScreen, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { useGetChainSlugsByAccountType } from '@subwallet/extension-koni-ui/hooks/screen/home/useGetChainSlugsByAccountType';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
const apiSDK = BookaSdk.instance;
const metadataHandler = MetadataHandler.instance;
let isAddPointShowed = false; // Use let instead of ref to avoid reload all components
const cloudStorage = SWStorage.instance;
const onNewChatAiCloudKey = 'new-chat-ai-modal';
const onNewChatAiModal = NEW_CHAT_AI_MODAL;
const onChainProfileAlterModal = ON_CHAIN_PROFILE_MODAL;
const onChainProfileCloudKey = 'on-chain-profile-modal';

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);
  const [containerClass, setContainerClass] = useState<string | undefined>();
  const [addRewardModalProps, setAddRewardModalProps] = useState<AddRewardsModalProps | undefined>();
  const [initRewardModalProps, setInitRewardModalProps] = useState<InitRewardsModalProps | undefined>();
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const { disconnectWithoutConfirmModal } = useContext(WalletConnectContext);
  // const [mintingLog, setMintingLog] = useState<NftMintingLog | undefined>();
  // const [mintFailedLogIds, setMintFailedLogIds] = useLocalStorage<number[]>(CONFIRM_SHOW_MINTING_FAILED_MODAL, []);

  const isGlobalModalActive = useMemo(() => checkActive(GlobalSearchTokenModalId), [checkActive]);

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

  // const handleMintingFailedModal = useCallback(() => {
  //   const handleConfirmOrCancel = () => {
  //     setMintFailedLogIds((prevIds) => {
  //       if (mintingLog?.id && !prevIds.includes(mintingLog.id)) {
  //         return [...prevIds, mintingLog.id];
  //       }
  //
  //       return prevIds;
  //     });
  //     alertModal.close();
  //   };
  //
  //   alertModal.open({
  //     className: 'general-confirmation-modal modal-revert-header',
  //     title: t('Badge minting failed'),
  //     iconProps: {
  //       phosphorIcon: Gift,
  //       weight: 'fill'
  //     },
  //     contentTitle: t('Mint your badge again'),
  //     content: (
  //       t('Due to technical issues, your badge wasn’t minted in Phase 1. Click the Mint tab to mint your badge again on December 6')
  //     ),
  //     okButton: {
  //       icon: CheckCircle,
  //       iconWeight: 'fill',
  //       text: t('I understand'),
  //       onClick: handleConfirmOrCancel
  //     },
  //     onCancel: handleConfirmOrCancel
  //   });
  // }, [alertModal, mintingLog, setMintFailedLogIds, t]);

  const onShowNewChatAiModal = useCallback(async () => {
    try {
      const status = await cloudStorage.getItem(onNewChatAiCloudKey);

      if (!status) {
        const isPassed = await apiSDK.checkAccountAvailableBetaVersion();

        if (isPassed) {
          activeModal(onNewChatAiModal);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeModal]);

  const onShowOnChainProfileModal = useCallback(async () => {
    try {
      const status = await cloudStorage.getItem(onChainProfileCloudKey);

      if (!status) {
        if (wcAccount?.address) {
          await disconnectWithoutConfirmModal(wcAccount);
        }

        activeModal(onChainProfileAlterModal);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeModal, disconnectWithoutConfirmModal, wcAccount]);

  // useEffect(() => {
  //   const fetchMintingLog = async () => {
  //     setPendingFetching(true);
  //
  //     try {
  //       const mintingLog = await apiSDK.getNftMintingLog();
  //
  //       setMintingLog(mintingLog);
  //     } catch (error) {
  //       console.error('Error fetching minting log:', error);
  //     }
  //   };
  //
  //   fetchMintingLog().catch(console.error).finally(() => {
  //     setPendingFetching(false);
  //   });
  // }, []);

  // useEffect(() => {
  //   if (mintingLog?.notify && !mintFailedLogIds.includes(mintingLog.id)) {
  //     handleMintingFailedModal();
  //   }
  // }, [handleMintingFailedModal, mintFailedLogIds, mintingLog?.id, mintingLog?.notify, navigate]);

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

    const handleAccountAction = (action: string) => {
      if (action === 'banned') {
        navigate('/account-banned');
      } else if (action === 'login-pwa-confirm') {
        navigate('/login-pwa-confirm');
      } else if (action === 'login-failed') {
        navigate('/login-select');
      }
    };

    const unsub2 = apiSDK.handleAccountAction.subscribe(handleAccountAction);

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

  useEffect(() => {
    onShowNewChatAiModal().then(async () => {
      await onShowOnChainProfileModal();
    }).catch(console.error);
  }, [isGlobalModalActive, onShowNewChatAiModal, onShowOnChainProfileModal]);

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

      <NewAiChatModal />

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
