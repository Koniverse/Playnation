// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum EventTypeEnum {
  GAMEPLAY = 'GAMEPLAY',
  TASK = 'TASK',
  EVENT = 'EVENT',
}

export interface EnergyConfig {
  energyPrice: number,
  energyBuyLimit: number,
  maxEnergy: number,
  energyOneBuy: number
}

export interface GameItem {
  id: number,
  contentId: number,
  gameId: number,
  slug: string,
  name: string,
  description: string,
  price: number,
  tokenPrice: number,
  maxBuy?: number | null,
  maxBuyDaily: number,
  itemGroup: string,
  itemGroupLevel: number,
  effectDuration: number,
  icon?: string
}

export enum GameInventoryItemStatus {
  INACTIVE = 'inactive', // After buy item request
  ACTIVE = 'active', // After validate signature
  USED = 'used', // After used item
}

export interface GameInventoryItem {
  success: boolean,
  inventory: {
    id: number,
    gameId: number,
    accountId: number,
    gameDataId: number,
    gameItemId: number,
    quantity: number,
    usable: boolean,
    itemId?: number | null
  },
  inventoryInGame: {
    [key: string]: number;
  }
}

export interface Game {
  id: number;
  contentId: number;
  slug: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  banner: string;
  maxEnergy: number;
  energyPerGame: number;
  maxPointPerGame: number;
  rankDefinition: string;
  startTime: string | null;
  endTime: string | null;
  active: boolean;
}

export interface Task {
  id: number; // id on db
  contentId: number;
  slug: string;
  gameId?: number | null;
  categoryId?: number | null;
  url?: string | null;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
  pointReward?: number | null;
  itemReward?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  interval?: number | null;

  status: number;
  completedAt?: string;
}

export interface TaskCategory {
  id: number; // id on db
  contentId: number;
  slug: string;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
  active: boolean;
  minPoint?: number;
}

export type TaskCategoryInfo = {
  id: number;
  minPoint: number;
  tasks: Task[];
}

export interface GamePlay {
  id: number; // id on db
  gameId: number;
  accountId: number;
  gameDataId: number;
  token: string;
  startTime: Date;
  energy: number;
  endTime?: Date;
  point?: number;
  success?: boolean;
}

export interface BookaAccount {
  info: {
    id: number;
    address: string;
    telegramId: string;
    telegramUsername: string;
    isPremium: string;
    isBot?: boolean;
    addedToAttachMenu?: boolean;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    languageCode?: string;
    createdAt: string;
    updatedAt: string;
    inviteCode: string;
  };
  attributes: {
    energy: number;
    accumulatePoint: number;
    rank: string;
    point: number;
    lastEnergyUpdated: string;
    createdAt: string;
    updatedAt: string;
  },
  token: string;
}

export interface AccountPublicInfo {
  id: number;
  telegramUsername: string;
  firstName: string;
  lastName: string;
  address: string;
  avatar?: string;

}

export interface LeaderboardPerson {
  rank: number;
  mine: boolean;
  point: number;
  accountInfo: AccountPublicInfo;
}

export interface ReferralRecord {
  point: number;
  referralSuccessTime: number;
  accountInfo: AccountPublicInfo;
}
export enum AirdropCampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELED = 'CANCELED',
}
export interface AirdropCampaign {
  id: number;
  name: string;
  icon: string;
  banner: string;
  start_snapshot: Date;
  end_snapshot: Date;
  start_claim: Date;
  end_claim: Date;
  network: string;
  total_tokens: number;
  symbol: string;
  decimal: number;
  method: string;
  raffle_count: number;
  tokenDistributions: JSON;
  npsDistributions: JSON;
  start: Date;
  end: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
