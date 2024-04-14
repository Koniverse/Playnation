// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum EventTypeEnum {
  GAMEPLAY = 'GAMEPLAY',
  TASK = 'TASK',
  EVENT = 'EVENT',
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
  active: boolean;
}

export interface Task {
  id: number; // id on db
  gameId: number;
  contentId: number;
  url: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  pointReward: number;
  itemReward: number;

  status: number;
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
    point: number;
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
