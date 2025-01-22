// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AmountData, AmountDataWithId, RequestFreeBalance } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionBrief } from '@subwallet/extension-base/services/transaction-service/types';
import { RequestSubscribeTransactionById } from '@subwallet/extension-base/types';

import { sendMessage } from '../base';

export async function getFreeBalance (request: RequestFreeBalance): Promise<AmountData> {
  return sendMessage('pri(freeBalance.get)', request);
}

export async function subscribeFreeBalance (request: RequestFreeBalance, callback: (balance: AmountDataWithId) => void): Promise<AmountDataWithId> {
  return sendMessage('pri(freeBalance.subscribe)', request, callback);
}

export async function subscribeTransactionById (request: RequestSubscribeTransactionById, callback: (data: SWTransactionBrief) => void): Promise<SWTransactionBrief> {
  return sendMessage('pri(transactions.subscribe.one)', request, callback);
}
