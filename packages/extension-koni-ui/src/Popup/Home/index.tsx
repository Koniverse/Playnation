// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { CampaignBannerModal, Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { AlertModal, MythicalAlertRewardModal } from '@subwallet/extension-koni-ui/components/Modal';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Reward, RewardStatus } from '@subwallet/extension-koni-ui/connector/booka/types';
import { MYTHICAL_ALERT_LINKING_TO_REWARDS_MODAL, MYTHICAL_ALERT_REWARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetBannerByScreen, useGetChainSlugsByAccountType, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
const apiSDK = BookaSdk.instance;
const metadataHandler = MetadataHandler.instance;
const alertLinkingToRewardModal = MYTHICAL_ALERT_LINKING_TO_REWARDS_MODAL;
const alertRewardModal = MYTHICAL_ALERT_REWARD_MODAL;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const { t } = useTranslation();
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const [containerClass, setContainerClass] = useState<string | undefined>();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const banners = useGetBannerByScreen('home');

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const firstBanner = useMemo((): CampaignBanner | undefined => banners[0], [banners]);
  const { checkAlreadyLinked, isLinkedMyth, onLogin } = useContext(AuthenticationMythContext);
  const [backgroundStyle, setBackgroundStyle] = useState<LayoutBaseProps['backgroundStyle'] | undefined>();
  const [rewardsEligible, setRewardsEligible] = useState<Reward[]>([]);
  const [hasSuccessReward, setHasSuccessReward] = useState<boolean>(false);
  const [hasFullPendingReward, setHasFullPendingReward] = useState<boolean>(false);
  const navigate = useNavigate();

  const alertLinkingToRewardModalProps = useMemo(() => {
    const totalTokenOfPendingReward = rewardsEligible.reduce((acc, reward) => {
      if (reward.status !== RewardStatus.SUCCESS) {
        acc += reward.token;
      }

      return acc;
    }, 0);

    return {
      title: t(`you’re eligible for ${totalTokenOfPendingReward} myth`),
      content: t(`Link your Mythical account now to receive ${totalTokenOfPendingReward} MYTH. Make sure to connect to NFL Rivals app first and create a wallet address to receive rewards`),
      okButton: {
        text: 'Link account',
        onClick: () => {
          apiSDK.updateRewardHistory(true).catch(console.error);
          inactiveModal(alertLinkingToRewardModal);

          if (isLinkedMyth) {
            navigate('/home/my-profile');
          } else {
            onLogin();
          }
        }
      },
      cancelButton: {
        text: 'Cancel',
        onClick: noop
      },
      onCancel: () => {
        inactiveModal(alertLinkingToRewardModal);
        apiSDK.updateRewardHistory(true).catch(console.error);
      }
    };
  }, [inactiveModal, isLinkedMyth, navigate, onLogin, rewardsEligible, t]);

  const handleAlertReward = useCallback(async (rewardList: Reward[]) => {
    if (rewardList.length > 0) {
      const isHasRewardIsDistributed = rewardList.find((reward) => reward.status === RewardStatus.SUCCESS);

      if (isHasRewardIsDistributed) {
        setHasSuccessReward(true);
        activeModal(alertRewardModal);

        return;
      }

      const isAlreadyLinked = await checkAlreadyLinked();

      if (isAlreadyLinked) {
        return;
      }

      setHasFullPendingReward(true);
      activeModal(alertLinkingToRewardModal);
    }
  }, [activeModal, checkAlreadyLinked]);

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

  useEffect(() => {
    apiSDK.getRewardListIsNotChecked().then((res) => {
      setRewardsEligible(res);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    handleAlertReward(rewardsEligible).catch(console.error);
  }, [handleAlertReward, rewardsEligible]);

  return (
    <>
      <HomeContext.Provider value={{
        tokenGroupStructure,
        accountBalance,
        setContainerClass,
        setBackgroundStyle
      }}
      >
        <Layout.Home
          backgroundStyle={backgroundStyle}
          className={CN('home', 'home-container', className, containerClass)}
        >
          <Outlet />
        </Layout.Home>
      </HomeContext.Provider>
      {firstBanner && <CampaignBannerModal banner={firstBanner} />}
      {hasSuccessReward && <MythicalAlertRewardModal rewardsEligible={rewardsEligible} />}
      {hasFullPendingReward && <AlertModal
        modalId={alertLinkingToRewardModal}
        {...alertLinkingToRewardModalProps}
      />}
    </>
  );
}

const Home = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    height: '100%',

    '&.events-screen-wrapper.-show-game': {
      '.ant-sw-screen-layout-body-inner': {
        position: 'static'
      },

      '.ant-sw-screen-layout-footer': {
        opacity: 0,
        pointerEvents: 'none'
      }
    }
  });
});

export default Home;
