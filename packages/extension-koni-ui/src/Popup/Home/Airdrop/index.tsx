// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaignRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import {  Image, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const formatDate = (date: string | number | Date) => {
  return new Date(date).toISOString().split('T')[0];
};

const AirdropComponent: React.FC<Props> = ({ className }) => {
  useSetCurrentPage('/home/airdrop');
  const [airdropCampaign, setAirdropCampaign] = useState<AirdropCampaignRecord[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropCampaign(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderContent = () => {
    if (!airdropCampaign.length) {
      return null;
    }

    return (
      <div>
        {airdropCampaign.map((game) => (<div
          className={CN('game-item')}
          key={`game-${game.id}`}
        >
          <div className='game-banner'>
            <Image
              shape={'square'}
              src={game.banner}
              width={'100%'}
            />
          </div>
          <div className='game-info'>
            <Image
              className={'game-icon'}
              src={game.icon}
              width={40}
            />
            <div className={'game-text-info'}>
              <Typography.Title
                className={'__title'}
                level={5}
              >
                {game.name}
              </Typography.Title>
              <Typography.Text
                className={'__sub-title'}
                size={'sm'}
              >{formatDate(game.start)} -  {formatDate(game.end)}</Typography.Text>
            </div>
            <div className={'play-area'}>

              <Typography.Text
                className={'game-energy'}
                size={'sm'}
              >
                {game.total_tokens} {game.symbol}
              </Typography.Text>
            </div>
          </div>
        </div>))}
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

    '.game-play': {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      zIndex: 9999,

      '.game-iframe': {
        opacity: 0,
        transition: 'opacity 0.6s ease-in-out',
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 0
      }
    },

    '.game-info': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: token.padding
    },

    '.__coming-soon-title': {
      display: 'none'
    },

    '.game-text-info': {
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

    '.game-energy': {
      display: 'block',
      color: 'rgba(0, 0, 0, 0.65)',
      borderRadius: token.borderRadius
    },

    '.game-item': {
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
        '.game-banner': {
          overflow: 'hidden',
          img: {
            filter: 'blur(8px)'
          }
        },

        '.game-text-info': {
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
