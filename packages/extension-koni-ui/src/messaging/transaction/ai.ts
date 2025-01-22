// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestGetAiTransactionHistory, ResponseGetAiTransactionHistory } from '@subwallet/extension-base/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function getAiTransactionHistories (request: RequestGetAiTransactionHistory): Promise<ResponseGetAiTransactionHistory> {
  return sendMessage('pri(ai.transaction.histories)', request);
}
