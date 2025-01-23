// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestTransfer } from '@subwallet/extension-base/background/KoniTypes';
import { IpAssetParams } from '@subwallet/extension-koni-ui/connector/booka/types';
import BigN from 'bignumber.js';

export interface AiTransactionData {
  type: 'transfer' | 'mint' | 'unknown';
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
    tokenSlug: 'storyOdyssey_testnet-NATIVE-IP',
    ignoreWarnings: true
  };

  return {
    type: 'transfer',
    data
  };
};

const transformMintData = (message: string): AiTransactionData => {
  const jsonMatch = message.match(/```json([\s\S]*?)```/)?.[1]?.trim();

  const defaultResult: AiTransactionData = {
    type: 'unknown'
  };

  if (!jsonMatch) {
    return defaultResult;
  }

  try {
    const jsonObject = JSON.parse(jsonMatch) as {
      name: string,
      description?: string,
      asset_link: string
    };

    if (!jsonObject?.name || !jsonObject?.asset_link) {
      return defaultResult;
    }

    const data: IpAssetParams = {
      name: jsonObject.name,
      description: jsonObject.description || '',
      assetUrl: jsonObject.asset_link
    };

    return {
      type: 'mint',
      data
    };
  } catch (e) {
    return {
      type: 'unknown'
    };
  }
};

export const transformAiMessageData = (message: string): AiTransactionData => {
  const firstLine = message.split('\n')[0];
  const isConfirmation = firstLine.startsWith('## IP') && firstLine.includes('confirmation');

  if (isConfirmation) {
    // is transfer
    if (message.includes('transfer')) {
      return transformTransferData(message);
      // is minting
    } else if (message.includes('asset minting')) {
      return transformMintData(message);
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
