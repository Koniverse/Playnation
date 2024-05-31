// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCardItem } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const AirdropComponent: React.FC<Props> = ({ className }) => {
  useSetCurrentPage('/home/airdrop');
  const navigate = useNavigate();

  const { setContainerClass } = useContext(HomeContext);
  const [airdropCampaign, setAirdropCampaign] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);

  const orderAirdropCampaign = useMemo(() => {
    return [...airdropCampaign].sort((a, b) => {
      if (a.start === null && b.start === null) {
        return 0;
      }

      if (a.start === null) {
        return 1;
      }

      if (b.start === null) {
        return -1;
      }

      const aTime = new Date(a.start).getTime();
      const bTime = new Date(b.start).getTime();

      return aTime - bTime;
    });
  }, [airdropCampaign]);

  const onExplore = useCallback((campaignId: number) => {
    return () => {
      navigate(`/airdrop/detail/${campaignId}`);
    };
  }, [navigate]);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropCampaign(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setContainerClass('airdrop-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      {orderAirdropCampaign.map((campaign: AirdropCampaign) => (
        <AirdropCardItem
          className={'airdrop-item'}
          item={campaign}
          key={campaign.campaign_id}
          onExplore={onExplore(campaign.id)}
        />
      ))}
    </div>
  );
};

const Airdrop = styled(AirdropComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'auto',
    paddingLeft: token.sizeXS,
    paddingRight: token.sizeXS,
    paddingBottom: 34,

    '.airdrop-item': {
      marginBottom: token.marginSM
    }
  };
});

export default Airdrop;
