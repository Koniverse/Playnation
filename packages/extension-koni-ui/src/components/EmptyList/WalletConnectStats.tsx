// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletConnect } from '@subwallet/extension-koni-ui/components';
import { ButtonProps, Icon } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyList from './EmptyList';

interface Props {
  modalId?: string;
  className?: string;
}

const WalletConnectStats: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { className } = props;

  const handleWalletConnect = useCallback(() => {
  }, []);

  const buttonProps = useMemo((): ButtonProps => {
    return {
      icon: (
        <Icon
          phosphorIcon={CheckCircle}
          weight='fill'
        />
      ),
      children: t('Connect now'),
      shape: 'circle',
      size: 'sm',
      onClick: handleWalletConnect
    };
  }, [handleWalletConnect, t]);

  return (
    <EmptyList
      buttonProps={buttonProps}
      className={className}
      customIcon={<WalletConnect
        height='60'
        width='60'
      />}
      emptyTitle={t('Connect wallet to view on-chain stats')}
    />
  );
};

export default WalletConnectStats;
