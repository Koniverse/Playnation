// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALERT_CHANGE_ACCOUNT_CONNECT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, SmileySad, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  addressConnected: string;
}

const modalId = ALERT_CHANGE_ACCOUNT_CONNECT_MODAL;

function Component ({ addressConnected, className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { wcAccount } = useSelector((state) => state.accountState);
  const { disconnectWithoutConfirmModal } = useContext(WalletConnectContext);
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;

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
            />
          )}
          onClick={onCancel}
          shape={'round'}
          size={'sm'}
        >
          {t('Change account')}
        </Button>
      </>
    );
  }, [onCancel, t]);

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
            {t(`Your Telegram ID is linked to account ${toShort(addressConnected)}. Connect to this account and try again`)}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const AlertChangeAccountConnectModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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

export default AlertChangeAccountConnectModal;
