// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { DynamicContent } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/DynamicContent';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropInfo: AirdropCampaign
};

function Component ({ airdropInfo, className }: Props) {
  const { t } = useTranslation();

  const checkEligibility = (eligibilityId: number) => {
    if (airdropInfo && airdropInfo.eligibilityIds) {
      return airdropInfo.eligibilityIds.includes(eligibilityId);
    }

    return false;
  };

  return (
    <div className={CN(className)}>
      {airdropInfo.conditionDescription && (<DynamicContent content={airdropInfo.conditionDescription} />)}
      {
        !airdropInfo.conditionDescription && <div className={'eligibility-list'}>
          {
            airdropInfo.eligibilityList.map((item) => (
              <div
                className={'__eligibility-item'}
                key={item.name}
              >
                <div className='__eligibility-item-name'>
                  {item.name}
                  {checkEligibility(item.id) && <Icon
                    className={'background-icon -size-3 __eligibility-icon -primary-1 __current-icon'}
                    phosphorIcon={CheckCircle}
                    weight={'fill'}
                  />}
                </div>

                <div className='__eligibility-item-line'>
                  <div className='__eligibility-item-line-label'>{t('Time')}</div>
                  <div className='__eligibility-item-line-value __eligibility-item-date'>
                    <span>{item.start ? customFormatDate(item.start, '#DD# #MMM#') : '__'}</span>
                    <span>-</span>
                    <span>{item.end ? customFormatDate(item.end, '#DD# #MMM#') : '__'}</span>
                  </div>
                </div>

                <div className='__eligibility-item-note'>
                  <span className='__eligibility-item-note-label'>{t('Note')}:</span>
                  <span className='__eligibility-item-note-content'>
                    {item.note || t('A player can win multiple types of rewards')}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      }
    </div>
  );
}

export const AirdropDetailCondition = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.eligibility-list': {
      marginBottom: token.margin,
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

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
    },
    '.__eligibility-icon': {
      marginLeft: token.marginXS
    }
  });
});
