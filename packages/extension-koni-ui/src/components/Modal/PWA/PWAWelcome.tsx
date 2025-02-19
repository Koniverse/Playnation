// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';
import { ACCESS_HOME_SCREEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowFatLinesUp, CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  otp: string;
};

const modalId = ACCESS_HOME_SCREEN_MODAL;

function Component ({ className, otp }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;

  const onContinue = useCallback(() => {
    inactiveModal(modalId);

    window.open(`https://pwa.story-protocol-odyssey.pages.dev?otp=${otp || ''}`, '_blank');
    TelegramWebApp?.close();
  }, [otp, inactiveModal]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
    TelegramWebApp?.close();
  }, [inactiveModal]);

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
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          onClick={onContinue}
          shape={'round'}
          size={'sm'}
        >
          {t('Continue')}
        </Button>
      </>
    );
  }, [onCancel, onContinue, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCancel}
      title={t('Koni Story PWA is here')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'60px'}
            iconColor={token.colorIconHover}
            phosphorIcon={ArrowFatLinesUp}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div className={'__title-modal'}>{t('Access Koni Story from your home screen')}</div>
          <div
            className={'__sub-title-modal'}
          >
            {t('By using Koni Story on PWA, you can quickly access the bot from your smartphone’s home screen as a mobile app and seamlessly connect with other ecosystems beyond TON')}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const PWAWelcome = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      lineHeight: token.lineHeightHeading3,
      color: token.colorText,
      fontWeight: 600,
      textAlign: 'center'
    },

    '.__sub-title-modal': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightSM,
      fontWeight: 500,
      color: token.colorTextDark2,
      textAlign: 'center'
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      display: 'flex',
      paddingTop: token.paddingXS
    },

    '.ant-sw-modal-confirm-btns': {
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    }
  };
});

export default PWAWelcome;
