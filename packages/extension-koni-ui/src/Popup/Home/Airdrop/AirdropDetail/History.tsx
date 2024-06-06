// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropHistoryItem } from '@subwallet/extension-koni-ui/components';
import {  AirdropRewardHistoryLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropHistory: AirdropRewardHistoryLog | null;
};
function Component ({airdropHistory, className }: Props) {
  const { t } = useTranslation();
console.log(airdropHistory)
  const mockItems: AirdropRewardHistoryLog[] = [
    {
      status: 'PENDING',
      type: 'TOKEN',
      rewardValue: 200,
      endTime: new Date().toString(),
      name: 'Top 500 Leaderboard',
      id: 1
    },
    {
      status: 'RECEIVED',
      type: 'NPS',
      rewardValue: 200,
      endTime: new Date().toString(),
      name: 'Top 1000 Leaderboard',
      id: 2
    },
    {
      status: 'RECEIVED',
      type: 'NPS',
      rewardValue: 200,
      endTime: new Date().toString(),
      name: 'Invited 100 persons',
      id: 3
    },
    {
      status: 'MISSED',
      type: 'NPS',
      rewardValue: 200,
      endTime: new Date().toString(),
      name: 'Follow Playnation’s discord',
      id: 4
    }
  ];

  return (
    <div className={CN(className)}>
      <div className='__reward-history-title'>
        {t('Rewards history')}
      </div>

      <div className='__history-area'>
        {
          mockItems.map((item) => (
            <AirdropHistoryItem
              className={'__history-item'}
              item={item}
              key={item.id}
            />
          ))
        }
      </div>
    </div>
  );
}

export const AirdropDetailHistory = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    marginBottom: token.margin,

    '.__reward-history-title': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: token.padding,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1
    },

    '.__history-item': {
      marginBottom: token.marginXXS
    }
  });
});
