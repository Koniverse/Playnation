// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

export interface AiTransactionLink {
  transactionId: string;
  aiMessageId: string;
}

export interface RequestGetAiTransactionHistory {
  aiMessageId: string;
}

export interface ResponseGetAiTransactionHistory {
  histories: AiTransactionLink[];
}
