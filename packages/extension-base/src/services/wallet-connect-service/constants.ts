// Copyright 2019-2022 @subwallet/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EIP155_SIGNING_METHODS, POLKADOT_SIGNING_METHODS, WalletConnectSigningMethod } from '@subwallet/extension-base/services/wallet-connect-service/types';
import { targetIsMobile } from '@subwallet/extension-base/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';

export const PROJECT_ID_EXTENSION = '34a107037c2b8381bb2477e7f04569c0';
export const PROJECT_ID_MOBILE = '34a107037c2b8381bb2477e7f04569c0';
export const RELAY_URL = 'wss://relay.walletconnect.com';

export const DEFAULT_WALLET_CONNECT_OPTIONS: SignClientTypes.Options = {
  logger: 'error',
  projectId: targetIsMobile ? PROJECT_ID_MOBILE : PROJECT_ID_EXTENSION,
  relayUrl: RELAY_URL,
  metadata: {
    name: 'Koni Story',
    description: 'A unified Telegram mini app that allows users to play with their IPs',
    url: 'https://koni-story.koni.studio/',
    icons: ['https://raw.githubusercontent.com/Koniverse/Playnation/story-protocol-od-prod/packages/webapp/public/images/favicon/android-chrome-512x512.png']
  }
};

export const ALL_WALLET_CONNECT_EVENT: SignClientTypes.Event[] = ['session_proposal', 'session_update', 'session_extend', 'session_ping', 'session_delete', 'session_expire', 'session_request', 'session_request_sent', 'session_event', 'proposal_expire'];

export const WALLET_CONNECT_SUPPORTED_METHODS: WalletConnectSigningMethod[] = [
  POLKADOT_SIGNING_METHODS.POLKADOT_SIGN_MESSAGE,
  POLKADOT_SIGNING_METHODS.POLKADOT_SIGN_TRANSACTION,
  EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
  EIP155_SIGNING_METHODS.PERSONAL_SIGN,
  EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V1,
  EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3,
  EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4
];

export const WALLET_CONNECT_REQUEST_KEY = 'wallet-connect';

export const WALLET_CONNECT_EIP155_NAMESPACE = 'eip155';
export const WALLET_CONNECT_POLKADOT_NAMESPACE = 'polkadot';

export const WALLET_CONNECT_SUPPORT_NAMESPACES: string[] = [WALLET_CONNECT_EIP155_NAMESPACE, WALLET_CONNECT_POLKADOT_NAMESPACE];

export const WC_REQUIRE_CHAIN_IDS: number[] = [1516, 1514];
export const WC_OPTIONAL_CHAIN_IDS: number[] = [];
export const WC_DEFAULT_CHAIN_TESTNET_ID = 1516;
export const WC_DEFAULT_CHAIN_MAINNET_ID = 1514;

export const WC_USER_REJECT_CODE = getSdkError('USER_REJECTED').code;
export const WC_USER_REJECT_MESSAGE = getSdkError('USER_REJECTED').message;
