// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { isSameAddress } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { CONFIRM_LINKING_ACCOUNT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Field, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Link, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  onErrorHandler?: () => void;
  addressLinking?: string;
  setAddressLinking: (address?: string) => void;
}
const apiSDK = BookaSdk.instance;
const modalId = CONFIRM_LINKING_ACCOUNT_MODAL;

function Component ({ addressLinking, className, onErrorHandler, setAddressLinking }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const [loading, setLoading] = useState(false);
  const { token } = useTheme() as Theme;
  const { wcAccount } = useSelector((state) => state.accountState);
  const { disconnectWithoutConfirmModal } = useContext(WalletConnectContext);

  const onSubmitLinkingAccount = useCallback(() => {
    const func = async () => {
      try {
        setLoading(true);

        if (!addressLinking) {
          throw new Error('Linking address is not set');
        }

        const addressMinted = await apiSDK.getMintedAddress();

        if (addressMinted && !isSameAddress(addressMinted, addressLinking)) {
          throw new Error('Address linked must be the same as the minted address');
        }

        await apiSDK.setAccountAddress(addressLinking);
        await apiSDK.getStatsOfAddress();
      } catch (e) {
        setLoading(false);

        const error = e as Error;

        if (error.message.toLowerCase().includes('Address already registered'.toLowerCase()) ||
        error.message.toLowerCase().includes('minted address'.toLowerCase())) {
          onErrorHandler && onErrorHandler();
        }
      }

      setAddressLinking(undefined);
      inactiveModal(modalId);
      setLoading(false);
    };

    func().catch(console.error);
  }, [setAddressLinking, inactiveModal, addressLinking, onErrorHandler]);

  const onCancel = useCallback(() => {
    wcAccount && disconnectWithoutConfirmModal(wcAccount).catch(console.error);
    inactiveModal(modalId);
  }, [disconnectWithoutConfirmModal, inactiveModal, wcAccount]);

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
          onClick={onSubmitLinkingAccount}
          shape={'round'}
        >
          {t('Agree')}
        </Button>
      </>
    );
  }, [loading, onCancel, onSubmitLinkingAccount, t]);

  return (
    <SwModal
      className={CN(className)}
      footer={footerModal}
      id={modalId}
      onCancel={onCancel}
      title={t('Link your account')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'44px'}
            iconColor={token.colorWhite}
            phosphorIcon={Link}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div
            className={'__sub-title-modal'}
          >
            {t('Your Telegram ID can only be linked to one account. This account will be used for all on-chain missions linked with your Telegram ID. Do you want to link this account?')}
          </div>
          {!!addressLinking && <Field
            className={'address-field'}
            content={toShort(addressLinking, 10, 16)}
            suffix={(
              <Icon
                iconColor={token.colorSuccess}
                phosphorIcon={CheckCircle}
                size='sm'
                weight='fill'
              />
            )}
          />}
        </div>
      </div>
    </SwModal>
  );
}

const ConfirmLinkingAccountModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      height: 104,

      '.anticon': {
        width: 60,
        height: 60,
        backgroundColor: token.colorIconHover,
        borderRadius: '50%',
        padding: token.paddingXS
      }
    },

    '.__description-modal': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.sizeLG
    },

    '.__sub-title-modal': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      fontWeight: 500,
      color: token.colorTextDark2,
      textAlign: 'center'
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

export default ConfirmLinkingAccountModal;
