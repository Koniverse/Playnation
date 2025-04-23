// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InGameItem } from '@playnation/game-sdk';
import { GameState } from '@playnation/game-sdk/dist/types';
import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler, detectTranslate } from '@subwallet/extension-base/utils';
import { AppMetadata, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { AccountRankType, Achievement, AirdropCampaign, AirdropEligibility, AirdropRaffle, AirdropRewardHistoryLog, BookaAccount, ClaimableAchievement, EnergyConfig, Game, GameEvent, GameInventoryItem, GameItem, GamePlay, LeaderboardPerson, LeaderboardResult, MythicalWallet, NFLRivalCard, RankInfo, ReferralData, Reward, RewardConfigItem, RewardHistoryStored, RewardStatus, Task, TaskCategory } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { signRaw } from '@subwallet/extension-koni-ui/messaging';
import { populateTemplateString } from '@subwallet/extension-koni-ui/utils';
import { formatDateFully } from '@subwallet/extension-koni-ui/utils/date';
import fetch from 'cross-fetch';
import { deflate, inflate } from 'pako';
import { BehaviorSubject } from 'rxjs';

import { stringToU8a, u8aToString } from '@polkadot/util';

export const DEFAULT_INIT_DATA = process.env.DEFAULT_INIT_DATA;
export const DEBUG_REPORT_URL = process.env.DEBUG_REPORT_URL || '';
export const GAME_API_HOST = process.env.GAME_API_HOST || 'https://game-api.anhmtv.xyz';
export const MYTHICAL_API_HOST = process.env.MYTHICAL_API_HOST || 'https://nflrivals.client.mythical.dev';
export const TELEGRAM_WEBAPP_LINK = process.env.TELEGRAM_WEBAPP_LINK || 'Playnation_bot/app';
const storage = SWStorage.instance;
const telegramConnector = TelegramConnector.instance;

// Increase of changing the cache version, we need to clear the cache
// From version 1.2 use localStorage instead of cloudStorage for cache
const cacheVersion = '1.2.1';
const CACHE_KEYS = {
  account: 'data--account-cache',
  taskCategoryList: 'data--task-category-list-cache',
  taskList: 'data--task-list-cache',
  gameList: 'data--game-list-cache',
  energyConfig: 'data--energy-config-cache',
  rankInfoMap: 'data--rank-info-map-cache',
  leaderboardConfigSubject: 'data--leaderboard-config-list-cache',
  airdropCampaignList: 'data--airdrop-campaign-list-cache',
  achievementList: 'data--achievement-list-cache',
  gameEventList: 'data--game-event-cache',
  nflRivalCardList: 'data--nfl-rival-cards-cache'
};

const CLOUD_STORAGE_KEYS = {
  rewardHistories: 'data--reward-histories-storage'
};

function parseCache<T> (key: string, useDecompress?: boolean): T | undefined {
  let data = localStorage.getItem(key);

  if (data) {
    try {
      if (useDecompress) {
        data = decompressData(data);
      }

      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Failed to parse cache ${key}`, e);
    }
  }

  return undefined;
}

function compressData (data: any) {
  const jsonData = JSON.stringify(data);

  const compressed = deflate(jsonData);

  return u8aToString(compressed);
}

function decompressData (data: string) {
  const compressed = stringToU8a(data);

  return inflate(compressed, { to: 'string' });
}

function generateCloudKey (keys: number[], type: string) {
  return `${type}:${keys.join('-')}`;
}

export function getRewardStatus (status: RewardStatus) {
  if (status === RewardStatus.SUCCESS || status === RewardStatus.EXPIRED) {
    return status;
  }

  return RewardStatus.PENDING;
}

const metadataHandler = MetadataHandler.instance;

interface DebugData {
  id: string;
  datas: { type: string, input: any }[];
  errors: { type: string, input: any }[];
}

// Todo: Create env to point or disable debugs
const DebugLogHandler = {
  debugUrl: DEBUG_REPORT_URL,
  debugData: {
    id: '_none_',
    datas: [],
    errors: []
  } as DebugData,
  debugLazy: undefined,
  initHandler: createPromiseHandler<void>(),
  initDebugLog: async () => {
    if (!DebugLogHandler.debugUrl) {
      return;
    }

    const { datas, errors } = DebugLogHandler.debugData;

    const initLogData = {
      version: cacheVersion,
      time: new Date().toISOString(),
      userInfo: TelegramConnector.instance.userInfo
    };

    // @ts-ignore
    datas.push(initLogData);

    const rs = await fetch(DebugLogHandler.debugUrl, {
      method: 'POST',
      body: JSON.stringify({
        datas,
        errors
      })
    });

    if (rs.status > 400) {
      console.error('Failed to push debug log', rs);
    } else {
      const rsData = (await rs.json()) as DebugData;

      DebugLogHandler.debugData.id = rsData.id;
    }

    DebugLogHandler.initHandler.resolve();
  },
  sendTimeout: undefined,
  sendDebugLog: (type: string, input: unknown, isError?: boolean) => {
    if (!DebugLogHandler.debugUrl) {
      return;
    }

    DebugLogHandler.sendTimeout && clearTimeout(DebugLogHandler.sendTimeout);
    const debugUrl = DebugLogHandler.debugUrl;
    const { datas, errors } = DebugLogHandler.debugData;

    if (isError) {
      errors.push({
        type,
        input
      });
    } else {
      datas.push({
        type,
        input
      });
    }

    // @ts-ignore
    DebugLogHandler.sendTimeout = setTimeout(() => {
      (async () => {
        await DebugLogHandler.initHandler.promise;
        const id = DebugLogHandler.debugData.id;

        const rs = await fetch(`${debugUrl}/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            datas,
            errors
          })
        });

        if (rs.status > 400) {
          console.error('Failed to push debug log', rs);
        }

        DebugLogHandler.sendTimeout = undefined;
      })().catch(console.error);
    }, 300);
  }
};

