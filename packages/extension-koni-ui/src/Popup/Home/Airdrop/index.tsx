// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaignRecord } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Image, Typography } from '@subwallet/react-ui';
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
        {airdropCampaign.map((item: AirdropCampaignRecord) => (
          <div
            className={CN('game-item')}
            key={`game-${item.id}`}
          >
            <div className='game-banner'>
              <Image
                shape={'square'}
                src={item.banner}
                width={'100%'}
              />
            </div>
            <div className='game-info'>
              <div className={'game-text-info'}>
                <Typography.Title
                  className={'__title'}
                  level={5}
                >
                  {item.name}
                </Typography.Title>
                <Typography.Text
                  className={'__sub-title'}
                  size={'sm'}
                >
                  <strong>Method:</strong> {item.method}
                </Typography.Text>
                <br />
                <Typography.Text
                  className={'__sub-title'}
                  size={'sm'}
                >
                  <strong>Token:</strong> {item.total_tokens} {item.symbol} - {item.network}
                </Typography.Text>
              </div>
              <div className={'play-area'}>
                <Typography.Text
                  className={'game-energy'}
                  size={'sm'}
                >
                  <strong>Start:</strong> {formatDate(item.start)} - <strong>End:</strong> {formatDate(item.end)}
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

const Airdrop = styled(AirdropComponent)<ThemeProps>(({ theme: { token } }: ThemeProps) => ({
  padding: token.padding,

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
    }
  },

  '.game-info': {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: token.padding
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
  }
}));

export default Airdrop;
