// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropHistoryItem } from '@subwallet/extension-koni-ui/components';
import { AirdropRewardHistoryLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropHistory: AirdropRewardHistoryLog | null;
  onClaim: (airdrop_record_id: number) => void;
};
function Component({ airdropHistory, className,onClaim }: Props) {
  const { t } = useTranslation();

  // object to array
  const mockItems: AirdropRewardHistoryLog[] = Object.values(airdropHistory || {});
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
              onClaim={onClaim}
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
