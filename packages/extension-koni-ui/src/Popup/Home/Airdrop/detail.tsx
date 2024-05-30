// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

type WrapperProps = ThemeProps;
type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component: React.FC<Props> = () => {
  const { id: campaign_id } = useParams<{ id: string }>();
  const [eligibility, setEligibility] = useState<{ eligibility: boolean; raffleTotal: number } | null>(null);

  useEffect(() => {
    if (campaign_id) {
      checkEligibilityFn(parseInt(campaign_id, 10));
    }
  }, [campaign_id]);

  const checkEligibilityFn = async (campaign_id: number) => {
    try {
      await apiSDK.checkEligibilityList(campaign_id);
      const response = apiSDK.checkEligibility.getValue();

      setEligibility(response);
    } catch (error) {
      console.error('Error checking eligibility', error);
    }
  };

  return (
    <div>
      <h1>Hello {campaign_id}</h1>
      {eligibility
        ? (
          <div>
            <p>Eligibility: {eligibility.eligibility ? 'Eligible' : 'Not Eligible'}</p>
            <p>Raffle Total: {eligibility.raffleTotal}</p>
          </div>
        )
        : (
          <h1>No snapshot data yet</h1>
        )}

    </div>
  );
};

const WrapperComponent = (props: WrapperProps): React.ReactElement<Props> => {
  const dataContext = useContext(DataContext);

  return (
    <Component {...props} />
  );
};

const AirdropDetail = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({});
});

export default AirdropDetail;
