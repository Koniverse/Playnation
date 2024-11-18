// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WALLET_CONNECT_WAITING_SIGNING_MODAL } from '@subwallet/extension-koni-ui/constants';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Field, Icon, PageIcon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  address: string;
}

const modalId = WALLET_CONNECT_WAITING_SIGNING_MODAL;

function Component (props: Props): React.ReactElement<Props> {
  const { address, className = '' } = props;

  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  const modalFooter = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          loading={true}
          shape={'round'}
          size={'sm'}
        >
          {t('Signing')}
        </Button>
      </>
    );
  }, [t]);

  return (
    <SwModal
      className={CN(className, '-light-theme')}
      closable={false}
      destroyOnClose={true}
      footer={modalFooter}
      id={modalId}
      maskClosable={false}
      title={t('Sign with your wallet')}
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
          {t('Open your wallet and sign the request with this account')}
        </div>
        <Field
          className={'address-field'}
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

export const WalletConnectWaitingSigningModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 0
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
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
