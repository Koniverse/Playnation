// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { recoverPersonalSignature } from '@metamask/eth-sig-util';

import { isAddress, isEthereumAddress, signatureVerify } from '@polkadot/util-crypto';

export function validateSignature (address: string, signedMessage: string, signature: string): boolean {
  try {
    if (isEthereumAddress(address)) {
      const recoveredAddress = recoverPersonalSignature({
        data: signedMessage,
        signature
      });

      return recoveredAddress.toLocaleLowerCase() === address.toLocaleLowerCase();
    }

    if (!isAddress(address) && !isEthereumAddress(address)) {
      return false;
    }

    return signatureVerify(signedMessage, signature, address).isValid;
  } catch (e) {
    return false;
  }
}
