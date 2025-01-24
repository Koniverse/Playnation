// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWStorage } from '@subwallet/extension-base/storage';
import { NEW_CHAT_AI_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Confetti, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;
const cloudStorage = SWStorage.instance;
const cloudStorageKey = 'new-chat-ai-modal';
const modalId = NEW_CHAT_AI_MODAL;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const { token } = useTheme() as Theme;

  const onNavigateToChatAi = useCallback(() => {
    const func = async () => {
      try {
        await cloudStorage.setItem(cloudStorageKey, 'showed');
        inactiveModal(modalId);
        navigate('/ai-agent');
      } catch (e) {
        inactiveModal(modalId);
        console.error(e);
      }
    };

    func().catch(console.error);
  }, [inactiveModal, navigate]);

  const onCancel = useCallback(() => {
    const func = async () => {
      await cloudStorage.setItem(cloudStorageKey, 'showed');
    };

    func().then(() => {
      inactiveModal(modalId);
    }).catch(console.error);
  }, [inactiveModal]);

  const footerModal = useMemo(() => {
    return (
      <div className={'ant-sw-modal-confirm-btns'}>
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
          onClick={onNavigateToChatAi}
          shape={'round'}
          size={'sm'}
        >
          {t('Chat now')}
        </Button>
      </div>
    );
  }, [onCancel, onNavigateToChatAi, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCancel}
      title={t('Tell Me is here!')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'60px'}
            iconColor={token.colorIconHover}
            phosphorIcon={Confetti}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div className={'__title-modal'}>{t('Congratulations, you’re whitelisted!')}</div>
          <ul
            className={'__sub-title-modal'}
          >
            <li>{t('Tell Me is your new AI Agent on Koni Story. Tell Me will answer all your questions about Story ecosystem, even mint and transfer IP for you.')}</li>
            <li>{t('A small group of active users is whitelisted to chat with Tell Me Agent. In this phase, you can send up to 10 messages to Tell Me each day. Ready to start chatting?')}</li>
          </ul>
        </div>
      </div>
    </SwModal>
  );
}

const NewAiChatModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      paddingTop: token.paddingXS
    },

    '.ant-sw-modal-confirm-btns': {
      display: 'flex',
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    }
  };
});

export default NewAiChatModal;
