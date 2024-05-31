// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, LoadingScreen } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { AirdropDetailHeader } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/Header';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import { ShareNetwork } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

type WrapperProps = ThemeProps;
type Props = ThemeProps & {
  currentAirdrop: AirdropCampaign;
};

const apiSDK = BookaSdk.instance;

const Component: React.FC<Props> = ({ className, currentAirdrop }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onBack = useCallback(() => {
    navigate('/home/airdrop');
  }, [navigate]);

  const subHeaderIcons = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={ShareNetwork}
            size='md'
          />
        ),
        onClick: () => {
          //
        }
      }
    ];
  }, []);

  return (
    <Layout.WithSubHeaderOnly
      backgroundStyle={'secondary'}
      className={className}
      onBack={onBack}
      subHeaderIcons={subHeaderIcons}
      title={t('Campaign detail')}
    >
      <AirdropDetailHeader airdropInfo={currentAirdrop} />
    </Layout.WithSubHeaderOnly>
  );
};

const WrapperComponent = (props: WrapperProps): React.ReactElement<Props> => {
  const { id: campaignId } = useParams<{ id: string }>();
  const [airdropList, setAirdropList] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);

  const currentAirdropCampaign = useMemo(() => {
    return airdropList.find((a) => campaignId && a.campaign_id === +campaignId);
  }, [airdropList, campaignId]);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropList(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!currentAirdropCampaign) {
    return <LoadingScreen />;
  }

  return (
    <Component
      {...props}
      currentAirdrop={currentAirdropCampaign}
    />
  );
};

const AirdropDetail = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    '.ant-sw-screen-layout-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    }
  });
});

export default AirdropDetail;
