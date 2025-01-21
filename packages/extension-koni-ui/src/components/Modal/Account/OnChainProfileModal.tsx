// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WC_DEFAULT_CHAIN_ID } from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { SWStorage } from '@subwallet/extension-base/storage';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ON_CHAIN_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useNotification, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { wcSignMessageRequest } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

import { stringToHex } from '@polkadot/util';

type Props = ThemeProps & {
  onErrorHandler?: () => void;
  modalId?: string;
  isNeedConnectWallet?: boolean;
  content: React.ReactNode;
}
const apiSDK = BookaSdk.instance;
const cloudStorage = SWStorage.instance;
const cloudStorageKey = 'on-chain-profile-modal';

function Component ({ className, onErrorHandler, content, isNeedConnectWallet, modalId = ON_CHAIN_PROFILE_MODAL }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const notify = useNotification();
  const { wcAccount } = useSelector((state) => state.accountState);
  const { connectWC, requireWC, waitingSigningModal: { close: closeWaiting, open: openWaiting } } = useContext(WalletConnectContext);
  const { inactiveModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);

  const getWcAddress = useCallback(async (): Promise<string | null> => {
    if (wcAccount) {
      return wcAccount.address;
    } else {
      try {
        await requireWC();

        return await connectWC();
      } catch (e) {
        const error = e as Error;

        if (error.message?.toLowerCase().includes('Unsupported chains'.toLowerCase())) {
          // telegramConnector.showPopup({
          //   message: t('Your chosen wallet hasn’t supported Story Odyssey Testnet. Add network to your wallet or change to another wallet'),
          //   buttons: [{ type: 'ok', text: t('Got it') }]
          // }, noop);
        }

        return null;
      }
    }
  }, [connectWC, requireWC, wcAccount]);

  const onCheckingLinkedAccount = useCallback(() => {
    const func = async () => {
      setLoading(true);

      if (!isNeedConnectWallet) {
        await cloudStorage.setItem(cloudStorageKey, 'showed');
      }

      const addressMinted = await apiSDK.getMintedAddress();

      if (addressMinted) {
        await apiSDK.setAccountAddress(addressMinted);
        await apiSDK.getStatsOfAddress();
        inactiveModal(modalId);
        setLoading(false);
      } else {
        inactiveModal(modalId);
        let _wcAddress = wcAccount?.address || null;

        if (!_wcAddress || isNeedConnectWallet) {
          _wcAddress = await getWcAddress();
        }

        if (_wcAddress) {
          const message = `Approve use this address to set linked address: ${_wcAddress}`;

          openWaiting();

          try {
            await wcSignMessageRequest({
              address: _wcAddress,
              chainId: WC_DEFAULT_CHAIN_ID,
              payload: stringToHex(message),
              method: 'personal_sign'
            });

            await apiSDK.setAccountAddress(_wcAddress);
            await apiSDK.getStatsOfAddress();
            closeWaiting();
            setLoading(false);
          } catch (e) {
            closeWaiting();
            inactiveModal(modalId);
            setLoading(false);

            const error = e as Error;

            console.error('Fail to get signature', error);

            if (error.message.toLowerCase().includes('user rejected'.toLowerCase())) {
              notify({
                message: t('You’ve rejected this request'),
                type: 'error',
                duration: null
              });
            }

            if (error.message.toLowerCase().includes('Address already registered'.toLowerCase())) {
              onErrorHandler && onErrorHandler();
            }
          }
        }
      }
    };

    func().catch(console.error);
  }, [closeWaiting, getWcAddress, inactiveModal, isNeedConnectWallet, modalId, notify, onErrorHandler, openWaiting, t, wcAccount?.address]);

  const onCancel = useCallback(() => {
    if (!isNeedConnectWallet) {
      cloudStorage.setItem(cloudStorageKey, 'showed').catch(console.error);
    }

    inactiveModal(modalId);
  }, [inactiveModal, isNeedConnectWallet, modalId]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          disabled={loading}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={onCancel}
          schema={'secondary'}
          shape={'round'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onCheckingLinkedAccount}
          shape={'round'}
        >
          {t('Agree')}
        </Button>
      </>
    );
  }, [loading, onCancel, onCheckingLinkedAccount, t]);

  return (
    <SwModal
      className={CN(className)}
      footer={footerModal}
      id={modalId}
    >
      <div className='body-container'>
        {content}
      </div>
    </SwModal>
  );
}

const RewardDetailModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {

    '.ant-sw-modal-footer': {
      display: 'flex',
      gap: token.sizeXS
    }
  };
});

export default RewardDetailModal;
