// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { ALERT_CONNECT_WALLET_MODAL, CONNECT_WALLET_SUCCESS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { wcCancelSessionPromise, wcGetSessionPromise, wcSessionCreate } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps

const modalId = ALERT_CONNECT_WALLET_MODAL;

function Component ({ className }: Props): React.ReactElement<Props> {
  const notify = useNotification();
  const { t } = useTranslation();
  const { closeWCConnectModal, openWCConnectModal, subscribeWCConnectModal } = useContext(WalletModalContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const { activeModal } = useContext(ModalContext);

  const { inactiveModal } = useContext(ModalContext);

  const onClose = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onConnectWallet = useCallback(() => {
    setIsLoading(true);

    wcSessionCreate()
      .then(({ id, uri }) => {
        // Open wallet connect modal
        inactiveModal(modalId);
        openWCConnectModal(uri, id)
          .catch(console.error);

        const unsubscribe = subscribeWCConnectModal((newState) => {
          if (!newState.open) {
            unsubscribe();
            wcCancelSessionPromise(id).catch(console.error);
            setIsLoading(false);
          }
        });

        // Subscribe session result
        wcGetSessionPromise(id)
          .then((data) => {
            unsubscribe();

            if (data.approveAddress) {
              // Connected with wallet
              console.log('Connected with wallet', data.approveAddress);
              closeWCConnectModal();
              activeModal(CONNECT_WALLET_SUCCESS_MODAL);
            } else {
              // Wallet connect failed
              console.error('Wallet connect failed', data.errorMessage);
              closeWCConnectModal();
              notify({
                type: 'error',
                message: data.errorMessage
              });
            }
          })
          .catch((e: Error) => {
            // Wallet connect failed
            unsubscribe();
            console.error('Wallet connect failed', e.message);
            notify({
              type: 'error',
              message: t('Failed to connect with wallet')
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      })
      .catch((e) => {
        console.error(e);
        notify({
          message: t('Failed to create wallet connect session')
        });

        setIsLoading(false);
      });
  }, [openWCConnectModal, subscribeWCConnectModal, closeWCConnectModal, inactiveModal, activeModal, notify, t]);

  const modalFooter = (() => {
    return (
      <div className={'__wc-modal-footer'}>
        <Button
          block={true}
          disabled={isLoading}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'small'}
              weight={'fill'}
            />
          }
          onClick={onClose}
          size={'sm'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block={true}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'small'}
              weight={'fill'}
            />
          }
          loading={isLoading}
          onClick={onConnectWallet}
          size={'sm'}
        >
          {t('Connect')}
        </Button>
      </div>
    );
  })();

  // TODO: Update UI

  return (
    <SwModal
      className={CN(className, '-light-theme')}
      footer={modalFooter}
      id={modalId}
      onCancel={onClose}
      title={t('Connect your wallet')}
    >
      <div className='__content-area'>
        <img
          alt='Gift Box'
          className={'__zoomable-image'}
          src={DefaultLogosMap.walletconnect}
        />
        <div className={'__wc-modal-title'}>
          {t('Wallet connection required')}
        </div>
        <div className={'__wc-sub-title'}>
          {t('You need to connect your wallet to continue')}
        </div>
      </div>
    </SwModal>
  );
}

export const AlertConnectWCModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 0
    },

    '.ant-sw-modal-footer': {
      borderTop: 0,
      display: 'flex'
    },

    '.__content-area': {
      background: extendToken.colorBgGradient,
      borderRadius: 24,
      display: 'flex',
      gap: token.size,
      textAlign: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px'
    },

    '.__wc-modal-title': {
      fontSize: token.fontSizeLG,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark1
    },

    '.__wc-modal-footer': {
      display: 'flex',
      gap: token.size,
      justifyContent: 'center'
    }

  });
});
