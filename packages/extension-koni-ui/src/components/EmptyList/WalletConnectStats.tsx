// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { WalletConnect } from '@subwallet/extension-koni-ui/components';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ButtonProps, Icon } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EmptyList from './EmptyList';

interface Props {
  modalId?: string;
  className?: string;
}
const telegramConnector = TelegramConnector.instance;

const WalletConnectStats: React.FC<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { connectWC, disconnectWC } = useContext(WalletConnectContext);
  const { className } = props;
  const [connectLoading, setConnectLoading] = useState(false);
  const notify = useNotification();
  const { wcAccount } = useSelector((state) => state.accountState);

  const onConnectWallet = useCallback(() => {
    setConnectLoading(true);

    connectWC()
      .then((address: string) => {
        console.debug('connectWC result', address);
      })
      .catch((e: Error) => {
        if (e.message?.toLowerCase().includes('Unsupported chains'.toLowerCase())) {
          telegramConnector.showPopup({
            message: t('Your chosen wallet hasn’t supported Story Odyssey Testnet. Add network to your wallet or change to another wallet'),
            buttons: [{
              type: 'ok',
              text: t('Got it')
            }]
          }, noop);

          return;
        }

        notify({
          type: 'error',
          message: e.message
        });
      })
      .finally(() => {
        setConnectLoading(false);
      });
  }, [connectWC, notify, t]);

  const onDisconnectWallet = useCallback((wcAccount: AccountJson) => {
    return () => {
      setConnectLoading(true);
      disconnectWC(wcAccount)()
        .finally(() => {
          setConnectLoading(false);
        });
    };
  }, [disconnectWC]);

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
      onClick: wcAccount ? onDisconnectWallet(wcAccount) : onConnectWallet,
      loading: connectLoading
    };
  }, [connectLoading, onConnectWallet, onDisconnectWallet, t, wcAccount]);

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
