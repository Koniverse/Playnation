// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  name?: string;
  prefix?: string;
  point?: number;
  avatarSrc?: string;
  isMine?: boolean;
};

function Component ({ avatarSrc, className, isMine, name, point, prefix }: Props) {
  const { t } = useTranslation();

  return (
    <div className={CN(className, {
      '-is-mine': isMine,
      '-has-prefix': !!prefix
    })}
    >
      <div className='__inner'>
        {prefix && <div className={'__prefix'}>{prefix}</div>}
        <img
          alt={'avatar'}
          className={'__avatar'}
          src={avatarSrc || ''}
        />
        <div className={'__name'}>{name}</div>
        {
          isMine && (
            <div className={'__mine-flag'}>
              {t('You')}
            </div>
          )
        }
        <div className={'__point'}>
          {toDisplayNumber(point)}
        </div>
      </div>

      <div className='__background-layer'></div>
    </div>
  );
}

const GameAccountItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    minHeight: 54,
    position: 'relative',

    '.__inner': {
      paddingTop: 4,
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 24,
      paddingRight: 23
    },

    '.__background-layer': {
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      filter: 'drop-shadow(2px 2px 0px #000)',

      '&:before': {
        content: '""',
        display: 'block',
        backgroundImage: 'linear-gradient(75deg, rgba(54, 53, 53, 1) 25.94%, rgba(25, 25, 25, 1) 63.11%)',
        maskImage: 'url(/images/mythical/game-account-item-background.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left',
        backdropFilter: 'blur(16px)',
        position: 'absolute',
        inset: 0
      }
    },

    '.__prefix': {
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      color: extendToken.mythColorGray1,
      minWidth: 46
    },

    '.__avatar': {
      marginRight: 12,
      width: 44,
      height: 44,
      borderRadius: '100%'
    },

    '.__name': {
      flex: 1,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      'white-space': 'nowrap',
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '20px',
      letterSpacing: '0.32px'
    },

    '.__point': {
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '24px',
      letterSpacing: '-0.48px',
      color: extendToken.mythColorGray1,
      marginLeft: 15
    },

    '.__mine-flag': {
      borderRadius: 100,
      backgroundImage: 'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.20) 100%)',
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      padding: '4px 12px',
      color: token.colorWhite,
      marginLeft: 2
    },

    '&.-has-prefix': {
      '.__inner': {
        paddingLeft: 16
      }
    },

    '&.-is-mine': {
      '.__background-layer:before': {
        backgroundImage: 'linear-gradient(270deg, rgba(255, 255, 255, 0.00) 0%, rgba(255, 255, 255, 0.2) 100%), linear-gradient(75deg, rgba(54, 53, 53, 1) 25.94%, rgba(25, 25, 25, 1) 63.11%)'
      },

      '.__point': {
        color: token.colorPrimary
      }
    }
  });
});

export default GameAccountItem;
