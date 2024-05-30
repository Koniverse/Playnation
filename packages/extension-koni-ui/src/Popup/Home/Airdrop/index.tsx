// [object Object]
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Image, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const formatDate = (date: string | number | Date) => {
  return new Date(date).toISOString().split('T')[0];
};

const AirdropComponent: React.FC<Props> = ({ className }) => {
  useSetCurrentPage('/home/airdrop');
  const navigate = useNavigate();

  const [airdropCampaign, setAirdropCampaign] = useState<AirdropCampaign[]>([]);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropCampaign(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const detailCampaign = useCallback((campaignId: number) => {
    navigate(`detail/${campaignId}`);
  }, [navigate]);

  const renderContent = () => {
    if (!airdropCampaign.length) {
      return null;
    }

    return (
      <div>
        {airdropCampaign.map((campaign: AirdropCampaign) => (
          <div
            className={CN('campaign-item')}
            key={`campaign-${campaign.id}`}
          >
            <div className='campaign-banner'>
              <Image
                shape={'square'}
                src={campaign.banner}
                width={'100%'}
              />
            </div>
            <div className='campaign-info'>
              <Image
                className={'campaign-icon'}
                src={campaign.icon}
                width={40}
              />
              <div className={'campaign-text-info'}>
                <Typography.Title
                  className={'__title'}
                  level={5}
                >
                  {campaign.name}
                </Typography.Title>
                <Typography.Text
                  className={'__sub-title'}
                  size={'sm'}
                >
                  {formatDate(campaign.start)} - {formatDate(campaign.end)}
                </Typography.Text>

                {campaign.eligibilityList.map((item, index) => (
                  <Typography.Text
                    className={'__sub-title'}
                    key={index}
                    size={'sm'}
                  >
                    {item.name}
                  </Typography.Text>
                ))}

                <Button
                  className={'play-button'}
                  onClick={() => detailCampaign(campaign.campaign_id!)}
                  size={'xs'}
                >
                  Explore
                </Button>
              </div>
              <div className={'play-area'}>
                <Typography.Text
                  className={'campaign-energy'}
                  size={'sm'}
                >
                  {campaign.total_tokens} {campaign.symbol}
                </Typography.Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className='invite-data'>{renderContent()}</div>
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
