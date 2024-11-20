// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CONFIRM_YOUR_ACCOUNT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Field, Icon, ModalContext, PageIcon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  address: string;
  callback: (address: string) => void;
}

const modalId = CONFIRM_YOUR_ACCOUNT_MODAL;

function Component (props: Props): React.ReactElement<Props> {
  const { address, callback, className = '' } = props;

  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  const { inactiveModal } = useContext(ModalContext);

  const onClose = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onOK = useCallback(() => {
    inactiveModal(modalId);
    callback(address);
  }, [address, callback, inactiveModal]);

  const modalFooter = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          icon={
            <Icon
              phosphorIcon={XCircle}
              size='sm'
              weight='fill'
            />
          }
          onClick={onClose}
          schema={'secondary'}
          shape={'round'}
          size={'sm'}
        >
          {t('Cancel')}
        </Button>
        <Button
          block={true}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          }
          onClick={onOK}
          shape={'round'}
          size={'sm'}
        >
          {t('Confirm')}
        </Button>
      </>
    );
  }, [onClose, onOK, t]);

  return (
    <SwModal
      className={CN(className, '-light-theme', 'modal-revert-header', 'general-confirmation-modal')}
      footer={modalFooter}
      id={modalId}
      maskClosable={true}
      onCancel={onClose}
      title={t('Confirm your account')}
    >
      <div className='__content-area'>
        <div className='page-icon-overide'>
          <PageIcon
            color='#000'
            iconProps={{
              phosphorIcon: CheckCircle,
              weight: 'fill'
            }}
          />
        </div>
        <div className='__congratulation-text'>
          {t('One account can only be linked with one Telegram ID to mint one badge. Do you want to use this account to mint?')}
        </div>
        <Field
          className={'__address-field'}
          content={toShort(address, 10, 16)}
          suffix={(
            <Icon
              iconColor={token.colorSuccess}
              phosphorIcon={CheckCircle}
              size='sm'
              weight='fill'
            />
          )}
        />
      </div>
    </SwModal>
  );
}

export const ConfirmYourAccountModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)',
      borderRadius: 24,
      display: 'flex',
      gap: token.size,
      textAlign: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px'
    },

    '.__congratulation-text': {
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark1
    }
  });
});