export class BookaSdk {
  private syncHandler = createPromiseHandler<void>();
  private cardListHandler = createPromiseHandler<void>();
  private accountSubject = new BehaviorSubject<BookaAccount | undefined>(undefined);
  private taskListSubject = new BehaviorSubject<Task[]>([]);
  private achievementListSubject = new BehaviorSubject<Achievement[]>([]);
  private taskCategoryListSubject = new BehaviorSubject<TaskCategory[]>([]);
  private gameListSubject = new BehaviorSubject<Game[]>([]);
  private gameEventSubject = new BehaviorSubject<GameEvent[]>([]);
  private currentGamePlaySubject = new BehaviorSubject<GamePlay | undefined>(undefined);
  private leaderBoardSubject = new BehaviorSubject<LeaderboardResult | undefined>(undefined);
  private referralDataSubject = new BehaviorSubject<ReferralData | undefined>(undefined);
  private gameItemMapSubject = new BehaviorSubject<Record<string, GameItem[]>>({});
  private gameInventoryItemListSubject = new BehaviorSubject<GameInventoryItem[]>([]);
  private gameInventoryItemInGame = new BehaviorSubject<GameInventoryItem['inventoryInGame']>({});
  private gameItemInGame = new BehaviorSubject<Record<string, InGameItem>>({});
  private energyConfigSubject = new BehaviorSubject<EnergyConfig | undefined>(undefined);
  private rankInfoSubject = new BehaviorSubject<Record<AccountRankType, RankInfo> | undefined>(undefined);
  private airdropCampaignSubject = new BehaviorSubject<AirdropCampaign[]>([]);
  private checkEligibility = new BehaviorSubject<AirdropEligibility[]>([]);
  private rewardListSubject = new BehaviorSubject<Reward[]>([]);
  private leaderboardConfigSubject = new BehaviorSubject<Record<string, object>>({});
  private nflRivalCardListSubject = new BehaviorSubject<NFLRivalCard[]>([]);
  private metadataSubject = new BehaviorSubject<AppMetadata | undefined>(undefined);
  private serverTimeSubject = new BehaviorSubject<number>(Date.now());
  private dailyRewardAchievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private inviteAchievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private claimableAchievementSubject = new BehaviorSubject<ClaimableAchievement>({});
  private mythicalWalletSubject = new BehaviorSubject<MythicalWallet>({
    address: '',
    balanceInMyth: '0'
  });

  // Special cases
  // Check if the account is banned
  isAccountEnable = new BehaviorSubject<boolean>(true);

  constructor () {
    DebugLogHandler.initDebugLog().catch(console.error);
    this.initMetadataHandling();
    const version = localStorage.getItem('cache-version');

    if (cacheVersion === version) {
      const account = parseCache<BookaAccount>(CACHE_KEYS.account);
      const taskCategoryList = parseCache<TaskCategory[]>(CACHE_KEYS.taskCategoryList);
      const tasks = parseCache<Task[]>(CACHE_KEYS.taskList);
      const achievementList = parseCache<Achievement[]>(CACHE_KEYS.achievementList);
      const game = parseCache<Game[]>(CACHE_KEYS.gameList);
      const energyConfig = parseCache<EnergyConfig>(CACHE_KEYS.energyConfig);
      const airdropCampaignList = parseCache<AirdropCampaign[]>(CACHE_KEYS.airdropCampaignList);
      const rankInfoMap = parseCache<Record<AccountRankType, RankInfo>>(CACHE_KEYS.rankInfoMap);
      const leaderboardConfigSubject = parseCache<Record<string, object>>(CACHE_KEYS.leaderboardConfigSubject);
      const gameEventList = parseCache<GameEvent[]>(CACHE_KEYS.gameEventList);
      const nflRivalCardList = parseCache<NFLRivalCard[]>(CACHE_KEYS.nflRivalCardList, true);

      account && this.accountSubject.next(account);
      taskCategoryList && this.taskCategoryListSubject.next(taskCategoryList);
      tasks && this.taskListSubject.next(tasks);
      achievementList && this.achievementListSubject.next(achievementList);
      game && this.gameListSubject.next(game);
      energyConfig && this.energyConfigSubject.next(energyConfig);
      rankInfoMap && this.rankInfoSubject.next(rankInfoMap);
      airdropCampaignList && this.airdropCampaignSubject.next(airdropCampaignList);
      leaderboardConfigSubject && this.leaderboardConfigSubject.next(leaderboardConfigSubject);
      gameEventList && this.gameEventSubject.next(gameEventList);
      nflRivalCardList && this.nflRivalCardListSubject.next(nflRivalCardList);
    } else {
      console.debug('Clearing cache');
      Object.keys(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
      storage.removeItems(Object.keys(CACHE_KEYS)
        .concat(['cache-version']))
        .catch(console.error)
        .finally(() => localStorage.setItem('cache-version', cacheVersion));
    }
  }

  public subscribeServerTime () {
    return this.serverTimeSubject;
  }

  public get serverTime () {
    return this.serverTimeSubject.value;
  }

  public get waitForSync () {
    return this.syncHandler.promise;
  }

  public get account () {
    return this.accountSubject.value;
  }

  public get energyConfig () {
    return this.energyConfigSubject.value;
  }

  public get taskList () {
    return this.taskListSubject.value;
  }

  public get taskCategoryList () {
    return this.taskCategoryListSubject.value;
  }

  public get achievementList () {
    return this.achievementListSubject.value;
  }

  public get gameList () {
    return this.gameListSubject.value;
  }

  public get gameEventList () {
    return this.gameEventSubject.value;
  }

  public get gameItemMap () {
    return this.gameItemMapSubject.value;
  }

  public get gameItemInGameList () {
    return this.gameItemInGame.value;
  }

  public get gameInventoryItemList () {
    return this.gameInventoryItemListSubject.value;
  }

  public get gameInventoryItemInGameList () {
    return this.gameInventoryItemInGame.value;
  }

  public get leaderBoard () {
    return this.leaderBoardSubject.value;
  }

  public get referralList () {
    return this.referralDataSubject.value;
  }

  public get currentGamePlay () {
    return this.currentGamePlaySubject.value;
  }

  public get rankInfoMap () {
    return this.rankInfoSubject.value;
  }

  public get airdropCampaignList () {
    return this.airdropCampaignSubject.value;
  }

  private getRequestHeader () {
    const header: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.account) {
      header.Authorization = `Bearer ${this.account.token}`;
    }

    return header;
  }

