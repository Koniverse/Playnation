// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & LeaderboardPerson & {
  isFirst?: boolean;
};

const Component = ({ accountInfo, className, isFirst, point, rank }: Props): React.ReactElement => {
  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      <div className={'__rank'}>
        {rank}
      </div>

      <GameAccountAvatar
        avatarPath={accountInfo.avatar}
        className={'__avatar'}
        hasBoxShadow
        size={isFirst ? 7 : 5}
      />

      <div className={'__account-name'}>
        {`${accountInfo.firstName || ''} ${accountInfo.lastName || ''}`}
      </div>
      <div className={'__point'}>
        {formatIntegerShort(point)}
      </div>
    </div>
  );
};

export const TopAccountItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__rank': {
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      marginBottom: token.marginXS,
      textAlign: 'center'
    },

    '.__avatar': {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: token.marginXS
    },

    '&.-is-first ': {
      '.__rank': {
        fontSize: token.fontSizeHeading4,
        lineHeight: token.lineHeightHeading4
      }
    },

    '.__account-name': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      marginBottom: token.marginXXS,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center'
    },

    '.__point': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark4,
      textAlign: 'center'
    }
  };
});
