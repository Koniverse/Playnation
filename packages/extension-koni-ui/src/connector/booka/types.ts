// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface GameSDK {
  /** SDK must be initialized first */
  init(params: SDKInitParams): Promise<{
    // ISO8601 date string
    currentTimestamp: string;
  }>;
  getPlayer(): Promise<Player>;
  /** Return current tournament, undefined = practice mode */
  getTournament(): Promise<Tournament | undefined>;
  buyTickets(): Promise<{ balance: number; tickets: number }>;
  /** Call play will cost player 1 ticket and return a token to submit score */
  play(): Promise<GamePlay>;
  /** Call every time player's score change */
  trackScore(gamePlayId: string, score: number, signature: string): Promise<BookaAccount>;
  /** Sign game play result and return signature to submit score */
  signResult(gamePlayId: string, gameToken: string, score: number): Promise<string>;
  showLeaderboard(): Promise<void>;
  showShop(): Promise<void>;
  getLeaderboard(req: GetLeaderboardRequest): Promise<GetLeaderboardResponse>;
  getInGameItems(): Promise<{ items: InGameItem[] }>;
  buyInGameItem(itemId: string, gameplayId?: string): Promise<BuyInGameItemResponse>;
  useInGameItem(itemId: string, gamePlayId: string): Promise<UseInGameItemResponse>;
  /** quit game, close webview */
  exit(confirm: boolean): Promise<void>;
  /** quit game and back to list games **/
  exitToListGames(confirm: boolean): Promise<void>;
  triggerHapticFeedback(type: HapticFeedbackType): Promise<void>;
  getVersion(): string;
}

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

export interface Player {
  id: string;
  name: string;
  energy: number;
  balance: number;
  level?: number;
  /** Image URL */
  avatar?: string;
  /** total GEM of user */
  inventory?: Inventory;
}

export type Inventory = Array<{
  /** InGameItem ID */
  itemId: string;
  quantity: number;
}>;

export interface Tournament {
  id: string;
  name: string;
  /** ISO 8601 timestamp */
  startTime: string;
  /** ISO 8601 timestamp */
  endTime: string;
  /** total tickets of current player */
  tickets: number;
  totalPlayers: number;
  entryFee: number;
  entryTickets: number;
  prizePool: {
    /** total gem of prize pool at current timestamp */
    total: number;
  };
}

export interface InGameItem {
  id: string;
  name: string;
  price: number;
}

export interface SDKInitParams {
  /** default to latest version */
  version?: string;
  clientId: string;
}

export interface GetLeaderboardRequest {
  limit: number;
  after: string;
  before: string;
}

export interface LeaderboardPerson {
  rank: number;
  id: string;
  firstName: string;
  lastName: number;
  point: number;
}

export type LeaderboardItem = Player & { rank: number; score: number };

export interface GetLeaderboardResponse {
  players: LeaderboardItem[];
  me?: LeaderboardItem;
}

export interface BuyInGameItemResponse {
  receipt: string;
  item: InGameItem;
}

export type UseInGameItemResponse = {
  success: boolean;
  inventory: Inventory;
};

export interface PlayResponse {
  /** One time token, use to submit score */
  gamePlayId: string;
  token: string;
  remainingTickets: number;
}

export interface Error {
  code?: number;
}

export type HapticFeedbackType =
  | 'impactLight'
  | 'impactMedium'
  | 'impactHeavy'
  | 'impactRigid'
  | 'impactSoft'
  | 'notiSuccess'
  | 'notiWarning'
  | 'notiError';

export enum ErrorCode {
  SystemError = -1, // something went wrong
  InvalidRequest = 10,
  TourNotAvailable = 100, // tournament has ended or disabled
  NotEnoughGEM = 110, // no enought GEM to buy tickets or items
  InvalidScore = 120, // score was not accepted (cheat detected)
  UserReject = 130, // User reject transaction (buy tickets or items)
  NotEnoughTicket = 140, // Not enough ticket to play game
}
