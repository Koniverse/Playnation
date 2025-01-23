// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WC_DEFAULT_CHAIN_ID } from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { ADDRESS_EXISTED_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useNotification, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { wcSignMessageRequest } from '@subwallet/extension-koni-ui/messaging';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, SmileySad, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { stringToHex } from '@polkadot/util';

type Props = ThemeProps & {
  onSubmitAddressLinking: (address?: string) => void;
}

const modalId = ADDRESS_EXISTED_MODAL;

function Component ({ className, onSubmitAddressLinking }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const notify = useNotification();
  const { wcAccount } = useSelector((state) => state.accountState);
  const { connectWC, disconnectWithoutConfirmModal, requireWC, waitingSigningModal: { close: closeWaiting, open: openWaiting } } = useContext(WalletConnectContext);
  const { inactiveModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const { token } = useTheme() as Theme;

  const getWcAddress = useCallback(async (): Promise<string | null> => {
    try {
      if (wcAccount?.address) {
        await disconnectWithoutConfirmModal(wcAccount);
      }

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
  }, [connectWC, disconnectWithoutConfirmModal, requireWC, wcAccount]);

  const onCheckingLinkedAccount = useCallback(() => {
    const func = async () => {
      setLoading(true);

      inactiveModal(modalId);
      const _wcAddress = await getWcAddress();

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

          onSubmitAddressLinking(_wcAddress);
          closeWaiting();
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
        }
      }

      setLoading(false);
    };

    func().catch(console.error);
  }, [closeWaiting, getWcAddress, inactiveModal, notify, onSubmitAddressLinking, openWaiting, t]);

  const onCancel = useCallback(() => {
    wcAccount && disconnectWithoutConfirmModal(wcAccount).then(() => {
      inactiveModal(modalId);
    }).catch(console.error);
  }, [disconnectWithoutConfirmModal, inactiveModal, wcAccount]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          disabled={loading}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={onCancel}
          schema={'secondary'}
          shape={'round'}
          size={'sm'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onCheckingLinkedAccount}
          shape={'round'}
          size={'sm'}
        >
          {t('Change account')}
        </Button>
      </>
    );
  }, [loading, onCancel, onCheckingLinkedAccount, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCancel}
      title={t('Failed to complete')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'60px'}
            iconColor={token.colorIconHover}
            phosphorIcon={SmileySad}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div className={'__title-modal'}>{t('Change your wallet account')}</div>
          <div
            className={'__sub-title-modal'}
          >
            {t(`Your Telegram ID is linked to account ${wcAccount?.address || ''}. Connect to this account and try again`)}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const ExistedAddressModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    padding: 0,
    maxHeight: '100%',
    marginBottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',

    '.ant-sw-modal-body': {
      padding: `${token.padding}px ${token.paddingXS}px`
    },

    '.ant-sw-sub-header-title-content': {
      lineHeight: token.lineHeightHeading3
    },

    '.ant-sw-modal-confirm-body': {
      background: extendToken.colorBgGradient,
      borderRadius: 24,
      padding: `${token.paddingXL}px ${token.paddingMD}px`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.paddingLG,

      '.ant-sw-modal-confirm-content': {
        padding: 0,
        margin: 0
      }
    },

    '.ant-sw-sub-header-container': {
      flexDirection: 'row-reverse',

      '.ant-sw-header-left-part': {
        marginRight: token.marginXS
      }
    },

    '.__icon-modal': {
      borderRadius: '50%',
      padding: token.paddingLG - 2,
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: token.colorWhite,
      width: 104,
      height: 104
    },

    '.__description-modal': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.size
    },

    '.__title-modal': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorText,
      fontWeight: 600
    },

    '.__sub-title-modal': {
      textAlign: 'center',
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontWeight: 500,
      color: token.colorTextDark2
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      paddingTop: token.paddingXS,
      display: 'flex',
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    }
  };
});

export default ExistedAddressModal;
