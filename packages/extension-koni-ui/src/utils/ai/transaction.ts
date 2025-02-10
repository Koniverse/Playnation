// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestTransfer } from '@subwallet/extension-base/types';
import { IpAssetParams } from '@subwallet/extension-koni-ui/connector/booka/types';
import BigN from 'bignumber.js';

export interface AiTransactionData {
  type: 'transfer' | 'mint' | 'unknown';
  data?: any;
}

const transformTransferData = (message: string): AiTransactionData => {
  const defaultResult: AiTransactionData = {
    type: 'unknown'
  };

  const jsonMatch = message.match(/```json([\s\S]*?)```/)?.[1]?.trim();

  if (!jsonMatch) {
    return defaultResult;
  }

  try {
    const jsonObject = JSON.parse(jsonMatch) as {
      recipient_address: string,
      amount: number
    };

    const recipientAddress = jsonObject?.recipient_address;
    const amount = jsonObject?.amount;

    if (!recipientAddress || typeof amount === undefined) {
      return defaultResult;
    }

    const data: Omit<RequestTransfer, 'from'> = {
      value: BigN(amount).shiftedBy(18).toFixed(0),
      to: recipientAddress,
      networkKey: 'storyOdyssey_testnet',
      tokenSlug: 'storyOdyssey_testnet-NATIVE-IP',
      ignoreWarnings: []
    };

    return {
      type: 'transfer',
      data
    };
  } catch (e) {
    return defaultResult;
  }
};

const transformMintData = (message: string): AiTransactionData => {
  const defaultResult: AiTransactionData = {
    type: 'unknown'
  };

  const jsonMatch = message.match(/```json([\s\S]*?)```/)?.[1]?.trim();

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
    return defaultResult;
  }
};

export const transformAiMessageData = (message: string): AiTransactionData => {
  const isConfirmation = message.split('\n').some((line) => line.startsWith('## IP') && line.includes('confirmation'));

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
