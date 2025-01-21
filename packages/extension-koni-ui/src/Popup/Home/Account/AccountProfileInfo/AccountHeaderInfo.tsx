// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { formatNumber } from '@subwallet/extension-base/utils';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  point: number;
  activeDays: number;
};

function Component ({ activeDays, className, point }: Props) {
  const { t } = useTranslation();

  return (
    <div className={CN(className)}>
      <div className='__account-header-left-part'>
        <div className={'__header-part-label'}>
          {t('You have')}
        </div>
        <div className={'__header-part-value'}>
          {formatNumber(point, 0)}
        </div>
        <div className={'__value-symbol'}>
          {t('Story Points (SP)')}
        </div>
      </div>
      <div className={'__part-divider'} />
      <div
        className='__account-header-right-part'
      >
        <div className='__header-part-label'>
          {t('Active day')}
        </div>
        <div className='__header-part-value'>
          {activeDays}
        </div>
        <div className='__value-symbol'>
          {t('days')}
        </div>
      </div>
    </div>
  );
}

const AccountHeaderInfo = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    borderRadius: 20,
    backgroundColor: extendToken.colorBgSecondary1,
    padding: token.padding,
    height: 101,
    display: 'flex',

    '.__account-header-right-part': {
      flex: 1,
      overflow: 'hidden'
    },

    '.__header-part-label': {
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      overflow: 'hidden',
      'white-space': 'nowrap',
      textOverflow: 'ellipsis'
    },

    '.__value-symbol': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__header-part-value': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__part-divider': {
      width: 1,
      height: '100%'
    }
  });
});

export default AccountHeaderInfo;
