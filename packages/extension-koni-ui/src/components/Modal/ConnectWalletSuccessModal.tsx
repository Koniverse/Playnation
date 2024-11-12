// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { CONNECT_WALLET_SUCCESS_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Input, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  address: string;
}

const modalId = CONNECT_WALLET_SUCCESS_MODAL;

function Component (props: Props): React.ReactElement<Props> {
  const { address, className = '' } = props;

  const { t } = useTranslation();

  const { inactiveModal } = useContext(ModalContext);

  const onClose = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const modalFooter = (() => {
    return (
      <>
        <Button
          block={true}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'small'}
              weight={'fill'}
            />
          }
          onClick={onClose}
          shape={'round'}
          size={'sm'}
        >
          {t('Continue')}
        </Button>
      </>
    );
  })();

  // TODO: Update UI

  return (
    <SwModal
      className={CN(className, '-light-theme')}
      footer={modalFooter}
      id={modalId}
      onCancel={onClose}
      title={t('Success')}
    >
      <div className='__content-area'>
        <img
          alt='Gift Box'
          className={'__zoomable-image'}
          src={DefaultLogosMap.boxGift}
        />
        <div className='__congratulation-text'>
          {t("You've successfully connected your wallet to Koni Story")}:
        </div>
        <Input
          disabled={true}
          value={address}
        />
      </div>
    </SwModal>
  );
}

export const ConnectWalletSuccessModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      backgroundColor: token.colorPrimary,
      borderRadius: 24,
      display: 'flex',
      gap: token.size,
      textAlign: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px'
    },

    '.__congratulation-text': {
      fontSize: token.fontSizeLG,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark1
    },

    '.__reward-info': {
      height: 48,
      paddingLeft: 20,
      paddingRight: 20,
      display: 'flex',
      alignItems: 'center',
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 58
    },

    '.__reward-icon': {
      width: 28,
      height: 28
    },

    '.__reward-value': {
      marginLeft: token.marginXS
    },

    '.__reward-symbol': {
      marginLeft: token.marginXXS,
      color: token.colorTextDark4
    }

  });
});
