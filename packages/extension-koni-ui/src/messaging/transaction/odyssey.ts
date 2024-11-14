// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { RequestMintNft } from '@subwallet/extension-base/types';
import { sendMessage } from '@subwallet/extension-koni-ui/messaging';

export async function odysseyMintNft (request: RequestMintNft): Promise<SWTransactionResponse> {
  return sendMessage('pri(odyssey.nft.mint)', request);
}
