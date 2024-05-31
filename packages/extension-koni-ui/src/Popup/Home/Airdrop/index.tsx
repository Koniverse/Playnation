// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCardItem } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const AirdropComponent: React.FC<Props> = ({ className }) => {
  useSetCurrentPage('/home/airdrop');
  const navigate = useNavigate();

  const [airdropCampaign, setAirdropCampaign] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropCampaign(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onExplore = useCallback((campaignId: number) => {
    return () => {
      navigate(`/airdrop/detail/${campaignId}`);
    };
  }, [navigate]);

  return (
    <div className={className}>
      {airdropCampaign.map((campaign: AirdropCampaign) => (
        <AirdropCardItem
          item={campaign}
          key={campaign.id}
          onExplore={onExplore(campaign.id)}
        />
      ))}
    </div>
  );
};

const Airdrop = styled(AirdropComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

    '.account-info': {
      marginBottom: token.margin
    },

    '.campaign-play': {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      zIndex: 9999,

      '.campaign-iframe': {
        opacity: 0,
        transition: 'opacity 0.6s ease-in-out',
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 0
      }
    },

    '.campaign-info': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: token.padding
    },

    '.__coming-soon-title': {
      display: 'none'
    },

    '.campaign-text-info': {
      flex: 1,
      marginLeft: token.marginXS,

      '.__title': {
        marginBottom: 0
      },

      '.__sub-title': {
        color: 'rgba(0, 0, 0, 0.65)'
      }
    },

    '.play-area': {
      textAlign: 'right'
    },

    '.campaign-energy': {
      display: 'block',
      color: 'rgba(0, 0, 0, 0.65)',
      borderRadius: token.borderRadius
    },

    '.campaign-item': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: token['gray-1'],
      borderRadius: token.borderRadius,
      border: 0,
      marginBottom: '10px',
      overflow: 'hidden',

      '& img': {
        width: '100%',
        height: 'auto'
      },

      '&.coming-soon': {
        '.campaign-banner': {
          overflow: 'hidden',
          img: {
            filter: 'blur(8px)'
          }
        },

        '.campaign-text-info': {
          '.__title, .__sub-title': {
            display: 'none'
          },

          '.__coming-soon-title': {
            display: 'block',
            marginTop: 0,
            marginBottom: 0
          }
        },

        '.play-area': {
          display: 'none'
        }
      }
    }
  };
});

export default Airdrop;
