// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InternalSignRequest } from '@subwallet/extension-base/background/KoniTypes';
import { ResponseSigning } from '@subwallet/extension-base/background/types';

import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';

import { sendMessage } from '../base';

export async function signRaw (request: InternalSignRequest<SignerPayloadRaw>): Promise<ResponseSigning> {
  return sendMessage('pri(bytes.sign)', request);
}

export async function signPayload (request: InternalSignRequest<SignerPayloadJSON>): Promise<ResponseSigning> {
  return sendMessage('pri(extrinsic.sign)', request);
}

export const signer = {
  signPayload,
  signRaw
};
