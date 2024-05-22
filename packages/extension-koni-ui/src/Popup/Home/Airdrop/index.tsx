// SPDX-License-Identifier: Apache-2.0

import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Typography } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/airdrop');
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div className='invite-data'>
        <div className='invite-friends text-center'>
          <Typography.Title level={2} className='title'>
            {t('Airdrop Coming Soon')}
          </Typography.Title>
          <div className='description'>
            <Typography.Text className='paragraph'>
              {t('We are excited to announce our upcoming airdrop event!')}
            </Typography.Text>
            <Typography.Text className='paragraph'>
              {t('This is a special opportunity for our community to earn rewards and participate in the growth of our platform.')}
            </Typography.Text>
            <Typography.Text className='paragraph'>
              {t('Stay tuned for more details on how to participate, the eligibility criteria, and the rewards you can earn. Make sure to follow us on social media and keep an eye on your email for the latest updates.')}
            </Typography.Text>
            <Typography.Text className='paragraph'>
              {t('Thank you for being a valued member of our community. We look forward to your participation in this exciting event!')}
            </Typography.Text>
          </div>
        </div>
      </div>
    </div>
  );
};

const Airdrop = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => ({
  height: '100%',
  padding: token.paddingLG,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: token.colorBgContainer,
  '.invite-data': {
    flex: 1,
    overflow: 'auto',
    width: '100%',
    maxWidth: '800px',
    padding: token.paddingLG,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow
  },
  '.invite-friends': {
    textAlign: 'center',
    padding: token.padding,
  },
  '.title': {
    marginBottom: token.marginLG,
    color: token.colorPrimary,
  },
  '.description': {
    marginTop: token.marginMD,
    color: token.colorTextSecondary,
    lineHeight: '1.8',
    textAlign: 'left',
    '> *:not(:last-child)': {
      marginBottom: token.marginSM,
    },
  },
  '.paragraph': {
    marginBottom: token.marginMD,
    fontSize: token.fontSizeLG,
  }
}));

export default Airdrop;
