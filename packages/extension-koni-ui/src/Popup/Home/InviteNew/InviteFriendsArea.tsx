// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CopyIcon, MythButton, UsersIcon } from '@subwallet/extension-koni-ui/components/Mythical';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div
      className={className}
    >
      <div className='__area-title'>
        {t('Invite friends and play together')}
      </div>
      <div className='__area-content'>
        {t('Create your own community and play together')}
      </div>

      <div className='__area-buttons'>
        <MythButton
          className={CN('__button __copy-button')}
          icon={(
            <span className={'__button-icon'}>
              <CopyIcon />
            </span>
          )}
        >
          {t('Copy link')}
        </MythButton>

        <MythButton
          className={CN('__button __invite-button')}
          icon={(
            <span className={'__button-icon'}>
              <UsersIcon />
            </span>
          )}
        >
          {t('Invite now')}
        </MythButton>
      </div>
    </div>
  );
};

export const InviteFriendsArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    backgroundImage: 'url(/images/mythical/invite/invite-friends-area-background.png)',
    backgroundPosition: '0 0',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'calc(100% - 3px) 100%',
    filter: 'drop-shadow(4px 6px 0px #000)',
    minHeight: 158,

    '.__area-title': {
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '24px',
      letterSpacing: '-0.48px',
      textTransform: 'uppercase',
      color: token.colorWhite,
      marginBottom: 4
    },

    '.__area-content': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      color: extendToken.mythColorGray1,
      marginBottom: 20
    },

    '.__area-buttons': {
      display: 'flex',
      gap: 8
    },

    '.__button': {
      flex: 1,
      minWidth: 117,
      height: 40,
      paddingLeft: 12,
      paddingRight: 10,
      color: extendToken.mythColorDark,

      '.__button-icon': {
        fontSize: 20
      },

      '.__button-inner': {
        gap: 6
      },

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/invite/button-background.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__copy-button': {
      '.__button-background:before': {
        backgroundColor: token.colorWhite
      }
    },

    '.__invite-button': {
      '.__button-background:before': {
        backgroundColor: token.colorPrimary
      }
    }
  };
});
