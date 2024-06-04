// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GAME_API_HOST } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  avatarPath?: string;
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  hasBoxShadow?: boolean;
  isPlaceholder?: boolean;
};

function Component ({ avatarPath, className, hasBoxShadow, isPlaceholder, size = 1 }: Props) {
  const avatarUrl = (() => {
    if (avatarPath) {
      return `${GAME_API_HOST}/${avatarPath}`;
    }

    return '/images/games/default-avatar.png';
  })();

  return (
    <div className={CN(className, `-size-${size}`, {
      '-has-box-shadow': hasBoxShadow
    })}
    >
      <div className='__inner'>
        {
          isPlaceholder
            ? (
              <div className={'__avatar-image -placeholder'} />
            )
            : (
              <img
                alt={'avatar'}
                className={'__avatar-image'}
                src={avatarUrl}
              />
            )
        }
      </div>
    </div>
  );
}

export const GameAccountAvatar = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    borderStyle: 'solid',
    borderColor: `${token.colorBgBorder}`,
    borderRadius: '100%',

    '&.-has-box-shadow': {
      boxShadow: '2px 4px 0px 0px rgba(31, 31, 35, 0.40)'
    },

    '.__inner': {
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: token.colorWhite,
      borderRadius: '100%',
      height: '100%'
    },

    '.__avatar-image': {
      borderStyle: 'solid',
      borderColor: `${token.colorBgBorder}`,
      display: 'block',
      borderRadius: '100%',
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },

    '.__avatar-image.-placeholder': {
      backgroundColor: extendToken.colorBgTranslucent
    },

    '&.-size-1': {
      borderWidth: 1,
      width: 28,
      height: 28,
      minWidth: 28,

      '.__inner': {
        borderWidth: 2
      },

      '.__avatar-image': {
        borderWidth: 1
      }
    },

    '&.-size-2': {
      borderWidth: 1,
      width: 32,
      height: 32,
      minWidth: 32,

      '.__inner': {
        borderWidth: 3
      },

      '.__avatar-image': {
        borderWidth: 1
      }
    },

    '&.-size-3': {
      borderWidth: 1,
      width: 40,
      height: 40,
      minWidth: 40,

      '.__inner': {
        borderWidth: 3
      },

      '.__avatar-image': {
        borderWidth: 1
      }
    },

    '&.-size-4': {
      borderWidth: 2,
      width: 48,
      height: 48,
      minWidth: 48,

      '.__inner': {
        borderWidth: 4
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    },

    '&.-size-5': {
      borderWidth: 2,
      width: 80,
      height: 80,
      minWidth: 80,

      '.__inner': {
        borderWidth: 6
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    },

    '&.-size-6': {
      borderWidth: 2,
      width: 104,
      height: 104,
      minWidth: 104,

      '.__inner': {
        borderWidth: 8
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    },

    '&.-size-7': {
      borderWidth: 2,
      width: 112,
      height: 112,
      minWidth: 112,

      '.__inner': {
        borderWidth: 8
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    }
  });
});

export default GameAccountAvatar;
