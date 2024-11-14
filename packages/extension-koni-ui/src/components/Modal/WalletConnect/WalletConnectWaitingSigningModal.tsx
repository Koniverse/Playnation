// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WALLET_CONNECT_WAITING_SIGNING_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;

const modalId = WALLET_CONNECT_WAITING_SIGNING_MODAL;

function Component (props: Props): React.ReactElement<Props> {
  const { className = '' } = props;

  const { t } = useTranslation();

  // TODO: Update UI

  return (
    <SwModal
      className={CN(className, '-light-theme')}
      closable={false}
      id={modalId}
      maskClosable={false}
      title={t('Success')}
    >
      <div className='__content-area'>
        <div className='__congratulation-text'>
          {t("You've a request to sign with your wallet")}:
        </div>
      </div>
    </SwModal>
  );
}

export const WalletConnectWaitingSigningModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
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
    }
  });
});
