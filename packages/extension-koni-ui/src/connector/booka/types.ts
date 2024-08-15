// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export enum EventTypeEnum {
  GAMEPLAY = 'GAMEPLAY',
  TASK = 'TASK',
  EVENT = 'EVENT',
}

export type AccountRankType = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface EnergyConfig {
  energyPrice: number,
  energyBuyLimit: number,
  maxEnergy: number,
  energyOneBuy: number
}

export interface RankInfo {
  minPoint: number,
  maxPoint: number,
  rank: AccountRankType,
  invitePoint: number,
  premiumInvitePoint: number
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
  pointConversionRate: number;
  gameType: 'casual' | 'farming';
  leaderboard_groups: LeaderboardGroups[];
  restrictedAccess: string[] | null;
  restrictedAccessText: string | null;
}

export enum TaskHistoryStatus {
  FAILED = 'failed',
  CHECKING = 'checking',
  COMPLETED = 'completed',
}

export interface ShareLeaderboard {
  content: string;
  url: string;
  start_time: string;
  end_time: string;
}

interface AchievementData {
  id: number;
  from_date: string;
  to_date: string;
  value: number;
  type: string;
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
  onChainType?: string | null;
  network?: string | null;
  interval?: number | null;

  status: TaskHistoryStatus;
  completedAt?: string;
  taskHistoryId?: number;
  share_leaderboard?: string | null;
  airlyftType?: string | null;
  airlyftWidgetId?: string | null;
  airlyftId?: string | null;
  buttonView?: string | null;
  achievement?: AchievementData | null;
}

export interface TaskCategory {
  id: number; // id on db
  contentId: number;
  slug: string;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
  active: boolean;
}

export type TaskCategoryInfo = {
  id: number;
  completeCount: number;
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
  state: any;
  stateSignature?: string;
  stateTimestamp?: string;
}

export interface GameData {
  id: number; // id on db
  gameId: number;
  accountId: number;
  point: number;
  level: number;
  rank: number;
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
    isActive: boolean;
  };
  attributes: {
    energy: number;
    accumulatePoint: number;
    rank: AccountRankType;
    point: number;
    lastEnergyUpdated: string;
    createdAt: string;
    updatedAt: string;
  },
  gameData: GameData[];
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
  total_count: number;
  referralSuccessTime: number;
  accountInfo: AccountPublicInfo;
}

export interface ConfigRecord {
  id: number;
  name: string;
  slug: string;
  value: LeaderboardItem[] | undefined;
}

export interface KeyValueStore {
  id: number;
  key: string;
  value: LeaderboardGroups[];
}
export interface LeaderboardGroups {
  leaderboards: LeaderboardItem[];
  leaderboardGroupId: number;
  leaderboardGroupName: string;
}
export interface LeaderboardItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  specialTime: string;
  startTime?: any;
  endTime?: any;
  metadata?: any;
  games: number[];
  tasks: number[];
  sharing: Sharing;
}
interface Sharing {
  id: number;
  url: string;
  content: string;
  hashtags: string;
}

export enum AirdropCampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELED = 'CANCELED',
}

export interface AirdropCampaignShare {
  id: number;
  content: string;
  url_share: string;
  hashtags: string;
  content_not_show_point: string | null;
  raffle_content: string;
  raffle_content_not_show_point: string | null;
  raffle_url_share: string;
  raffle_hashtags: string;
  url_twitter: string;
  url_website: string;
  url_discord: string;
  url_telegram: string;
}

export interface AirdropCampaign {
  id: number;
  airdrop_campaign_id: number;
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
  start: Date;
  end: Date;
  conditionDescription: string;
  description: string;
  shortDescription: string;
  tokenDistributions: JSON;
  npsDistributions: JSON;
  share: AirdropCampaignShare;
  token_slug: string,
  status: string;
  createdAt: Date;
  updatedAt: Date;
  eligibilityList: {
    id: number;
    name: string;
    type: string;
    start: Date;
    end: Date;
    boxCount: number,
    note: string
  }[];
  eligibilityIds?: number[];
}

export interface AirdropRewardHistoryLog {
  status: 'PENDING' | 'MISSED' | 'RECEIVED',
  type: 'TOKEN' | 'NPS',
  tokenSlug: string,
  rewardValue: number,
  endTime: string,
  name: string,
  id: number,
}

export interface AirdropEligibility {
  eligibility: boolean,
  totalBoxOpen: number,
  totalBoxClose: number,
  totalBox: number,
  price: number,
  currentProcess: string
  eligibilityIds?: number[];
}

export interface AirdropRaffle {
  airdropRecordLogId: number,
  rewardAmount: number,
  rewardType: string,
  success: boolean,
}

export interface AirdropClaim {
  airdropRecordLogId: number,
}
