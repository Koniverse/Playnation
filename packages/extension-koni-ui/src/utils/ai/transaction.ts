// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _getAssetDecimals, _parseAssetRefKey } from '@subwallet/extension-base/services/chain-service/utils';
import { RequestTransfer, SwapRequest } from '@subwallet/extension-base/types';
import { IpAssetParams } from '@subwallet/extension-koni-ui/connector/booka/types';
import { AssetRegistryStore } from '@subwallet/extension-koni-ui/stores/types';
import BigN from 'bignumber.js';

export interface AiTransactionData {
  type: 'transfer' | 'mint' | 'unknown' | 'swap';
  data?: any;
}

export interface SwapAiRequest extends SwapRequest{
  isTestnet: boolean;
}

const USDT_STORY_TOKEN_SLUG = 'story_protocol-ERC20-USDT-0x674843C06FF83502ddb4D37c2E09C01cdA38cbc8';
const USDC_STORY_TOKEN_SLUG = 'story_protocol-ERC20-USDC-0xF1815bd50389c46847f0Bda824eC8da914045D14';
const PIP_TOKEN_SLUG = 'storyOdyssey_testnet-ERC20-PIP-0x6e990040Fd9b06F98eFb62A147201696941680b5';
const IP_MAINNET_TOKEN_SLUG = 'story_protocol-NATIVE-IP';
const IP_TESTNET_TOKEN_SLUG = 'storyOdyssey_testnet-NATIVE-IP';

const TOKEN_SWAP_TESTNET = [PIP_TOKEN_SLUG, IP_TESTNET_TOKEN_SLUG];

export interface SwapAiResponse {
  amount: number;
  slippage_tolerance: string;
  token_to_receive: string;
  token_to_swap: string;
}

const getTokenSlugBySymbol = (symbol: string, isTestnet = false): string | undefined => {
  switch (symbol) {
    case 'USDT':
      return USDT_STORY_TOKEN_SLUG;
    case 'USDC':
      return USDC_STORY_TOKEN_SLUG;
    case 'PIP':
      return PIP_TOKEN_SLUG;
    case 'IP':
      return isTestnet ? IP_TESTNET_TOKEN_SLUG : IP_MAINNET_TOKEN_SLUG;
    default:
      return undefined;
  }
};

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
      networkKey: 'story_protocol',
      tokenSlug: 'story_protocol-NATIVE-IP',
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

const transformSwapData = (message: string, assetRegistryMap: AssetRegistryStore['assetRegistry']): AiTransactionData => {
  const defaultResult: AiTransactionData = {
    type: 'unknown'
  };

  const jsonMatch = message.match(/```json([\s\S]*?)```/)?.[1]?.trim();

  if (!jsonMatch) {
    return defaultResult;
  }

  try {
    const jsonObject = JSON.parse(jsonMatch) as SwapAiResponse;

    const tokenTo = getTokenSlugBySymbol(jsonObject?.token_to_receive);
    const isTestnet = TOKEN_SWAP_TESTNET.includes(tokenTo || '');
    const tokenFrom = getTokenSlugBySymbol(jsonObject?.token_to_swap, isTestnet);
    const amount = jsonObject?.amount;
    const slippageTolerance = jsonObject?.slippage_tolerance;

    if (!tokenFrom || !tokenTo || typeof amount === undefined || !slippageTolerance) {
      return defaultResult;
    }

    const chainAsset = assetRegistryMap[tokenFrom];
    const decimals = _getAssetDecimals(chainAsset);

    const data: Omit<SwapAiRequest, 'address'> = {
      pair: {
        slug: _parseAssetRefKey(tokenFrom, tokenTo),
        from: tokenFrom,
        to: tokenTo
      },
      fromAmount: new BigN(amount).shiftedBy(decimals).toString(),
      slippage: (Number.parseInt(slippageTolerance)) / 100,
      recipient: undefined,
      isTestnet
    };

    return {
      type: 'swap',
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

export const transformAiMessageData = (message: string, assetRegistryMap: AssetRegistryStore['assetRegistry']): AiTransactionData => {
  const isConfirmation = message.split('\n').some((line) => (line.startsWith('## IP') || line.startsWith('## Swap')) && line.includes('confirmation'));

  if (isConfirmation) {
    // is transfer
    if (message.includes('transfer')) {
      return transformTransferData(message);
      // is minting
    } else if (message.includes('asset minting')) {
      return transformMintData(message);
    } else if (message.includes('swap')) {
      return transformSwapData(message, assetRegistryMap);
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
