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
    const futureList: AirdropCampaign[] = [];
    const nowList: AirdropCampaign[] = [];
    const pastList: AirdropCampaign[] = [];

    airdropCampaign.forEach((campaign) => {
      const now = Date.now();
      const start = new Date(campaign.start).getTime();
      const end = new Date(campaign.end).getTime();

      if (now < start) {
        futureList.push(campaign);
      } else if (now > end) {
        pastList.push(campaign);
      } else {
        nowList.push(campaign);
      }
    });

    function sortByStart (a: AirdropCampaign, b: AirdropCampaign) {
      if (!a.start || !b.start) {
        return 0;
      }

      return new Date(a.start).getTime() - new Date(b.start).getTime();
    }

    function sortByStartDesc (a: AirdropCampaign, b: AirdropCampaign) {
      if (!a.start || !b.start) {
        return 0;
      }

      return new Date(b.start).getTime() - new Date(a.start).getTime();
    }

    return [...nowList.sort(sortByStartDesc), ...futureList.sort(sortByStart), ...pastList];
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
          key={campaign.airdrop_campaign_id}
          onExplore={onExplore(campaign.airdrop_campaign_id)}
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
