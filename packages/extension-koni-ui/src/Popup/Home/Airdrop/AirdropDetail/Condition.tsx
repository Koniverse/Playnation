// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropInfo: AirdropCampaign
};

function Component ({ airdropInfo, className }: Props) {
  // @ts-ignore
  const { t } = useTranslation();

  return (
    <div className={CN(className)}>
      {
        airdropInfo.eligibilityList.map((item) => (
          <div
            className={'__eligibility-item'}
            key={item.name}
          >
            <div className='__eligibility-item-name'>
              {item.name}
            </div>

            <div className='__eligibility-item-line'>
              <div className='__eligibility-item-line-label'>{t('Time')}</div>
              <div className='__eligibility-item-line-value __eligibility-item-date'>
                <span>{item.start ? customFormatDate(item.start, '#DD# #MMM#') : '__'}</span>
                <span>-</span>
                <span>{item.end ? customFormatDate(item.end, '#DD# #MMM#') : '__'}</span>
              </div>
            </div>
            <div className='__eligibility-item-line'>
              <div className='__eligibility-item-line-label'>{t('Method')}</div>
              <div className='__eligibility-item-line-value'>Raffle ({item.boxCount})</div>
            </div>

            <div className='__eligibility-item-note'>
              <span className='__eligibility-item-note-label'>{t('Note')}:</span>
              <span className='__eligibility-item-note-content'>
                {item.note || t('A player can win multiple type of rewards')}
              </span>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export const AirdropDetailCondition = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    marginBottom: token.margin,
    paddingLeft: token.padding,
    paddingRight: token.padding,

    '.__eligibility-item + .__eligibility-item:before': {
      content: '""',
      display: 'block',
      height: 1,
      backgroundColor: token.colorBgDivider,
      marginLeft: token.marginXS,
      marginRight: token.marginXS,
      marginBottom: token.marginSM,
      marginTop: token.marginSM
    },

    '.__eligibility-item-name': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      marginBottom: token.marginSM
    },

    '.__eligibility-item-line': {
      display: 'flex',
      gap: token.sizeXS,
      alignItems: 'center',
      marginBottom: token.marginXS
    },

    '.__eligibility-item-line-label': {
      lineHeight: '22px',
      borderRadius: 12,
      backgroundColor: token.colorPrimary,
      fontWeight: token.headingFontWeight,
      minWidth: 56,
      fontSize: 10,
      textAlign: 'center'
    },

    '.__eligibility-item-note-label': {
      marginRight: token.marginXXS,
      fontWeight: token.headingFontWeight
    },

    '.__eligibility-item-date': {
      display: 'flex',
      gap: token.sizeXXS
    }
  });
});
