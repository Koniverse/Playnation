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
  return new Promise((resolve, reject) => {
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
          reject(new Error(convertErrorMessage(err as Error, networkKey)));
        });
    }, 100);
  });
}

function convertErrorMessage (error: Error, networkKey: string): string {
  const message = error.message.toLowerCase();

  // Network error
  if (
    message.includes('connection error') ||
    message.includes('connection not open') ||
    message.includes('connection timeout') ||
    message.includes('can not active chain') ||
    message.includes('invalid json rpc')
  ) {
    return `Network ${networkKey} not enable`;
  }

  return error.message;
}
