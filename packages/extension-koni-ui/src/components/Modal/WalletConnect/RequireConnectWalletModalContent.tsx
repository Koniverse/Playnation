// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletConnect } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps

function Component (props: Props): React.ReactElement<Props> {
  const { className = '' } = props;

  const { t } = useTranslation();

  return (
    <div className={CN(className)}>
      <div className='page-icon-overide'>
        <PageIcon
          color='#000'
          iconProps={{
            customIcon: (
              <WalletConnect
                height='1em'
                width='1em'
              />
            ),
            type: 'customIcon'
          }}
        />
      </div>
      <div className='require-text'>
        {t('Wallet connection required')}
      </div>
      <div className='require-sub-text'>
        {t('You need to connect your wallet to continue ')}
      </div>
    </div>
  );
}

export const RequireConnectWalletModalContent = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)',
    borderRadius: 24,
    display: 'flex',
    gap: token.size,
    textAlign: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 20px',

    '.require-text': {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark1
    },

    '.require-sub-text': {
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark1
    }
  });
});
