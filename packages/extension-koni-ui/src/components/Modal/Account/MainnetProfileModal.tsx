// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MAINNET_PROFILE_MODAL, SHOW_MAINNET_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Confetti } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  closeCallback?: () => void;
}

const modalId = MAINNET_PROFILE_MODAL;

function Component ({ className, closeCallback }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;

  const onCancelModal = useCallback(() => {
    localStorage.setItem(SHOW_MAINNET_PROFILE_MODAL, 'true');
    inactiveModal(modalId);
    closeCallback && closeCallback();
  }, [closeCallback, inactiveModal]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          onClick={onCancelModal}
          shape={'round'}
          size={'sm'}
        >
          {t('Got it')}
        </Button>
      </>
    );
  }, [onCancelModal, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCancelModal}
      title={t('Mainnet profile is live!')}
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
          <div className={'__title-modal'}>{t('View your on-chain stats on Story Mainnet')}</div>
          <div
            className={'__sub-title-modal'}
          >
            {t('Your integrated profile has been migrated to Story Mainnet. Check out the updated on-chain stats and keep building your profile to become a true IPventure pioneer in Story ecosystem')}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const MainnetProfileModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      gap: token.size,
      textAlign: 'center'
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
      color: token.colorTextDark2
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
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

export default MainnetProfileModal;
