// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import KoniState from '@subwallet/extension-base/koni/background/handlers/State';
import WalletConnectService from '@subwallet/extension-base/services/wallet-connect-service';
import { WalletConnectSendTransactionParams } from '@subwallet/extension-base/types';
import { ethNumberToHex, isSameAddress } from '@subwallet/extension-base/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { TransactionConfig } from 'web3-core';

import { numberToHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import { WALLET_CONNECT_EIP155_NAMESPACE } from '../constants';
import { getEip155MessageAddress, getWCId, parseRequestParams } from '../helpers';
import { EIP155_SIGNING_METHODS } from '../types';

export default class Eip155RequestHandler {
  readonly #walletConnectService: WalletConnectService;
  readonly #koniState: KoniState;

  constructor (koniState: KoniState, walletConnectService: WalletConnectService) {
    this.#koniState = koniState;
    this.#walletConnectService = walletConnectService;
  }

  #checkAccount (address: string, accounts: string[]) {
    if (!accounts.find((account) => isSameAddress(account, address))) {
      throw new Error(getSdkError('UNSUPPORTED_ACCOUNTS').message + ' ' + address);
    }
  }

  #handleError (topic: string, id: number, e: unknown) {
    console.log(e);
    let message = (e as Error).message;

    if (message.includes('User Rejected Request')) {
      message = getSdkError('USER_REJECTED').message;
    }

    this.#walletConnectService.responseRequest({
      topic: topic,
      response: formatJsonRpcError(id, message)
    }).catch(console.error);
  }

  public handleRequest (requestEvent: SignClientTypes.EventArguments['session_request']) {
    const { id, params, topic } = requestEvent;
    const { chainId: _chainId, request } = params;
    const method = request.method as EIP155_SIGNING_METHODS;
    const requestSession = this.#walletConnectService.getSession(topic);

    const url = requestSession.peer.metadata.url;

    if ([
      EIP155_SIGNING_METHODS.PERSONAL_SIGN,
      EIP155_SIGNING_METHODS.ETH_SIGN,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3,
      EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4
    ].includes(method)) {
      this.#koniState.evmSign(getWCId(id), url, method === EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA ? EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4 : method, request.params, topic)
        .then(async (signature) => {
          await this.#walletConnectService.responseRequest({
            topic: topic,
            response: formatJsonRpcResult(id, signature)
          });
        })
        .catch((e) => {
          this.#handleError(topic, id, e);
        });
    } else if (method === EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION) {
      const [tx] = parseRequestParams<EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION>(request.params);

      const address = tx.from;

      const chainId = parseInt(_chainId.split(':')[1]);

      const [networkKey, chainInfo] = this.#koniState.findNetworkKeyByChainId(chainId);

      if (!networkKey || !chainInfo) {
        throw new Error(getSdkError('UNSUPPORTED_CHAINS').message + ' ' + address);
      }

      this.#koniState.evmSendTransaction(getWCId(id), url, tx, networkKey, topic)
        .then(async (signature) => {
          await this.#walletConnectService.responseRequest({
            topic: topic,
            response: formatJsonRpcResult(id, signature)
          });
        })
        .catch((e) => {
          this.#handleError(topic, id, e);
        });
    } else {
      throw Error(getSdkError('INVALID_METHOD').message + ' ' + method);
    }
  }

  public requestSignMessage (topic: string, chainId: number, address: string, method: string, message: unknown) {
    return this.#walletConnectService.sendRequest<string>({
      topic,
      request: {
        method,
        params: [message, address]
      },
      chainId: `${WALLET_CONNECT_EIP155_NAMESPACE}:${chainId}`
    });
  }

  public requestSendTransaction (topic: string, chainId: number, address: string, transaction: TransactionConfig) {
    const data: WalletConnectSendTransactionParams = {
      from: address as HexString,
      data: transaction.data as HexString,
      chainId: numberToHex(chainId),
      gas: ethNumberToHex(transaction.gas),
      gasPrice: ethNumberToHex(transaction.gasPrice),
      maxFeePerGas: ethNumberToHex(transaction.maxFeePerGas),
      maxPriorityFeePerGas: ethNumberToHex(transaction.maxPriorityFeePerGas),
      nonce: ethNumberToHex(transaction.nonce),
      value: ethNumberToHex(transaction.value),
      to: transaction.to as HexString
    };

    return this.#walletConnectService.sendRequest<string>({
      topic,
      request: {
        method: EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
        params: [data]
      },
      chainId: `${WALLET_CONNECT_EIP155_NAMESPACE}:${chainId}`
    });
  }
}
