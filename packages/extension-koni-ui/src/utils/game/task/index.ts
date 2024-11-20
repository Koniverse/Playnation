// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { remarkWithEvent } from '@subwallet/extension-koni-ui/messaging/transaction/remark';

export async function actionTaskOnChain (type: string, networkKey: string, address: string, data: any): Promise<SWTransactionResponse | null> {
  if (type === 'attendance') {
    return sendRemarkWithEvent(address, networkKey, data);
  }

  return Promise.resolve(null);
}

export async function sendRemarkWithEvent (address: string, networkKey: string, data: any): Promise<SWTransactionResponse> {
  return new Promise((resolve) => {
    const sendPromise = remarkWithEvent({
      address,
      networkKey: networkKey,
      dataRemark: JSON.stringify(data)
    });

    setTimeout(() => {
      // Handle transfer action
      sendPromise
        .then((res) => {
          resolve(res);
        }).catch((err) => {
          console.error('sendRemarkWithEvent', err);
        });
    }, 100);
  });
}
