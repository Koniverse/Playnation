// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { CampaignBannerModal, Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useAccountBalance, useGetBannerByScreen, useGetChainSlugsByAccountType, useTokenGroup } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

export const GlobalSearchTokenModalId = 'globalSearchToken';
const apiSDK = BookaSdk.instance;
const metadataHandler = MetadataHandler.instance;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const chainsByAccountType = useGetChainSlugsByAccountType();
  const tokenGroupStructure = useTokenGroup(chainsByAccountType);
  const accountBalance = useAccountBalance(tokenGroupStructure.tokenGroupMap);
  const [containerClass, setContainerClass] = useState<string | undefined>();

  const banners = useGetBannerByScreen('home');

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const firstBanner = useMemo((): CampaignBanner | undefined => banners[0], [banners]);

  const [backgroundStyle, setBackgroundStyle] = useState<LayoutBaseProps['backgroundStyle'] | undefined>();
  const navigate = useNavigate();

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
