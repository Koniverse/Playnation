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
  gameType: 'casual' | 'farming' | 'mythical-card';
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

export enum TaskActionComponent {
  URL = 'task.action-url',
  SHARE = 'task.action-share',
  OPEN_SCREEN = 'task.action-open-screen',
  ONCHAIN = 'task.action-onchain',
  DIRECT = 'task.action-direct',
  CHECK_BALANCE = 'task.action-check-balance',
  CHECK_ACCOUNT_NFL_LEVEL = 'task.action-check-account-nfl-level',
  CHECK_CARD = 'task.action-check-card',
}

export interface TaskAction {
  __component: TaskActionComponent;
  label: string;
}

export interface TaskActionUrl extends TaskAction {
  url: string;
}

export interface TaskActionShare extends TaskAction {
  url: string;
  content: string;
}

export interface TaskActionOpenScreen extends TaskAction {
  screen: string;
}

export interface TaskActionOnchain extends TaskAction {
  type: string;
  network: string;
}

export interface TaskActionDirect extends TaskAction {
  type: 'invite' | 'mythical-login';
}

export interface Task {
  id: number; // id on db
  gameId?: number | null;
  categoryId?: number | null;
  name?: string | null;
  description?: string | null;
  icon?: string | null;
  pointReward?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  interval?: number | null;
  action?: TaskAction | null;

  status: TaskHistoryStatus;
  completedAt?: string;
  taskHistoryId?: number;
}

export enum TaskCategoryType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  FEATURED = 'featured',
}
export enum RepeatableType {
  NON_REPEATABLE = 'non_repeatable',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

/**
 * LogViewType
 * - single: Show only 1 log, only show the log that can be completed most recently. For example: achievement has 2 tasks to complete 3 games and 5 games, then only show 3 games, and when 3 games are completed, show 5 games
 * - multiple: show all logs
 */
export enum LogViewType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

/**
 * task completion progress, consisting of an array of lists with the following data:
 * - required: Number of tasks to be completed
 * - completed: number of tasks completed
 * - metricId: id of the corresponding metric
 */
export interface ProgressData {
  required: number;
  completed: number;
  metricId: string;
}

export enum ComparisonOperator {
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  EQ = 'eq',
  RANK_GT = 'rank_gt',
  RANK_GTE = 'rank_gte',
  RANK_LT = 'rank_lt',
  RANK_LTE = 'rank_lte',
  RANK_EQ = 'rank_eq'
}

/**
 * AchievementLogStatus
 * - pending: Initialization status, this log is not completed yet
 * - claimable: log has completed the task, can claim to receive nps
 * - claimed: Log has completed, account has received nps
 */
export enum AchievementLogStatus {
  PENDING = 'pending',
  CLAIMABLE = 'claimable',
  CLAIMED = 'claimed',
}

export interface Condition {
  metric: string;
  comparison: ComparisonOperator;
  value: number;
}

export interface Achievement {
  categoryName: string;
  categoryType: TaskCategoryType;
  categoryId: number;
  repeatable: RepeatableType;
  logViewType: LogViewType;
  conditions: Condition[];
  progress: ProgressData[];
  action?: TaskAction | null;
  pointReward: number;
  metrics: [
    {
      id: number,
      type: string,
      metricId: string,
      unit: string,
    }
  ],
  milestoneOrdinal: number;
  name: string;
  id: number;
  milestoneId: number;
  milestoneName: string,
  documentId: string;
  icon: string,
  nps: number,
  status: AchievementLogStatus,
  specialPurpose?: string,
  createdAt: Date,
  completedAt: Date,
}

export interface ClaimableAchievement {
  achievement?: boolean,
  daily_reward_mission?: boolean,
  invite_mission?: boolean
}

export interface TaskCategory {
  id: number; // id on db
  contentId: number;
  type: TaskCategoryType;
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
  gameEventId?: number;
  token: string;
  startTime: Date;
  energy: number;
  endTime?: Date;
  point?: number;
  gamePoint?: number;
  success?: boolean;
  initState: any;
  state: any;
  stateData: unknown;
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
  email: string;
  domain: string | null,
  signature: string | null;
  address: string | null;
  uid: string | null;
  avatar?: string;
}

export interface LeaderboardPerson {
  rank: number;
  mine: boolean;
  point: number;
  accountInfo: AccountPublicInfo;
}

export interface LeaderboardResult {
  results: LeaderboardPerson[]
  filter: LeaderboardInfo
}

export interface ReferralRecord {
  id: number;
  point: number;
  accountInfo: AccountPublicInfo & {
    point: number;
  };
}

export interface ReferralData {
  count: number;
  data: ReferralRecord[];
}

export interface ConfigRecord {
  id: number;
  name: string;
  slug: string;
  value: LeaderboardInfo[] | undefined;
}

export interface KeyValueStore {
  id: number;
  key: string;
  value: LeaderboardGroups[];
}
export interface LeaderboardGroups {
  leaderboards: { id: number }[];
  leaderboardGroupId: number;
  leaderboardGroupName: string;
}
export interface LeaderboardInfo {
  id: number;
  name: string;
  slug: string;
  type: string;
  specialTime: string;
  startTime?: string;
  endTime?: string;
  startTimeTs?: number;
  endTimeTs?: number;
  metadata?: any;
  games: number[];
  tasks: number[];
  gameEventIds: number[];
  specialTimeDelayDuration?: number;
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

export enum RewardStatus {
  IN_REVIEW = 'IN_REVIEW',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  SUCCESS = 'SUCCESS',
}

export enum RewardType {
  NPS = 'NPS',
  TOKEN = 'TOKEN',
}

export interface Reward {
  airdrop_log_id: number
  airdrop_record_id: number
  type: RewardType
  campaign_id: number
  campaign_method: string
  campaign_name: string
  eligibility_name?: string
  eligibility_end?: number
  completeDate?: number
  expiryDate: number
  status: RewardStatus
  account_id: number
  eligibility_id: number
  address?: string
  point: number
  network: string
  token: number
  token_slug?: string
  decimal: number
}

export interface RewardConfigItem {
  to: number;
  from: number;
  name: string;
  amount: number;
}

export interface RewardHistoryStored {
  isCheck: boolean,
  status: RewardStatus
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

export interface GameEvent {
  id: number;
  name: string;
  gameId: number;
  icon: string;
  description?: string;
  startTime: string;
  endTime: string;
  tossUpInfo: TossUpInfo;
  tossUpBonus: TossUpBonus[];
  gamePlays: Pick<GamePlay, 'id' | 'startTime' | 'success' | 'point' | 'gamePoint' | 'endTime' | 'stateData'>[];
  repeatable: RepeatableType;
  status: string;
}

export enum GameEventStatus {
  NOT_COMPLETED = 'not_completed',
  COMPLETED = 'completed'
}

interface TossUpBonus {
  team?: string;
  bonus: number;
  bonusText: string;
  program?: string;
  position?: string;
}

interface TossUpInfo {
  round: number;
  stats: string[];
  difficulty: number;
  playDuration: number;
  opponentTeams: string[];
  gameplayPerEvent: number;
}

export interface NFLRivalCard {
  cardId: string;
  defId: string;
  firstName: string;
  lastName: string;
  team: string;
  position: string;
  rarity: string;
  program: string;
  stars: number;
  image: string;
  isDefault: boolean;
  level: number;
  power: number;
  strength: number;
  quickness: number;
  acceleration: number;
  presence: number;
  endurance: number;
  jump: number;
  carry: number;
}

export interface MythicalWallet {
  address: string,
  balanceInMyth: string
}
