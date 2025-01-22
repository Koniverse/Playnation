// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IAiTransactionItem } from '../databases';
import BaseStore from './BaseStore';

export interface AiTransactionQuery {aiMessageId?: string, transactionId?: string}

export default class AiTransactionStore extends BaseStore<IAiTransactionItem> {
  public async queryHistory (query?: AiTransactionQuery) {
    if (!query?.aiMessageId && !query?.transactionId) {
      return this.table.toArray();
    } else {
      const queryObject = {} as AiTransactionQuery;

      if (query?.aiMessageId) {
        queryObject.aiMessageId = query?.aiMessageId;
      }

      if (query?.transactionId) {
        queryObject.transactionId = query?.transactionId;
      }

      return this.table.where(queryObject).toArray();
    }
  }

  public override async bulkUpsert (records: IAiTransactionItem[]): Promise<unknown> {
    await this.table.bulkPut(records);

    return true;
  }
}
