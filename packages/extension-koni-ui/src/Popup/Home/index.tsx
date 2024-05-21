// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { CampaignBannerModal, Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { GlobalSearchTokenModal } from '@subwallet/extension-koni-ui/components/Modal/GlobalSearchTokenModal';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetBannerByScreen, useGetChainSlugsByAccountType, useGetMantaPayConfig, useHandleMantaPaySync, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const [containerClass, setContainerClass] = useState<string | undefined>();

  const mantaPayConfig = useGetMantaPayConfig(currentAccount?.address);
  const isZkModeSyncing = useSelector((state: RootState) => state.mantaPay.isSyncing);
  const handleMantaPaySync = useHandleMantaPaySync();

  const banners = useGetBannerByScreen('home');

  const firstBanner = useMemo((): CampaignBanner | undefined => banners[0], [banners]);

  const [backgroundStyle, setBackgroundStyle] = useState<LayoutBaseProps['backgroundStyle'] | undefined>();

  const onOpenGlobalSearchToken = useCallback(() => {
    activeModal(GlobalSearchTokenModalId);
  }, [activeModal]);

  const onCloseGlobalSearchToken = useCallback(() => {
    inactiveModal(GlobalSearchTokenModalId);
  }, [inactiveModal]);

  useEffect(() => {
    if (mantaPayConfig && mantaPayConfig.enabled && !mantaPayConfig.isInitialSync && !isZkModeSyncing) {
      handleMantaPaySync(mantaPayConfig.address);
    }
  }, [handleMantaPaySync, isZkModeSyncing, mantaPayConfig]);

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

  return (
    <>
      <HomeContext.Provider value={{
        tokenGroupStructure,
        accountBalance,
        setContainerClass
      }}
      >
        <div className={CN('home', 'home-container', className, containerClass)}>
          <Layout.Home
            backgroundStyle={backgroundStyle}
            onClickSearchIcon={onOpenGlobalSearchToken}
            onTabSelected={onTabSelected}
            showGiftIcon
          >
            <Outlet />
          </Layout.Home>
        </div>
      </HomeContext.Provider>

      <GlobalSearchTokenModal
        id={GlobalSearchTokenModalId}
        onCancel={onCloseGlobalSearchToken}
        sortedTokenSlugs={tokenGroupStructure.sortedTokenSlugs}
        tokenBalanceMap={accountBalance.tokenBalanceMap}
      />
      {firstBanner && <CampaignBannerModal banner={firstBanner} />}
    </>
  );
}

const Home = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    height: '100%',

    '&.leaderboard-screen-wrapper': {
      '.ant-sw-screen-layout-body': {
        paddingBottom: 0,

        '> div': {
          height: '100%'
        }
      }
    },

    '&.invitation-screen-wrapper': {
      '.ant-sw-screen-layout-body': {
        paddingBottom: 56,

        '> div': {
          height: '100%'
        }
      }
    }
  });
});

export default Home;
