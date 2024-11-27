// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { VISIT_LOGIN_CTA_FLAG } from '@subwallet/extension-koni-ui/constants';
import { VISIT_LOGIN_CTA_FLAG_DEFAULT_VALUE } from '@subwallet/extension-koni-ui/constants/localStorageDefaultValue';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useContext } from 'react';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const [, setIsVisitedLoginCTA] = useLocalStorage(VISIT_LOGIN_CTA_FLAG, VISIT_LOGIN_CTA_FLAG_DEFAULT_VALUE);
  const { onLogin } = useContext(AuthenticationMythContext);
  const { goHome } = useDefaultNavigate();

  const continueWithTelegram = useCallback(() => {
    setIsVisitedLoginCTA(true);
    goHome();
  }, [goHome, setIsVisitedLoginCTA]);

  const linkingWithMythAccount = useCallback(() => {
    setIsVisitedLoginCTA(true);
    onLogin();
  }, [onLogin, setIsVisitedLoginCTA]);

  return (
    <div className={CN(className)}>
      <div className='logo-area'>

        <img
          alt='logo'
          className='logo'
          src={'/images/mythical/login/logo.png'}
        />
      </div>

      <div className='content-area'>
        <div className='welcome-text'>
          {t('Welcome to football rivals')}
        </div>

        <div className='sub-content-text'>
          {t('An exciting new way to build and  play with your RIVALS collection!')}
        </div>

        <MythButton
          className={CN('action-button link-myth-button')}
          onClick={linkingWithMythAccount}
        >
          {t('Link your mythical account')}
        </MythButton>

        <MythButton
          className={CN('action-button continue-telegram-button')}
          onClick={continueWithTelegram}
        >
          {t('Continue with telegram')}
        </MythButton>

        <div className='or-text'>
          or
        </div>

        <MythButton
          className={CN('action-button create-myth-button')}
          onClick={linkingWithMythAccount}
        >
          {t('Create your Mythical account')}
        </MythButton>
      </div>
    </div>
  );
};

const Login = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    backgroundColor: extendToken.mythColorDark,
    height: '100%',
    paddingBottom: 28,
    overflow: 'auto',

    '.logo-area': {
      height: 283,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url(/images/mythical/login/logo-area-background.png)',
      backgroundSize: '100% 100%',
      backgroundPosition: 'left top',
      backgroundRepeat: 'no-repeat',
      // filter: 'drop-shadow(1.57px 1.57px 0px #000)',
      marginBottom: 34
    },

    '.logo': {
      display: 'block',
      maxWidth: 200,
      flex: 1,
      height: 'auto'
    },

    '.content-area': {
      paddingLeft: 16,
      paddingRight: 16
    },

    '.welcome-text': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '32px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '40px',
      textTransform: 'uppercase',
      marginBottom: 16
    },

    '.sub-content-text': {
      paddingLeft: 52,
      paddingRight: 52,
      color: extendToken.mythColorGray1,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      marginBottom: 16
    },

    '.or-text': {
      color: extendToken.mythColorGray2,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '20px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '22px',
      textTransform: 'uppercase',
      marginBottom: 11
    },

    '.action-button': {
      width: '100%',
      height: 52,

      '.__button-content': {
        fontSize: 22,
        lineHeight: '24px'
      },

      '.__button-background': {
        // filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/login/button-mask.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.link-myth-button': {
      marginBottom: 11,

      '.__button-background:before': {
        backgroundColor: token.colorPrimary
      }
    },

    '.continue-telegram-button': {
      marginBottom: 11,

      '.__button-background:before': {
        backgroundColor: token.colorWhite
      }
    },

    '.create-myth-button': {
      marginBottom: 4,

      '.__button-content': {
        color: token.colorWhite
      },

      '.__button-background:before': {
        backgroundImage: 'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.20) 100%), linear-gradient(75deg, rgba(54, 53, 53, 0.32) 25.94%, rgba(25, 25, 25, 0.32) 63.11%)'
      }
    }
  };
});

export default Login;
