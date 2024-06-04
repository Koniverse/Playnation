// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountAvatar, GamePoint } from '@subwallet/extension-koni-ui/components';
import { LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  isFirst?: boolean;
  leaderboardInfo?: LeaderboardPerson;
  isPlaceholder?: boolean;
  rank?: number;
};

const Component = ({ className, isFirst, isPlaceholder, leaderboardInfo, rank }: Props): React.ReactElement => {
  const accountName = (() => {
    if (isPlaceholder) {
      return '------';
    }

    return `${leaderboardInfo?.accountInfo.firstName || ''} ${leaderboardInfo?.accountInfo.lastName || ''}`;
  })();

  const point = (() => {
    if (isPlaceholder) {
      return '---';
    }

    return formatIntegerShort(leaderboardInfo?.point);
  })();

  return (
    <div className={CN(
      className, {
        '-is-first': isFirst
      })}
    >
      <div className={'__rank'}>
        {rank || leaderboardInfo?.rank}
      </div>

      <GameAccountAvatar
        avatarPath={leaderboardInfo?.accountInfo.avatar}
        className={'__avatar'}
        hasBoxShadow
        isPlaceholder={isPlaceholder}
        size={isFirst ? 7 : 5}
      />

      <div className={'__account-name'}>
        {accountName}
      </div>
      <GamePoint
        className={'__point'}
        point={point}
      />
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
      justifyContent: 'center'
    }
  };
});
