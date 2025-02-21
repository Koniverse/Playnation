// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { PWA_INSTRUCTION_MODAL, SHOW_INSTRUCTION_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isAndroid, isMobile } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, DotsThree, Export, Info } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

const modalId = PWA_INSTRUCTION_MODAL;
const instructionLocalKey = SHOW_INSTRUCTION_MODAL;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;
  const [loading] = useState(false);

  const onOK = useCallback(() => {
    inactiveModal(modalId);
    localStorage.setItem(instructionLocalKey, 'true');
  }, [inactiveModal]);

  const contentModal = useMemo(() => {
    if (isAndroid() || !isMobile()) {
      return (
        <>
          <div className={'__list-item'}>
            <div className={'__index-list'}>1</div>
            <div className={'-has-icon'}>{t('Tap the ')}
              <Icon
                customSize={'28px'}
                phosphorIcon={DotsThree}
                weight='fill'
              />
              {t(' icon to open the action list')}</div>
          </div>

          <div className={'__list-item'}>
            <div className={'__index-list'}>2</div>
            <div>{t('Scroll down and select')} <b>{t('“Add to Home Screen”')}</b></div>
          </div>

          <div className={'__list-item'}>
            <div className={'__index-list'}>3</div>
            <div>{t('Tap ')}
              <b>{t('“Install”')}</b> {t('from the popup, then select')}<b>{t('“Install”')}</b> {t('to add Koni Story to your home screen')}
            </div>
          </div>

        </>
      );
    }

    return (
      <>
        <div className={'__list-item'}>
          <div className={'__index-list'}>1</div>
          <div className={'-has-icon'}>{t('Tap the ')}
            <Icon
              customSize={'28px'}
              phosphorIcon={Export}
              weight='light'
            />
            {t(' icon to open the action list')}</div>
        </div>
        <div className={'__list-item'}>
          <div className={'__index-list'}>2</div>
          <div>{t('Scroll down and select')} <b>{t('“Add to Home Screen”')}</b></div>
        </div>
        <div className={'__list-item'}>
          <div className={'__index-list'}>3</div>
          <div>{t('Tap ')} <b>{t('“Add”')}</b> {t(' to add Koni Story to your home screen')}</div>
        </div>
      </>
    );
  }, [t]);

  const footerModal = useMemo(() => {
    return (
      <Button
        block={true}
        icon={(
          <Icon
            customSize={'20px'}
            phosphorIcon={CheckCircle}
            weight='fill'
          />
        )}
        loading={loading}
        onClick={onOK}
        shape={'round'}
        size={'sm'}
      >
        {t('Got it!')}
      </Button>
    );
  }, [loading, onOK, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onOK}
      title={t('Instruction')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'60px'}
            iconColor={token.colorIconHover}
            phosphorIcon={Info}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div className={'__title-modal'}>{t('Add Koni Story to your Home Screen')}</div>
          <div
            className={'__sub-title-modal'}
          >
            {contentModal}
          </div>
        </div>
      </div>
    </SwModal>
  );
}

const PWAInstruction = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      color: token.colorTextDark2
    },

    '.__list-item': {
      display: 'flex',
      gap: token.sizeSM,
      alignItems: 'baseline',
      marginBottom: 8,

      '.__index-list': {
        width: 28,
        height: 22,
        textAlign: 'center',
        paddingRight: token.paddingXS,
        paddingLeft: token.paddingXS,
        borderRadius: 12,
        backgroundColor: '#1F1F231F'
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
    },

    '.-has-icon': {
      display: 'flex',
      gap: token.sizeXXS,
      alignItems: 'center',

      '.anticon': {
        backgroundColor: '#1F1F231F',
        borderRadius: 4
      }
    }
  };
});

export default PWAInstruction;
