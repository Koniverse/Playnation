// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestTransfer } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';

export interface AiTransactionData {
  type: 'transfer' | 'unknown';
  data?: any;
}

const transformTransferData = (message: string): AiTransactionData => {
  const transferPattern = /\n- Recipient Address:\s*(0x[0-9a-fA-F]{40})\n- Amount:\s*([\d.]+)\s*IP/;

  const transferMatch = message.match(transferPattern);

  if (!transferMatch) {
    return {
      type: 'unknown'
    };
  }

  const recipientAddress = transferMatch[1];
  const amount = transferMatch[2];

  const data: Omit<RequestTransfer, 'from'> = {
    value: BigN(amount).shiftedBy(18).toFixed(0),
    to: recipientAddress,
    networkKey: 'storyOdyssey_testnet',
    tokenSlug: 'storyOdyssey_testnet-NATIVE-IP'
  };

  return {
    type: 'transfer',
    data
  };
};

export const transformAiMessageData = (message: string): AiTransactionData => {
  const firstLine = message.split('\n')[0];
  const isConfirmation = firstLine.startsWith('## IP') && firstLine.includes('confirmation');

  if (isConfirmation) {
    const isTransfer = message.includes('transfer');

    if (isTransfer) {
      return transformTransferData(message);
    } else {
      return {
        type: 'unknown'
      };
    }
  } else {
    return {
      type: 'unknown'
    };
  }
};
