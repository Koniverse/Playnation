// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RemarkWithEvent } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';

import { sendMessage } from '../base';

export async function remarkWithEvent (request: RemarkWithEvent): Promise<SWTransactionResponse> {
  // @ts-ignore
  return sendMessage('pri(remark.remarkWithEvent)', request);
}
