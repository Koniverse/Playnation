import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const AirdropDetail: React.FC<Props> = () => {
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
      {eligibility ? (
        <div>
          <p>Eligibility: {eligibility.eligibility ? 'Eligible' : 'Not Eligible'}</p>
          <p>Raffle Total: {eligibility.raffleTotal}</p>
        </div>
      ):(
        <h1>No snapshot data yet</h1>
      )}

    </div>
  );
};

export default AirdropDetail;