  private async getRequest<T> (url: string) {
    const request = await fetch(url, {
      method: 'GET',
      headers: this.getRequestHeader()
    });

    if (request.status === 200 || request.status === 304) {
      const data = (await request.json()) as unknown as T;

      this.pushDebugLog(url, { request: 'GET', response: '__OK__' });

      return data;
    } else {
      this.pushDebugLog(url, { request: 'GET', response: request }, true);

      return undefined;
    }
  }

  private async postRequest<T> (url: string, body: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getRequestHeader(),
      body: JSON.stringify(body)
    });

    if (!response || response.status !== 200) {
      const errorResponse = await response.json() as { error: string };

      this.pushDebugLog(url, body, true);

      throw new Error(errorResponse.error || 'Bad request');
    }

    const data = await response.json() as T;

    this.pushDebugLog(url, { request: body as string, response: '__OK__' });

    return data;
  }

  initMetadataHandling () {
    this.fetchMetadata().catch(console.error);

    setInterval(() => {
      this.fetchMetadata().catch(console.error);
    }, 30000);

    this.metadataSubject.subscribe((metadata) => {
      metadata && metadataHandler.updateMetadata(metadata);
      const serverTime = metadata?.timeRange?.now;

      if (serverTime) {
        this.serverTimeSubject.next(serverTime);
      }
    });

    // Listen to metadata changes
    metadataHandler.on('updateVersion', ({ achievement, airdrop, application, game, leaderboard, task }) => {
      if (application) {
        const isForceUpdate = application.current && application.newVersion.minVersion && application.current.version < application.newVersion.minVersion;
        const updateMessage = application.updateMessage || 'New app version is available, update now!';

        if (isForceUpdate) {
          telegramConnector.showAlert(updateMessage, () => {
            window.location.reload();
          });
        } else {
          telegramConnector.showConfirmation(updateMessage, (confirm) => {
            confirm && window.location.reload();
          });
        }
      }

      if (game) {
        this.fetchGameList().catch(console.error);
      }

      if (task) {
        this.fetchTaskCategoryList().catch(console.error);
        this.fetchTaskList().catch(console.error);
      }

      if (leaderboard) {
        this.fetchLeaderboardConfigList().catch(console.error);
      }

      if (airdrop) {
        this.fetchAirdropCampaign().catch(console.error);
      }

      if (achievement) {
        // this.fetchAchievementList().catch(console.error);
      }
    });
  }

  async fetchMetadata () {
    const metadata = await this.getRequest<AppMetadata>(`${GAME_API_HOST}/api/metadata/fetch`);

    metadata && this.metadataSubject.next(metadata);

    return metadata;
  }

  getMetadata () {
    return this.metadataSubject.value;
  }

  subscribeMetadata () {
    return this.metadataSubject;
  }

  async reloadAccount () {
    const account = this.account;
    const newAccountData = await this.getRequest<Omit<BookaAccount, 'token'>>(`${GAME_API_HOST}/api/account/get-attribute`);

    if (account && newAccountData) {
      account.attributes = newAccountData.attributes;
      // @ts-ignore
      account.gameData = newAccountData.gameData;
    }

    this.accountSubject.next(account);
    localStorage.setItem(CACHE_KEYS.account, JSON.stringify(account));
  }

  subscribeAccount () {
    return this.accountSubject;
  }

  async fetchEnergyConfig () {
    const energyConfig = await this.getRequest<EnergyConfig>(`${GAME_API_HOST}/api/shop/get-config-buy-energy`);

    if (energyConfig) {
      this.energyConfigSubject.next(energyConfig);
      localStorage.setItem(CACHE_KEYS.energyConfig, JSON.stringify(energyConfig));
    }
  }

  subscribeEnergyConfig () {
    return this.energyConfigSubject;
  }

  async fetchGameList () {
    const gameList = await this.getRequest<Game[]>(`${GAME_API_HOST}/api/game/fetch`);

    if (gameList) {
      this.gameListSubject.next(gameList);
      localStorage.setItem(CACHE_KEYS.gameList, JSON.stringify(gameList));
    }

    return gameList;
  }

  subscribeGameList () {
    return this.gameListSubject;
  }

  async fetchTaskCategoryList () {
    await this.waitForSync;
    const taskCategoryList = await this.getRequest<TaskCategory[]>(`${GAME_API_HOST}/api/task-category/fetch`);

    if (taskCategoryList) {
      this.taskCategoryListSubject.next(taskCategoryList);
      localStorage.setItem(CACHE_KEYS.taskCategoryList, JSON.stringify(taskCategoryList));
    }

    return taskCategoryList;
  }

  subscribeTaskCategoryList () {
    return this.taskCategoryListSubject;
  }

  /**
   * Fetch game event list
   * return GameEvent[] the list of game event
   */
  async fetchGameEventList () {
    await this.waitForSync;
    const gameEventList = await this.getRequest<GameEvent[]>(`${GAME_API_HOST}/api/game-event/fetch`);

    if (gameEventList) {
      this.gameEventSubject.next(gameEventList);
      localStorage.setItem(CACHE_KEYS.gameEventList, JSON.stringify(gameEventList));
    }

    return gameEventList;
  }

  subscribeGameEventList () {
    return this.gameEventSubject;
  }

  subscribeAchievementList () {
    return this.achievementListSubject;
  }

  /**
   * Fetch game event list
   * return GameEvent[] the list of game event
   */
  async fetchNFLRivalCardList (token?: string) {
    await this.waitForSync;
    const response = await this.postRequest<{cards: NFLRivalCard[]}>(`${GAME_API_HOST}/api/nfl-rival-card/fetch`, {
      token
    });

    if (response?.cards) {
      this.nflRivalCardListSubject.next(response.cards);
      localStorage.setItem(CACHE_KEYS.nflRivalCardList, compressData(response.cards));
    }

    this.cardListHandler.resolve();

    return response?.cards || [];
  }

  subscribeNFLRivalCardList () {
    return this.nflRivalCardListSubject;
  }

  async getNFLRivalCardList () {
    await this.cardListHandler.promise;

    return this.nflRivalCardListSubject.value;
  }

  async fetchMythicalBalance (token?: string) {
    await this.waitForSync;

    try {
      const rs = await this.postRequest<MythicalWallet>(`${GAME_API_HOST}/api/mythical-account/fetch`, { token: token });

      if (rs) {
        this.mythicalWalletSubject.next(rs);
      }
    } catch (error) {
      console.error('Error in fetchMythicalBalance:', error);
      throw error;
    }
  }

  getDailyRewardAchievements () {
    return this.dailyRewardAchievementsSubject.value;
  }

  subscribeDailyRewardAchievements () {
    return this.dailyRewardAchievementsSubject;
  }

  getInviteAchievements () {
    return this.inviteAchievementsSubject.value;
  }

  subscribeInviteAchievements () {
    return this.inviteAchievementsSubject;
  }

  getClaimableAchievementSubject () {
    return this.claimableAchievementSubject.value;
  }

  subscribeClaimableAchievementSubject () {
    return this.claimableAchievementSubject;
  }

  /**
    * Fetch achievement list
   * return Achievement[] the list of achievementList
   */
  async fetchAchievementList () {
    await this.waitForSync;
    const achievementList = await this.getRequest<Achievement[]>(`${GAME_API_HOST}/api/achievement/fetch-v2`);

    if (achievementList) {
      const dailyRewardAchievement: Achievement[] = [];
      const inviteAchievement: Achievement[] = [];
      const claimableAchievement: ClaimableAchievement = { daily_reward_mission: false, achievement: false, invite_mission: false };
      const achievementListFiltered = achievementList.filter((item) => {
        if (item.specialPurpose === 'daily_reward_mission') {
          dailyRewardAchievement.push(item);

          if (item.status === 'claimable') {
            claimableAchievement.daily_reward_mission = true;
          }

          return false;
        } else if (item.specialPurpose === 'invite_mission') {
          inviteAchievement.push(item);

          if (item.status === 'claimable') {
            claimableAchievement.invite_mission = true;
          }

          return false;
        } else if (item.status === 'claimable') {
          claimableAchievement.achievement = true;

          return true;
        }

        return true;
      });

      this.claimableAchievementSubject.next(claimableAchievement);
      this.dailyRewardAchievementsSubject.next(dailyRewardAchievement);
      this.inviteAchievementsSubject.next(inviteAchievement);
      this.achievementListSubject.next(achievementListFiltered);
      localStorage.setItem(CACHE_KEYS.achievementList, JSON.stringify(achievementList));
    }
  }

  /**
   * Claim achievement
   * Return {success: boolean} or throw error
   * @param milestoneId
   */
  async claimAchievement (milestoneId: number) {
    const data = await this.postRequest(`${GAME_API_HOST}/api/achievement/claim`, { milestoneId });

    await this.fetchAchievementList();

    await this.reloadAccount();

    return data as {success: boolean};
  }

  /**
   * Check achievement
   * Return {success: boolean, data: Achievement, message: string } or throw error
   * @param milestoneId
   */
  async checkAchievement (milestoneId: number) {
    const data = await this.postRequest(`${GAME_API_HOST}/api/achievement/check`, { milestoneId });

    await this.fetchAchievementList();

    await this.reloadAccount();

    return data as {success: boolean, message?: string, data: Achievement};
  }

  async fetchTaskList () {
    await this.waitForSync;
    const taskList = await this.getRequest<Task[]>(`${GAME_API_HOST}/api/task/history`);

    if (taskList) {
      this.taskListSubject.next(taskList);
      localStorage.setItem(CACHE_KEYS.taskList, JSON.stringify(taskList));
    }
  }

  subscribeTaskList () {
    return this.taskListSubject;
  }

  async checkCompleteTask (taskId: number | undefined) {
    const taskHistoryCheck = await this.postRequest<{ completed: boolean, isSubmitting: boolean }>(`${GAME_API_HOST}/api/task/check-complete-task`, { taskId });

    if (taskHistoryCheck && taskHistoryCheck.completed) {
      await this.fetchTaskCategoryList();

      await this.fetchTaskList();

      await this.reloadAccount();
    }

    return taskHistoryCheck;
  }

  async finishTask (taskId: number, extrinsicHash: string, network: string) {
    const data = await this.postRequest(`${GAME_API_HOST}/api/task/submit`, { taskId, extrinsicHash, network });

    await this.fetchTaskCategoryList();

    await this.fetchTaskList();

    await this.reloadAccount();

    return data as {success: boolean, isOpenUrl: boolean, openUrl: string, message: string};
  }

  getInviteURL (): string {
    return `https://t.me/${TELEGRAM_WEBAPP_LINK}?startapp=${this.account?.info.inviteCode || 'booka'}`;
  }

  // @Todo: Need update share url of campaign data in reward list and then clear useFakeData param
  public getShareTwitterAirdropURL (item?: AirdropCampaign, useFakeData?: boolean, totalTokenReward?: string) {
    if (!item?.share) {
      if (useFakeData && totalTokenReward) {
        const content = `I've won ${totalTokenReward} MYTH on @PlayNFLRivals Telegram bot`;

        return `http://x.com/share?text=${content}&url=${'https://x.playnation.app'}`;
      }

      return;
    }

    try {
      const dataShare = item.share;
      const urlBot = dataShare.url_share;

      const content = dataShare.content;
      let hashtag = '';

      if (dataShare.hashtags) {
        hashtag = `&hashtags=${dataShare.hashtags}`;
      }

      const linkApp = `${urlBot}?startApp=${this.account?.info.inviteCode || 'booka'}`;

      return `http://x.com/share?text=${content}&url=${linkApp}%0A${hashtag}`;
    } catch (e) {}

    return null;
  }

  async getShareTwitterClaimURL (item: AirdropCampaign) {
    if (!item.share) {
      return undefined;
    }

    const start = item.start_snapshot;
    const end = item.end_snapshot;
    const leaderBoard = await this.postRequest<LeaderboardPerson[]>(`${GAME_API_HOST}/api/game/leader-board`, { startDate: start, endDate: end, limit: 1, type: 'all' });
    const personMine = leaderBoard.find((item) => item.mine === true);

    try {
      const dataShare = item.share;
      let content = dataShare.raffle_content_not_show_point || dataShare.raffle_content;

      if (personMine) {
        content = populateTemplateString(dataShare.raffle_content, personMine);
      }

      let hashtag = '';

      if (dataShare.raffle_hashtags) {
        hashtag = `&hashtags=${dataShare.raffle_hashtags}`;
      }

      const urlBot = dataShare.raffle_url_share;

      const linkApp = `${urlBot}?startApp=${this.account?.info.inviteCode || 'booka'}`;

      return `http://x.com/share?text=${content}%0A&url=${linkApp}${hashtag}`;
    } catch (e) {
      return undefined;
    }
  }

  async getShareTwitterURL (startDate: string, endDate: string, content: string, gameId: number, url: string) {
    const start = formatDateFully(new Date(startDate));
    const end = formatDateFully(new Date(endDate));
    const leaderBoard = await this.postRequest<LeaderboardPerson[]>(`${GAME_API_HOST}/api/game/leader-board`,
      { startDate: start,
        endDate: end,
        gameId: gameId,
        limit: 1 });

    const personMine = leaderBoard.find((item) => item.mine);
    let contentShare = '';

    if (personMine) {
      contentShare = `text=${populateTemplateString(content, personMine)}%0A&`;
    }

    const linkShare = `${url}?startApp=${this.account?.info.inviteCode || 'booka'}`;

    return `http://x.com/share?${contentShare}url=${linkShare}`;
  }

  async fetchReferralList () {
    await this.waitForSync;
    const refList = await this.getRequest<ReferralData>(`${GAME_API_HOST}/api/account/get-rerferal-logs`);

    if (refList) {
      this.referralDataSubject.next(refList);
    }
  }

  subscribeReferralList () {
    this.fetchReferralList().catch(console.error);

    return this.referralDataSubject;
  }

  debugData = {
    id: '_none_',
    datas: [],
    errors: []
  };

  pushDebugLog (type: string, input: unknown, isError?: boolean) {
    DebugLogHandler.sendDebugLog(type, input, isError);
  }

  /**
   * Telegram login actions
   * */
  async login (address?: string) {
    const initData = telegramConnector.initData || DEFAULT_INIT_DATA;
    const referralCode = telegramConnector.getStartParam() || '';

    this.accountSubject.next(undefined);

    const syncData = {
      address,
      referralCode,
      initData
    };

    this.pushDebugLog('login-data', syncData);

    try {
      const account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/login`, syncData);

      this.pushDebugLog('account-data', account);

      if (account) {
        this.accountSubject.next(account);
        localStorage.setItem(CACHE_KEYS.account, JSON.stringify(account));
        this.syncHandler.resolve();

        await Promise.all([
          this.fetchEnergyConfig(),
          this.fetchRankInfoMap(),
          this.fetchLeaderboardConfigList(),
          this.fetchGameList(),
          this.fetchGameEventList(),
          this.fetchAchievementList(),
          this.fetchRewardList(),
          this.fetchMetadata()
          // this.fetchNFLRivalCardList(), // Run in the mythical login to get token
          // this.fetchTaskCategoryList(),
          // this.fetchTaskList(),
          // this.fetchGameItemMap(),
          // this.fetchGameInventoryItemList(),
          // this.fetchGameItemInGameList()
        ]);
      }
    } catch (error: any) {
      this.pushDebugLog('init-error', error, true);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.message === 'ACCOUNT_BANNED') {
        this.isAccountEnable.next(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.syncHandler.reject(error?.message);
      }

      throw error;
    }
  }

  async updateAccountAddress (address: string) {
    const initData = telegramConnector.initData || DEFAULT_INIT_DATA;
    const currentAddress = this.account?.info.address;

    if (currentAddress === address) {
      return;
    }

    const syncData = {
      address,
      initData
    };

    try {
      const account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/login`, syncData);

      account && this.accountSubject.next(account);
    } catch (e) {
      console.error('Error in updateAccountAddress:', e);
    }
  }

  async fetchLeaderboardConfigList () {
    const config = await this.getRequest<Record<string, object>>(`${GAME_API_HOST}/api/leaderboard/get-config`);

    if (config) {
      this.leaderboardConfigSubject.next(config);
      storage.setItem(CACHE_KEYS.leaderboardConfigSubject, JSON.stringify(config)).catch(console.error);
    }
  }

  public get leaderboardConfig () {
    return this.leaderboardConfigSubject.value;
  }

  subscribeLeaderboardConfig () {
    return this.leaderboardConfigSubject;
  }

  async requestSignature (address: string, message: string): Promise<string> {
    const loginMessage = await storage.getItem('loginMessage');

    let loginMap: Record<string, string> = {};

    try {
      loginMap = JSON.parse((await storage.getItem('loginMap') || '{}')) as Record<string, string>;
    } catch (e) {
      console.warn('sync error', e);
    }

    if (loginMessage === message && loginMap[address]) {
      return loginMap[address];
    }

    const result = await signRaw({
      metadata: {
        url: 'https://playnation.app',
        title: detectTranslate('Approve sign-in request'),
        message: detectTranslate('Hit Approve to sign in to Playnation with the following account')
      },
      payload: {
        address,
        type: 'payload',
        data: message
      }
    });

    await storage.setItem('loginMessage', message);
    await storage.setItem('loginMap', JSON.stringify({ ...loginMap, [address]: result.signature }));

    return result.signature;
  }

  async playGame ({ energyUsed, gameEventId, gameId, gameInitData }: { gameId: number, gameEventId?: number, energyUsed: number, gameInitData?: object }): Promise<GamePlay> {
    await this.waitForSync;
    const gamePlay = await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/new-game`, {
      gameId,
      gameEventId,
      gameInitData
    });

    // Update account energy
    const account = this.account;

    if (account) {
      account.attributes.energy -= energyUsed;
      this.accountSubject.next(account);
    }

    if (!gamePlay) {
      throw new Error('Failed to join event');
    }

    this.currentGamePlaySubject.next(gamePlay);

    return gamePlay;
  }

  async getGamePlayById (gamePlayId: number) {
    await this.waitForSync;
    const gamePlay = await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/get-game-play`, {
      gamePlayId
    });

    if (!gamePlay) {
      throw new Error('Failed to join event');
    }

    this.currentGamePlaySubject.next(gamePlay);

    return gamePlay;
  }

  async submitGame ({ gamePlayId, point, signature }: {gamePlayId: number, point: number, signature: string}) {
    let success = false;

    // Try 3 times to submit the game play
    for (let i = 0; i < 3; i++) {
      try {
        await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/submit`, {
          gamePlayId: gamePlayId,
          point: point,
          signature
        });

        success = true;
        break;
      } catch (error) {
        // Wait for 1 second
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.error('Failed to submit game', error);
      }

      if (!success) {
        throw Error('Cannot submit the game');
      }
    }

    this.currentGamePlaySubject.next(undefined);

    await Promise.all([this.reloadAccount(), this.fetchTaskList()]);
  }

  async getLastState (gameId: number) {
    return await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/get-last-state`, {
      gameId
    });
  }

  async submitState ({ gamePlayId, stateData }: {gamePlayId: number, stateData: GameState<any>}) {
    return await this.postRequest<{success: boolean, gamePlay?: GamePlay, error?: string}>(`${GAME_API_HOST}/api/game/submit-state`, {
      gamePlayId,
      stateData
    });
  }

  // --- shop

  async fetchGameItemMap () {
    await this.waitForSync;

    const gameItemMap = await this.postRequest<Record<string, GameItem[]>>(`${GAME_API_HOST}/api/shop/list-items`, {});

    if (gameItemMap) {
      this.gameItemMapSubject.next(gameItemMap);
    }
  }

  subscribeGameItemMap () {
    return this.gameItemMapSubject;
  }

  async fetchGameInventoryItemList () {
    await this.waitForSync;

    const inventoryResponse = await this.getRequest<{ success: boolean; inventory: GameInventoryItem[], inventoryInGame: GameInventoryItem['inventoryInGame'] }>(`${GAME_API_HOST}/api/shop/get-inventory`);

    if (inventoryResponse && inventoryResponse.success) {
      const inventoryItemList = inventoryResponse.inventory;
      const gameInventoryItemInGame = inventoryResponse.inventoryInGame;

      this.gameInventoryItemListSubject.next(inventoryItemList);
      this.gameInventoryItemInGame.next(gameInventoryItemInGame);
    }
  }

  subscribeGameInventoryItemList () {
    return this.gameInventoryItemListSubject;
  }

  async buyItem (gameItemId: number, quantity = 1) {
    await this.postRequest(`${GAME_API_HOST}/api/shop/buy-item`, { gameItemId, quantity });

    await this.fetchGameInventoryItemList();

    await this.fetchGameItemMap();

    await this.reloadAccount();
  }

  async useInventoryItem (gameItemId: number) {
    await this.postRequest(`${GAME_API_HOST}/api/shop/use-inventory-item`, { gameItemId });

    await this.fetchGameInventoryItemList();

    await this.fetchGameItemMap();

    await this.reloadAccount();
  }

  async buyEnergy () {
    await this.postRequest(`${GAME_API_HOST}/api/shop/buy-energy`, {});

    await this.reloadAccount();
  }

  async fetchGameItemInGameList () {
    const gameItem = await this.getRequest<{ success: boolean, items: any }>(`${GAME_API_HOST}/api/shop/get-item-in-game`);

    if (gameItem) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.gameItemInGame.next(gameItem.items);
    }
  }
  // --- shop

  async fetchLeaderboard (id: number, context: Record<string, unknown> = {}) {
    await this.waitForSync;
    const leaderBoard = await this.postRequest<LeaderboardResult>(`${GAME_API_HOST}/api/leaderboard/fetch`, {
      id,
      context
    });

    return leaderBoard;
  }

  async fetchRankInfoMap () {
    const rankMap = {
      iron: {
        minPoint: 0,
        maxPoint: 20000,
        rank: 'iron',
        invitePoint: 200,
        premiumInvitePoint: 600
      },
      bronze: {
        minPoint: 20001,
        maxPoint: 100000,
        rank: 'bronze',
        invitePoint: 500,
        premiumInvitePoint: 1500
      },
      silver: {
        minPoint: 100001,
        maxPoint: 1000000,
        rank: 'silver',
        invitePoint: 1500,
        premiumInvitePoint: 4500
      },
      gold: {
        minPoint: 1000001,
        maxPoint: 5000000,
        rank: 'gold',
        invitePoint: 4500,
        premiumInvitePoint: 13500
      },
      platinum: {
        minPoint: 5000001,
        maxPoint: 20000000,
        rank: 'platinum',
        invitePoint: 13500,
        premiumInvitePoint: 40500
      },
      diamond: {
        minPoint: 20000001,
        maxPoint: 100000000,
        rank: 'diamond',
        invitePoint: 40500,
        premiumInvitePoint: 121500
      }
    } as Record<AccountRankType, RankInfo>;

    if (rankMap) {
      this.rankInfoSubject.next(rankMap);
    }

    return Promise.resolve();
  }

  subscribeRankInfoMap () {
    this.fetchRankInfoMap().catch(console.warn);

    return this.rankInfoSubject;
  }

  async signResult (gamePlayId: string, gameToken: string, score: number): Promise<string> {
    if (this.account) {
      // Implement later
      return await this.requestSignature(this.account?.info.address, `${gamePlayId}|${gameToken}|${score}`);
    } else {
      throw new Error('Account not found');
    }
  }

  async fetchAirdropCampaign () {
    const airdropCampaignResponse = await this.getRequest<AirdropCampaign[]>(`${GAME_API_HOST}/api/airdrop/list-airdrop-campaign`);

    if (airdropCampaignResponse) {
      this.airdropCampaignSubject.next(airdropCampaignResponse);
      localStorage.setItem(CACHE_KEYS.airdropCampaignList, JSON.stringify(airdropCampaignResponse));
    }
  }

  async fetchEligibility (campaignId: number): Promise<AirdropEligibility[]> {
    try {
      const response = await this.postRequest<AirdropEligibility[]>(`${GAME_API_HOST}/api/airdrop/check-eligibility`, { campaign_id: campaignId });

      if (response) {
        this.checkEligibility.next(response);
      }

      return response || [];
    } catch (error) {
      console.error('Error in checkEligibilityList:', error);
      throw error;
    }
  }

  getRewardHistoryList () {
    return this.rewardListSubject.value;
  }

  async fetchRewardList (): Promise<Reward[]> {
    await this.waitForSync;
    const result = await this.postRequest<Reward[]>(`${GAME_API_HOST}/api/airdrop/reward_list`, {});
    const listFilter = result.filter(({ account_id: id }) => id === this.account?.info.id);

    this.rewardListSubject.next(listFilter);

    return listFilter;
  }

  async fetchLeaderboardRewardConfig (leaderboardId: number): Promise<RewardConfigItem[]> {
    try {
      const rewardConfigs = await this.postRequest<RewardConfigItem[]>(`${GAME_API_HOST}/api/airdrop/reward-config`, { leaderboard_id: leaderboardId });

      return rewardConfigs || [];
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getRewardListIsNotChecked (): Promise<Reward[]> {
    const rewardHistory = await storage.getItem(CLOUD_STORAGE_KEYS.rewardHistories);
    let rewardHistoryData: Record<string, RewardHistoryStored> = {};
    let rewardList = this.rewardListSubject.value;

    if (rewardList.length === 0) {
      try {
        rewardList = await this.fetchRewardList();
      } catch (e) {
        console.error('Error in getRewardListIsNotChecked:', e);

        return [];
      }
    }

    try {
      if (rewardHistory) {
        rewardHistoryData = JSON.parse(rewardHistory) as Record<string, RewardHistoryStored>;
      }

      const rewardListFiltered = rewardList.filter((item) => {
        const cloudKey = generateCloudKey([item.airdrop_log_id, item.account_id, item.campaign_id, item.eligibility_id], item.type);

        if (rewardHistoryData[cloudKey]) {
          const prevStatus = getRewardStatus(rewardHistoryData[cloudKey].status);

          if (prevStatus === RewardStatus.PENDING && item.status === RewardStatus.SUCCESS) {
            rewardHistoryData[cloudKey].isCheck = false;
          }

          rewardHistoryData[cloudKey].status = item.status;
        } else {
          rewardHistoryData[cloudKey] = {
            status: item.status,
            isCheck: false
          };
        }

        return !rewardHistoryData[cloudKey].isCheck && item.status !== RewardStatus.EXPIRED;
      });

      await storage.setItem(CLOUD_STORAGE_KEYS.rewardHistories, JSON.stringify(rewardHistoryData));

      return rewardListFiltered;
    } catch (e) {
      console.error('Error in getRewardListIsNotChecked:', e);

      return [];
    }
  }

  async updateRewardHistory (isOnlyPending = false) {
    const rewardHistoryCloudStored = await storage.getItem(CLOUD_STORAGE_KEYS.rewardHistories);

    if (rewardHistoryCloudStored) {
      const rewardHistoryData = JSON.parse(rewardHistoryCloudStored) as Record<string, RewardHistoryStored>;

      Object.keys(rewardHistoryData).forEach((key) => {
        const status = getRewardStatus(rewardHistoryData[key].status);

        if (isOnlyPending && status === RewardStatus.PENDING) {
          rewardHistoryData[key].isCheck = true;
        } else if (!isOnlyPending && (status === RewardStatus.SUCCESS || status === RewardStatus.EXPIRED)) {
          rewardHistoryData[key].isCheck = true;
        }
      });

      await storage.setItem(CLOUD_STORAGE_KEYS.rewardHistories, JSON.stringify(rewardHistoryData));
    }
  }

  subscribeRewardList () {
    return this.rewardListSubject;
  }

  async claimRaffle (airdropLogId: number) {
    try {
      const claim = await this.postRequest(`${GAME_API_HOST}/api/airdrop/claim`, { airdrop_log_id: airdropLogId });

      await this.fetchAirdropCampaign();

      return claim;
    } catch (error) {
      console.error('Error in claimAirdrop:', error);
      throw error;
    }
  }

  // airdrop raffle
  async raffleAirdrop (campaignId: number) {
    try {
      const raffle = await this.postRequest<AirdropRaffle>(`${GAME_API_HOST}/api/airdrop/raffle`, { campaign_id: campaignId });

      await this.fetchAirdropCampaign();
      await this.reloadAccount();

      return raffle;
    } catch (error) {
      console.error('Error in raffleAirdrop:', error);
      throw error;
    }
  }

  // airdrop history
  async fetchAirdropHistory (campaignId: number) {
    try {
      return await this.postRequest<AirdropRewardHistoryLog>(`${GAME_API_HOST}/api/airdrop/history`, { campaign_id: campaignId });
    } catch (error) {
      console.error('Error in fetchAirdropHistory:', error);
      throw error;
    }
  }

  async getAirlyftToken () {
    try {
      return await this.getRequest<{token: string, success: boolean} | undefined>(`${GAME_API_HOST}/api/airlyft/get-token`);
    } catch (error) {
      console.error('Error in fetchAirdropHistory:', error);
      throw error;
    }
  }

  subscribeAirdropCampaign () {
    return this.airdropCampaignSubject;
  }

  getMythicalWallet () {
    return this.mythicalWalletSubject.value;
  }

  subscribeMythicalWallet () {
    return this.mythicalWalletSubject;
  }

  // Singleton
  private static _instance: BookaSdk;

  public static get instance () {
    if (!this._instance) {
      this._instance = new BookaSdk();
    }

    return this._instance;
  }
}
