// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { REQUEST_CAMERA_ACCESS_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { GearSix, Warning } from 'phosphor-react';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const modalId = REQUEST_CAMERA_ACCESS_MODAL;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { inactiveModal } = useContext(ModalContext);

  const closeModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClick = useCallback(() => {
    closeModal();

    navigate('/settings/security', { state: true });
  }, [closeModal, navigate]);

  return (
    <SwModal
      id={modalId}
      onCancel={closeModal}
      title={t('Cannot scan')}
      wrapClassName={CN(className)}
    >
      <div className='body-container'>
        <div className='warning-wrapper'>
          <div className='notice'>
            <Icon
              customSize={'24px'}
              iconColor='var(--icon-warning-color)'
              phosphorIcon={Warning}
              weight={'fill'}
            />
            <div className='title'>
              {t('Your camera is not available')}
            </div>
          </div>
          <div className='description'>
            {t('Please allow camera access to continue')}
          </div>
        </div>
        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={GearSix}
            />
          )}
          onClick={onClick}
          shape={'round'}
        >
          {t('Go to Setting')}
        </Button>
      </div>
    </SwModal>
  );
};

const RequestCameraAccessModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '--icon-warning-color': token.colorWarning,

    '.body-container': {

    },

    '.warning-wrapper': {
      backgroundColor: extendToken.colorBgSecondary1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      borderRadius: 20,
      padding: '20px 16px',
      marginBottom: token.margin
    },

    '.notice': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: token.marginSM
    },

    '.title': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1,
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4
    },

    '.description': {
      color: token.colorTextDark4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    }
  };
});

export default RequestCameraAccessModal;
