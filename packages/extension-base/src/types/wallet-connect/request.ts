// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface RequestWCSendMessageRequest {
  address: string;
  method: string;
  payload: unknown;
  chainId: number;
}

export interface ResponseWCSendMessageRequest {
  signature: string;
}
