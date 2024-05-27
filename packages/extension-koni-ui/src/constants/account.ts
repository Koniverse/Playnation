// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { KeypairType } from '@polkadot/util-crypto/types';

export const SUBSTRATE_ACCOUNT_TYPE: KeypairType = 'sr25519';
export const EVM_ACCOUNT_TYPE: KeypairType = 'ethereum';

export const DEFAULT_ACCOUNT_TYPES: KeypairType[] = [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE];

export const DEFAULT_PASSWORD = 'PlayNation#^(';

export const rankPointMap: Record<string, number> = {
  iron: 600,
  bronze: 1500,
  silver: 4500,
  gold: 13500,
  platinum: 40500,
  diamond: 121500
};

export const smallRankIconMap: Record<string, string> = {
  iron: '/images/ranks/iron_small.png',
  bronze: '/images/ranks/bronze_small.png',
  silver: '/images/ranks/silver_small.png',
  gold: '/images/ranks/gold_small.png',
  platinum: '/images/ranks/platinum_small.png',
  diamond: '/images/ranks/diamond_small.png'
};

export const largeRankIconMap: Record<string, string> = {
  iron: '/images/ranks/iron_large.png',
  bronze: '/images/ranks/bronze_large.png',
  silver: '/images/ranks/silver_large.png',
  gold: '/images/ranks/gold_large.png',
  platinum: '/images/ranks/platinum_large.png',
  diamond: '/images/ranks/diamond_large.png'
};
