// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { Skeleton } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type TopAccountItemType = {
  isFirst?: boolean;
  rank: number;
  point?: number;
  name?: string;
  avatarSrc?: string;
  tokenValue?: number;
}

type Props = ThemeProps & TopAccountItemType & {
  isLoading?: boolean
};

const Component = ({ avatarSrc, className, isFirst, isLoading, name = '---', point = 0, rank, tokenValue = 0 }: Props): React.ReactElement => {
  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      {isLoading
        ? (
          <div className={'__avatar-wrapper'}>
            <Skeleton.Avatar
              active={true}
              className={'__avatar-image-skeleton'}
              shape={'circle'}
            />
          </div>
        )
        : (
          <GameAccountAvatar
            avatarSrc={avatarSrc}
            className={'__avatar-wrapper'}
            isPlaceholder={isLoading}
            partNode={(
              <div className='__rank'>
                {rank}
              </div>
            )}
          />
        )
      }

      <div className={CN('__account-name')}>
        {isLoading
          ? (
            <Skeleton.Input
              active={true}
              className={'__skeleton-content'}
            />
          )
          : name}
      </div>

      <div className='__point'>
        {isLoading
          ? (
            <Skeleton.Input
              active={true}
              className={'__skeleton-content'}
            />
          )
          : `${toDisplayNumber(point)}`}
      </div>

      <div className='__token-value-wrapper'>
        {isLoading
          ? (
            <Skeleton.Input
              active={true}
              className={'__token-value-skeleton'}
            />
          )
          : (
            <div className='__token-value'>
              {`+${toDisplayNumber(tokenValue)} Myth`}
            </div>
          )}
      </div>

    </div>
  );
};

const TopAccountItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__avatar-wrapper': {
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      width: 'fit-content',
      marginBottom: 4
    },

    '.__avatar-image': {
      borderRadius: '100%'
    },

    '.__rank': {
      borderRadius: '100%',
      backgroundColor: token.colorPrimary,
      fontFamily: extendToken.fontBarlowCondensed,
      fontWeight: 600,
      fontSize: '14px',
      lineHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: 0,
      top: 0
    },

    '.ant-skeleton.ant-skeleton.ant-skeleton .ant-skeleton-input': {
      width: '100%',
      minWidth: 0
    },

    '.__skeleton-content.ant-skeleton.ant-skeleton': {
      width: '100%',

      '.ant-skeleton-input': {
        height: '100%',
        lineHeight: 'inherit',
        borderRadius: 32
      }
    },

    '.__account-name': {
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontWeight: 500,
      color: token.colorWhite,
      marginBottom: 3
    },

    '.__point': {
      color: token.colorPrimary,
      textAlign: 'center',
      fontFamily: extendToken.fontDruk,
      fontStyle: 'italic',
      fontWeight: 500,
      marginBottom: 6
    },

    '.__token-value-wrapper': {
      display: 'flex',
      justifyContent: 'center'
    },

    '.__token-value': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: '0.28px',
      borderRadius: 100,
      backgroundImage: 'linear-gradient(75deg, #363535 25.94%, #191919 63.11%)',
      padding: '4px 12px'
    },

    '.__token-value-skeleton.__token-value-skeleton.__token-value-skeleton.__token-value-skeleton': {
      height: 16,
      width: 70,
      borderRadius: 100,
      lineHeight: 'inherit'
    },

    '&:not(.-is-first)': {
      '.__avatar-wrapper': {
        paddingTop: 3.5
      },

      '.__rank': {
        width: 18,
        height: 18,
        fontSize: '12px',
        lineHeight: '16px'
      },

      '.__avatar-image, .__avatar-image-skeleton .ant-skeleton-avatar': {
        width: 57,
        height: 57
      },

      '.__account-name': {
        fontSize: '14px',
        lineHeight: '16px',
        letterSpacing: '0.28px',

        '.__skeleton-content': {
          height: 16
        }
      },

      '.__point': {
        fontSize: '16px',
        lineHeight: '18px',
        letterSpacing: '-0.16px',

        '.__skeleton-content': {
          height: 18
        }
      }
    },

    '&.-is-first': {
      '.__avatar-wrapper': {
        paddingTop: 3
      },

      '.__rank': {
        width: 24,
        height: 24,
        fontSize: '14px',
        lineHeight: '20px'
      },

      '.__avatar-image, .__avatar-image-skeleton .ant-skeleton-avatar': {
        width: 74,
        height: 74
      },

      '.__account-name': {
        fontSize: '16px',
        lineHeight: '20px',
        letterSpacing: '0.32px',

        '.__skeleton-content': {
          height: 20
        }
      },

      '.__point': {
        fontSize: '20px',
        lineHeight: '22px',
        letterSpacing: '-0.6px',

        '.__skeleton-content': {
          height: 22
        }
      }
    }
  };
});

export default TopAccountItem;
