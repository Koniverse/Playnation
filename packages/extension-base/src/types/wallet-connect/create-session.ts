// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface SessionConnectStatus {
  isDone: boolean;
  approveAddress: string;
  errorMessage: string;
}

export type RequestWalletConnectCreateSession = null;

export interface ResponseWalletConnectCreateSession {
  uri: string;
  id: string;
}

export type RequestWalletConnectGetSessionPromise = string;

export type ResponseWalletConnectGetSessionPromise = SessionConnectStatus;

export type RequestWalletConnectCancelSessionPromise = string;

export type ResponseWalletConnectCancelSessionPromise = boolean;
