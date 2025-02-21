// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TelegramWebApp } from '@subwallet/extension-base/utils/telegram';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ACCESS_HOME_SCREEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isAndroid } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, ArrowFatLinesUp, HandPointing } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  otp: string;
};

interface PWAWelcomeModal {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const apiSdk = BookaSdk.instance;
const modalId = ACCESS_HOME_SCREEN_MODAL;
const appUrl = process.env.STORY_PROTOCOL_APP_URL || 'https://dev.story-protocol-odyssey.pages.dev';

function Component ({ className, otp }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { checkActive, inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;
  const [otpValue, setOtpValue] = useState(otp);

  const isActive = useMemo(() => checkActive(modalId), [checkActive]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
    TelegramWebApp?.close();
  }, [inactiveModal]);

  const onContinue = useCallback(() => {
    setTimeout(() => {
      TelegramWebApp?.close();
    }, 3000);
  }, []);

  useEffect(() => {
    setOtpValue(otp);
  }, [otp]);

  useEffect(() => {
    let interval = 0;

    if (isActive) {
      interval = setInterval(() => {
        apiSdk.renewOTP().then((newOtp) => {
          newOtp && setOtpValue(newOtp);
        }).catch(console.error);
      }, 1000 * 60 * 2.5) as unknown as number;
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive]);

  const { content, subtitle, title } = useMemo<PWAWelcomeModal>(() => {
    if (isAndroid()) {
      return {
        content: (
          <ul className={CN('__content-modal', '-flex-box')}>
            <li>
              {t('By adding Koni Story to your home screen, you can quickly access the bot as a mobile app')}
            </li>
            <li>
              {t('To add, hold button ')}<b>“Hold to continue”</b>{t(' then click ')}<b>“Open in...”</b>{t('to open Koni Story in your browser')}
            </li>
          </ul>
        ),
        subtitle: t('Access Koni Story from your home screen'),
        title: t('Koni Story app is here!')
      };
    } else {
      return {
        content: (
          <div className={'__content-modal'}>
            <>
              {t('You can now enjoy all features of Koni Story on your favorite browser. Click ')}<b>“Continue to browser”</b>{t(' and try out now!')}
            </>
          </div>
        ),
        subtitle: t('Access Koni Story from your browser'),
        title: t('Koni Story is on browser!')
      };
    }
  }, [t]);

  const footerModal = useMemo(() => {
    let icon = (
      <Icon
        customSize={'20px'}
        phosphorIcon={ArrowCircleRight}
        weight='fill'
      />
    );

    let btnLabel = t('Continue to browser');

    if (isAndroid()) {
      icon = (
        <Icon
          customSize={'20px'}
          phosphorIcon={HandPointing}
          weight='bold'
        />
      );
      btnLabel = t('Hold to continue');
    }

    return (
      <>
        <Button
          block={true}
          href={`${appUrl}?otp=${otpValue || ''}`}
          icon={icon}
          onClick={onContinue}
          shape={'round'}
          size='md'
          target={'_blank'}
        >
          {btnLabel}
        </Button>
      </>
    );
  }, [onContinue, otpValue, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCancel}
      title={title}
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
          <div className={'__sub-title-modal'}>{subtitle}</div>
          {content}
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

    '.__sub-title-modal': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading3,
      color: token.colorText,
      fontWeight: 600,
      textAlign: 'center'
    },

    '.__content-modal': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightSM,
      fontWeight: 500,
      color: token.colorTextDark2,
      textAlign: 'center',

      '&.-flex-box': {
        display: 'flex',
        flexDirection: 'column',
        gap: token.size
      },

      li: {
        listStyle: 'disc',
        textAlign: 'start'
      }
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
