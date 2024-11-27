// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LockIcon } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type CheckInItemType = {
  id: number;
  label: string;
  point: number;
  state: 'AVAILABLE' | 'LOCKED' | 'CHECKED'
};

type Props = ThemeProps & CheckInItemType;

const Component = ({ className,
  label,
  point,
  state }: Props): React.ReactElement => {
  return (
    <div className={CN(className, {
      '-available': state === 'AVAILABLE',
      '-locked': state === 'LOCKED',
      '-checked': state === 'CHECKED'
    })}
    >
      {
        state === 'CHECKED' && (
          <div className={'__check-icon'}></div>
        )
      }

      <div className='__label-wrapper'>
        {
          state === 'LOCKED' && (
            <LockIcon className={'__lock-icon'} />
          )
        }

        <div className='__label'>
          {label}
        </div>
      </div>

      <div className='__point'>
        {toDisplayNumber(point)}
      </div>
    </div>
  );
};

export const CheckInItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    minHeight: 70,
    paddingTop: 12,
    position: 'relative',

    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      // filter: 'drop-shadow(1.373px 1.373px 0px #000)',
      inset: 0
    },

    '.__check-icon': {
      width: 24,
      height: 24,
      position: 'absolute',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      // filter: 'drop-shadow(1.197px 1.197px 0px #000)',
      backgroundImage: 'url(/images/mythical/check-icon.png)',
      top: -7,
      right: -5
    },

    '.__label-wrapper': {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginBottom: 4,
      position: 'relative',
      zIndex: 1,
      gap: 2
    },

    '.__lock-icon': {
      fontsize: 14
    },

    '.__label': {
      textAlign: 'center',
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px'
    },

    '.__point': {
      position: 'relative',
      zIndex: 1,
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 700,
      lineHeight: '24px',
      letterSpacing: '-0.48px',
      textTransform: 'uppercase'
    },

    '&.-available, &.-locked': {
      '&:before': {
        backgroundImage: 'url(/images/mythical/daily-rewards/unclaimed.png)'
      },

      '.__label-wrapper': {
        color: extendToken.mythColorGray1
      },

      '.__point': {
        color: extendToken.mythColorGray1
      }

    },

    '&.-available': {

    },

    '&.-locked': {
      '&:before': {
        opacity: 0.32
      }
    },

    '&.-checked': {
      '&:before': {
        backgroundImage: 'url(/images/mythical/daily-rewards/claimed.png)'
      },

      '.__label-wrapper': {
        color: token.colorWhite,
        opacity: 0.72
      },

      '.__point': {
        color: token.colorWhite,
        opacity: 0.7
      }
    }
  };
});
