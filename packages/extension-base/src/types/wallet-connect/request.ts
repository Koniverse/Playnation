// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TransactionConfig } from 'web3-core';

import { HexString } from '@polkadot/util/types';

export interface RequestWCSignMessageRequest {
  address: string;
  method: string;
  payload: unknown;
  chainId: number;
}

export interface ResponseWCSignMessageRequest {
  signature: string;
}

export interface WalletConnectSendTransactionParams {
  from: HexString;
  to: HexString;
  value?: HexString;
  gas?: HexString;
  gasPrice?: HexString;
  maxPriorityFeePerGas?: HexString;
  maxFeePerGas?: HexString;
  data?: HexString;
  nonce?: HexString;
  chainId?: HexString;
}

export interface RequestWCSendTransactionRequest {
  address: string;
  transaction: TransactionConfig;
  chainId: number;
}

export interface ResponseWCSendTransactionRequest {
  // Extrinsic hash
  signature: string;
}
