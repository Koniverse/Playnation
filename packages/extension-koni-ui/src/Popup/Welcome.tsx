// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/accounts/new-seed-phrase');
    }, 1000);
  }, [navigate]);

  return (
    <Layout.Base
      className={CN(className)}
    >
      <div className='bg-image' />
      <div className='body-container'>
        <div className='logo-container'>
          <Image
            shape={'square'}
            src={'/images/subwallet/welcome-logo.png'}
            width={139}
          />
        </div>
        <div className='sub-title'>
          {t('Creating your wallets...')}
        </div>
      </div>
    </Layout.Base>
  );
}

const Welcome = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '.bg-image': {
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top',
      backgroundSize: 'cover',
      height: '100%',
      position: 'absolute',
      width: '100%',
      left: 0,
      top: 0
    },

    '.body-container': {
      padding: token.sizeLG,
      textAlign: 'center',
      opacity: 0.999, // Hot fix show wrong opacity in browser

      '.logo-container': {
        color: token.colorTextBase,
        width: '100%',
        marginBottom: token.marginLG
      },

      '.title': {
        fontWeight: token.fontWeightStrong,
        fontSize: token.fontSizeHeading1,
        lineHeight: token.lineHeightHeading1,
        color: token.colorTextBase
      },

      '.sub-title': {
        paddingLeft: token.padding - 1,
        paddingRight: token.padding - 1,
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5,
        color: token.colorTextLight3
      }
    },

    '.buttons-container': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeXS
    },

    '.welcome-import-button': {
      height: 'auto',

      '.welcome-import-icon': {
        height: token.sizeLG,
        width: token.sizeLG,
        marginLeft: token.sizeMD - token.size
      },

      '.welcome-import-button-content': {
        display: 'flex',
        flexDirection: 'column',
        gap: token.sizeXXS,
        fontWeight: token.fontWeightStrong,
        padding: `${token.paddingSM - 1}px ${token.paddingLG}px`,
        textAlign: 'start',

        '.welcome-import-button-title': {
          fontSize: token.fontSizeHeading5,
          lineHeight: token.lineHeightHeading5,
          color: token.colorTextBase
        },

        '.welcome-import-button-description': {
          fontSize: token.fontSizeHeading6,
          lineHeight: token.lineHeightHeading6,
          color: token.colorTextLabel
        }
      }
    }
  };
});

export default Welcome;
