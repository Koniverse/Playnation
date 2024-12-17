// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { preloadImages } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, PageIcon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Info, Warning, XCircle } from 'phosphor-react';
import { IconProps } from 'phosphor-react/src/lib';
import React, { useCallback, useContext, useEffect } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & AlertDialogProps & {
  modalId: string
}

const alertTypeAndIconMap = {
  [NotificationType.INFO]: {
    icon: Info,
    weight: 'fill'
  },
  [NotificationType.WARNING]: {
    icon: Warning,
    weight: 'fill'
  },
  [NotificationType.ERROR]: {
    icon: XCircle,
    weight: 'fill'
  },
  [NotificationType.SUCCESS]: {
    icon: CheckCircle,
    weight: 'fill'
  }
};

const Component: React.FC<Props> = (props: Props) => {
  const { cancelButton,
    className,
    content,
    modalId,
    okButton,
    title,
    onCancel,
    isShowIcon,
    type = NotificationType.INFO, iconProps, contentTitle } = props;

  const { inactiveModal } = useContext(ModalContext);

  const _onCancel = useCallback(() => {
    if (onCancel) {
      onCancel();

      return;
    }

    inactiveModal(modalId);
  }, [onCancel, inactiveModal, modalId]);

  useEffect(() => {
    preloadImages([
      '/images/mythical/alert-modal-bg.png',
      '/images/mythical/alert-modal-ok-button.png',
      '/images/mythical/alert-modal-cancel-button.png'
    ]);
  }, []);

  return (
    <>
      <SwModal
        className={CN(className)}
        closable={false}
        destroyOnClose={false}
        footer={
          <div className='__buttons-container'>
            {!!cancelButton &&
              <MythButton
                className={'__action-button __left-button'}
                icon={cancelButton.icon && (
                  <Icon
                    phosphorIcon={cancelButton.icon}
                    weight={cancelButton.iconWeight || 'fill'}
                  />
                )}
                onClick={_onCancel}
              >
                {cancelButton.text}
              </MythButton>
            }
            <MythButton
              className={'__action-button __right-button'}
              icon={okButton.icon && (
                <Icon
                  phosphorIcon={okButton.icon}
                  weight={okButton.iconWeight || 'fill'}
                />
              )}
              onClick={okButton?.onClick}
            >
              {okButton.text}
            </MythButton>
          </div>
        }
        id={modalId}
        title={title}
      >
        <div className='__modal-content'>
          {!!isShowIcon &&
          <div className={CN('__alert-icon', {
            '-info': type === NotificationType.INFO,
            '-success': type === NotificationType.SUCCESS,
            '-warning': type === NotificationType.WARNING,
            '-error': type === NotificationType.ERROR
          })}
          >
            <PageIcon
              color={''}
              iconProps={iconProps || {
                weight: alertTypeAndIconMap[type].weight as IconProps['weight'],
                phosphorIcon: alertTypeAndIconMap[type].icon
              }}
            />
          </div>
          }

          {
            !!contentTitle && (
              <div className='__content-title'>
                {contentTitle}
              </div>
            )
          }

          <div className='__content'>
            {content}
          </div>
        </div>
      </SwModal>
    </>
  );
};

const AlertModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.ant-sw-modal-body': {
      margin: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 4
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      borderTop: 0,
      gap: token.sizeXXS,
      paddingBottom: 34
    },

    '.ant-sw-header-center-part': {
      position: 'relative',
      marginLeft: 16,
      marginRight: 16
    },

    '.ant-sw-sub-header-title-content.ant-sw-sub-header-title-content.ant-sw-sub-header-title-content': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontWeight: 400,
      lineHeight: '40px',
      fontSize: 32,
      textTransform: 'uppercase',
      'white-space': 'normal'
    },

    '.ant-sw-modal-content.ant-sw-modal-content': {
      borderRadius: 0,
      paddingTop: 27,
      backgroundImage: 'url(/images/mythical/alert-modal-bg.png)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      // filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      width: '100%'
    },

    '.__modal-content': {
      color: extendToken.mythColorGray1,
      fontSize: 16,
      fontFamily: extendToken.fontBarlowCondensed,
      lineHeight: '18px',
      textAlign: 'center',
      letterSpacing: 0.32,
      paddingLeft: 22,
      paddingRight: 22,
      fontWeight: 400
    },

    '.__buttons-container': {
      display: 'flex',
      gap: 12,
      justifyContent: 'space-between',
      flex: 1
    },

    '.__action-button': {
      height: 52,
      paddingLeft: 12,
      paddingRight: 10,

      '.__button-content': {
        fontSize: '22px',
        lineHeight: '24px',
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        // filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        maskSize: '100% 100%',
        maskPosition: 'top left'
      },

      '.__button-inner': {
        flexDirection: 'row-reverse'
      }
    },

    '.__left-button': {
      maxWidth: '45%',
      flex: '1 5 auto',

      '.__button-inner': {
        gap: 4
      },

      '.__action-button-icon': {
        order: 1,
        color: extendToken.mythColorDark,
        fontSize: 24
      },

      '.__button-background:before': {
        backgroundColor: token.colorWhite,
        maskImage: 'url(/images/mythical/alert-modal-cancel-button.png)'
      }
    },

    '.__right-button': {
      flex: '1 0 auto',

      '.__button-inner': {
        gap: 4
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/alert-modal-ok-button.png)'
      }
    },

    '.ant-page-icon': {
      backgroundColor: extendToken.colorBgSecondary1,

      '.anticon': {
        fontSize: '60px !important'
      }
    },

    '.anticon': {
      fontSize: '24px !important'
    },

    '.__alert-icon': {
      display: 'flex',
      justifyContent: 'center',
      color: token.colorTextDark1,
      marginBottom: 24
    },

    '.__content-title': {
      color: token.colorTextDark1,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.headingFontWeight,
      marginBottom: token.margin
    },

    '.__content': {
      color: extendToken.mythColorGray1
    }
  };
});

export default AlertModal;
