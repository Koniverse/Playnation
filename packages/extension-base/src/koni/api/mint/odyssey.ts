// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _STORY_NFT_ABI } from '@subwallet/extension-base/koni/api/contract-handler/utils';
import { _EvmApi } from '@subwallet/extension-base/services/chain-service/types';
import { calculateGasFeeParams } from '@subwallet/extension-base/services/fee-service/utils';
import { TransactionConfig } from 'web3-core';
import { ContractSendMethod } from 'web3-eth-contract';

const contractAddress = '0xdff4f6ddafa4b9b1deea1bf74227befd5c833844';

export const createMintOdysseyNft = async (web3Api: _EvmApi, address: string, signature: string): Promise<TransactionConfig> => {
  const contract = new web3Api.api.eth.Contract(_STORY_NFT_ABI, contractAddress);
  const chain = web3Api.chainSlug;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  const mint = contract.methods.mint(address, signature) as ContractSendMethod;

  const [gasLimit, priority] = await Promise.all([
    // mint.estimateGas({ from: address }),
    // TODO: Recheck this
    Promise.resolve('1306543'),
    calculateGasFeeParams(web3Api, chain)
  ]);

  return {
    from: address,
    gasPrice: priority.gasPrice,
    maxFeePerGas: priority.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: priority.maxPriorityFeePerGas?.toString(),
    gas: gasLimit,
    to: contractAddress,
    value: '0x00',
    data: mint.encodeABI()
  };
};
