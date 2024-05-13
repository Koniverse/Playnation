// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type ShopItemInfo = {
  icon?: string;
  gameItemId: number;
  name: string;
  gameId?: number;
  limit?: number;
  description?: string;
  inventoryQuantity?: number;
  itemGroup?: string;
  itemGroupLevel?: number;
  price: number;
  disabled?: boolean;
}
