// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { AlertDialogProps, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, PageIcon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Info, Warning, XCircle } from 'phosphor-react';
import { IconProps } from 'phosphor-react/src/lib';
import React, { useCallback, useContext } from 'react';
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
    closable,
    content,
    modalId,
    okButton,
    title,
    type = NotificationType.INFO, iconProps, contentTitle } = props;

  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  return (
    <>
      <SwModal
        className={CN(className, '-light-theme')}
        closable={closable}
        destroyOnClose={true}
        footer={
          <>
            {!!cancelButton &&
              <Button
                block={true}
                className={'__left-button'}
                icon={cancelButton.icon && (
                  <Icon
                    phosphorIcon={cancelButton.icon}
                    weight={cancelButton.iconWeight || 'fill'}
                  />
                )}
                onClick={cancelButton.onClick}
                schema={cancelButton.schema || 'secondary'}
                shape={'round'}
              >
                {cancelButton.text}
              </Button>
            }
            <Button
              block={true}
              className={'__right-button'}
              icon={okButton.icon && (
                <Icon
                  phosphorIcon={okButton.icon}
                  weight={okButton.iconWeight || 'fill'}
                />
              )}
              onClick={okButton?.onClick}
              schema={okButton.schema}
              shape={'round'}
            >
              {okButton.text}
            </Button>
          </>
        }
        id={modalId}
        onCancel={onCancel}
        title={title}
      >
        <div className='__modal-content'>
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
      paddingBottom: token.paddingXS,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      borderTop: 0,
      gap: token.sizeXXS
    },

    '.__modal-content': {
      background: extendToken.colorBgGradient || token.colorPrimary,
      fontSize: token.fontSize,
      lineHeight: token.lineHeightHeading6,
      textAlign: 'center',
      paddingTop: 32,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 32,
      borderRadius: 24
    },

    '.ant-page-icon': {
      backgroundColor: extendToken.colorBgSecondary1,

      '.anticon': {
        fontSize: '60px !important'
      }
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
      color: token.colorTextDark2
    }
  };
});

export default AlertModal;
