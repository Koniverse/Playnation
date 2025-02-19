// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TELEGRAM_WEBAPP_LINK } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { PWA_WELCOME_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { PaperPlaneTilt } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;
const modalId = PWA_WELCOME_MODAL;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          href={`https://t.me/${TELEGRAM_WEBAPP_LINK}`}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={PaperPlaneTilt}
              weight='light'
            />
          )}
          shape={'round'}
          size={'sm'}
        >
          {t('Log in with Telegram')}
        </Button>
      </>
    );
  }, [t]);

  return (
    <SwModal
      className={CN(className)}
      closable={false}
      footer={footerModal}
      id={modalId}
      title={t('Welcome to Koni Story!')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <img
            alt='logo'
            className='logo'
            src={'/images/welcome-pwa-logo.png'}
          />
        </div>
        <div className={'__description-modal'}>
          <div
            className={'__sub-title-modal'}
          >
            {t('Log in to kickstart your IPventure')}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const PWALogin = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    padding: 0,
    maxHeight: '100%',
    maxWidth: 374,
    marginBottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    top: 0,
    flexDirection: 'column',

    '.ant-sw-modal-body': {
      padding: `${token.paddingLG}px ${token.paddingXS}px`
    },

    '.ant-sw-sub-header-title-content': {
      lineHeight: token.lineHeightHeading3
    },

    '& .ant-sw-modal-content': {
      borderRadius: '24px !important'
    },

    '.ant-sw-modal-confirm-body': {
      padding: `${token.paddingXS}px ${token.paddingMD}px`,
      paddingBottom: 0,
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
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: token.colorWhite,
      width: 119.29,
      height: 116.79,

      img: {
        objectFit: 'contain'
      }
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
      fontWeight: 600
    },

    '.__sub-title-modal': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightSM,
      fontWeight: 500,
      color: token.colorTextDark2,
      paddingInlineStart: token.paddingSM,

      li: {
        listStyle: 'disc',
        textAlign: 'center'
      }
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      padding: `${token.paddingXL + 8}px ${token.paddingXL}px`,
      paddingTop: 0
    },

    '.ant-sw-modal-confirm-btns': {
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    },

    '.ant-btn-content-wrapper': {
      fontWeight: 500,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    }
  };
});

export default PWALogin;
