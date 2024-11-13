// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { preloadImages } from '@subwallet/extension-koni-ui/utils';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onCancel: VoidFunction;
  onOk: VoidFunction;
}

export const TERM_AND_CONDITION_MODAL_ID = 'TERM_AND_CONDITION_MODAL_ID';
const modalId = TERM_AND_CONDITION_MODAL_ID;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { className = '', onCancel } = props;

  useEffect(() => {
    preloadImages([
      '/images/mythical/leaderboard-terms-conditions-bg.png',
      '/images/mythical/close-button.png',
      '/images/mythical/okay-button-background.png'
    ]);
  }, []);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      id={modalId}
      onCancel={onCancel}
    >
      <div className={'__cancel-button-header'} onClick={onCancel}></div>
      <div className={'__modal-title'}>{t('Lorem ipsum')}</div>

      <div className={'__modal-description'}>
        {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
          'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
          'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \n' +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
          'dolore magna tempor incididunt ut labore et dolore magna tempor incididunt')}</div>
      <div className={'__modal-description'}>
        {t('Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' +
          'sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, ' +
          'quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \n' +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et ' +
          'dolore magna tempor incididunt ut labore et dolore magna tempor incididunt')}</div>

      <div className='__buttons-container'>
        <MythButton
          className={'__action-button __close-button'}
          onClick={onCancel}
        >
          {t('OKAY')}
        </MythButton>
      </div>
    </SwModal>
  );
}

export const TermAndConditionModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    paddingBottom: 40,
    paddingLeft: 16,
    paddingRight: 16,

    '&.ant-sw-modal.ant-sw-modal': {
      justifyContent: 'flex-start',
      alignItems: 'center',

      '&:before, &:after': {
        content: '""',
        display: 'block',
        flex: 1
      }
    },

    '.ant-sw-modal-content.ant-sw-modal-content': {
      borderRadius: 0,
      maxWidth: 370,
      paddingTop: 24,
      backgroundImage: 'url(/images/mythical/leaderboard-terms-conditions-bg.png)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      position: 'relative'
    },

    '.__cancel-button-header': {
      backgroundImage: 'url(/images/mythical/close-button.png)',
      backgroundSize: '30px 32px',
      height: 32,
      width: 30,
      position: 'absolute',
      top: '-44px',
      right: 0
    },

    '.ant-sw-modal-body': {
      paddingBottom: 54
    },

    '.ant-sw-modal-header': {
      display: 'none'
    },

    '.__modal-title': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '32px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '40px',
      textTransform: 'uppercase',
      marginBottom: 10
    },

    '.__modal-description': {
      color: extendToken.mythColorGray1,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      marginBottom: 20
    },

    '.__buttons-container': {
      display: 'flex',
      gap: 12
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
        filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__close-button': {
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
        maskImage: 'url(/images/mythical/okay-button-background.png)',
        filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      }
    }
  });
});
