// [object Object]
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { remarkWithEvent } from '@subwallet/extension-koni-ui/messaging/transaction/remark';

export async function actionTaskOnChain (type: string, networkKey: string, address: string): Promise<SWTransactionResponse | null> {
  if (type === 'attendance') {
    return sendRemarkWithEvent(address, networkKey);
  }

  return Promise.resolve();
}

export async function sendRemarkWithEvent (address: string, networkKey: string): Promise<SWTransactionResponse> {
  return new Promise((resolve) => {
    const sendPromise = remarkWithEvent({
      address,
      networkKey: networkKey
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
