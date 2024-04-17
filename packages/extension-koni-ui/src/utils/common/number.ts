// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import { balanceFormatter, formatNumber } from '@subwallet/react-ui';
import BigN from 'bignumber.js';

export const formatBalance = (value: string | number | BigN, decimals: number) => {
  return formatNumber(value, decimals, balanceFormatter);
};

export const formatAmount = (amountData?: AmountData): string => {
  if (!amountData) {
    return '';
  }

  const { decimals, symbol, value } = amountData;
  const displayValue = formatBalance(value, decimals);

  return `${displayValue} ${symbol}`;
};

export function formatInteger (num?: number): string {
  if (num === undefined) {
    return '';
  }

  return num.toLocaleString('de-DE');
}

export function formatIntegerShort (num?: number): string {
  if (num === undefined) {
    return '';
  }

  if (num >= 100000) {
    return '100.000+';
  } else {
    return formatInteger(num);
  }
}
