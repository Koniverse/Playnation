// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  isLinked?: boolean;
};

const Component = ({ className, isLinked }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      {
        isLinked && (
          <div className={'__linked-account-area'}>
            <div className={'__linked-account-label'}>
              {t('Mythical Account')}
            </div>

            <div className={'__linked-account-info-card'}>
              <img
                alt='account'
                className={'__linked-account-avatar'}
                src={'/images/mythical/user-image.png'}
              />
              <div className={'__linked-account-text'}>
                <span className={'__linked-account-gmail'}>John_doe01_user@gmail.com</span>
                <span className={'__linked-account-address'}>&nbsp;(0Dew...6eB1)</span>
              </div>
            </div>
          </div>
        )
      }

      {
        !isLinked && (
          <MythButton className={'__linked-account-button __button'}>
            {t('Link mythical account')}
          </MythButton>
        )
      }

      <MythButton className={'__contact-support-button __button'}>
        {t('Contact Support')}
      </MythButton>
    </div>
  );
};

export const LinkAccountArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    paddingLeft: 16,
    paddingRight: 16,

    '.__button': {
      display: 'block',
      width: '100%',
      height: 52,

      '.__button-content': {
        color: token.colorWhite
      },

      '.__button-background': {
        filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/linked-account-button-mask.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__linked-account-button': {
      '.__button-background:before': {
        backgroundColor: extendToken.mythColorPurple
      }
    },

    '.__contact-support-button': {
      '.__button-background:before': {
        backgroundColor: extendToken.mythColorGray3
      }
    },

    '.__linked-account-button + .__contact-support-button': {
      marginTop: 12
    },

    // is linked

    '.__linked-account-area + .__contact-support-button': {
      marginTop: 20
    },

    '.__linked-account-label': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      color: extendToken.mythColorGray1,
      marginBottom: 6
    },

    '.__linked-account-info-card': {
      backgroundImage: 'url(/images/mythical/linked-account-card-background.png)',
      backgroundPosition: 'top left',
      backgroundSize: '100% 100%',
      filter: 'drop-shadow(1.251px 1.251px 0px #000)',
      display: 'flex',
      minHeight: 42,
      alignItems: 'center',
      paddingLeft: 20,
      paddingRight: 12
    },

    '.__linked-account-text': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      flex: 1,
      display: 'flex',
      overflow: 'hidden'
    },

    '.__linked-account-gmail': {
      color: token.colorWhite,
      flexShrink: 1,
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden'
    },

    '.__linked-account-address': {
      color: extendToken.mythColorGray1
    },

    '.__linked-account-avatar': {
      width: 24,
      height: 24,
      borderRadius: '100%',
      marginRight: 8
    }
  };
});
