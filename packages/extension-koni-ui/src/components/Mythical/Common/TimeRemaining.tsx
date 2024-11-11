// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getTimeRemaining } from '@subwallet/extension-koni-ui/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ClockIcon } from '../Icon';

type Props = ThemeProps & {
  endTime: string;
};

const apiSDK = BookaSdk.instance;

const Component = ({ className,
  endTime }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [dateTime, setDateTime] = useState<string>('---');

  useEffect(() => {
    const serverTimeSubject = apiSDK.subscribeServerTime();

    const updateDateTime = () => {
      setDateTime(getTimeRemaining(serverTimeSubject.value, endTime));
    };

    updateDateTime();

    const timeSub = serverTimeSubject.subscribe(() => {
      updateDateTime();
    });

    return () => {
      timeSub.unsubscribe();
    };
  }, [endTime]);

  return (
    <div
      className={className}
    >
      <div className='__title'>
        {t('Time remaining')}
      </div>

      <div className='__separator'></div>

      <ClockIcon className={'__clock-icon'} />

      <div className='__datetime'>
        {dateTime}
      </div>
    </div>
  );
};

const TimeRemaining = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    minHeight: 65,
    backgroundImage: 'url(/images/mythical/time-remaining-background.png)',
    backgroundPosition: 'center center',
    backgroundSize: '100% 100%',
    filter: 'drop-shadow(4px 6px 0px #000)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    '.__title': {
      color: token.colorSecondary,
      fontFamily: extendToken.fontDruk,
      fontSize: '24px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '24px',
      letterSpacing: '-0.48px',
      textTransform: 'uppercase',
      paddingBottom: 4
    },

    '.__separator': {
      width: 1,
      height: 18,
      backgroundColor: token.colorWhite,
      marginLeft: 12,
      marginRight: 12
    },

    '.__clock-icon': {
      width: '18px',
      height: '18px',
      marginRight: 6
    },

    '.__datetime': {
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '18px',
      fontStyle: 'normal',
      fontWeight: 500,
      lineHeight: '16px'
    }
  };
});

export default TimeRemaining;
