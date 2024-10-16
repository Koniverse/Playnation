// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InGameItem } from '@playnation/game-sdk';
import { GameState } from '@playnation/game-sdk/dist/types';
import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler, detectTranslate } from '@subwallet/extension-base/utils';
import { AppMetadata, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { AccountRankType, AirdropCampaign, AirdropEligibility, AirdropRaffle, AirdropRewardHistoryLog, BookaAccount, EnergyConfig, Game, GameInventoryItem, GameItem, GamePlay, LeaderboardPerson, RankInfo, ReferralRecord, Task, TaskCategory } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { signRaw } from '@subwallet/extension-koni-ui/messaging';
import { populateTemplateString } from '@subwallet/extension-koni-ui/utils';
import { formatDateFully } from '@subwallet/extension-koni-ui/utils/date';
import fetch from 'cross-fetch';
import { BehaviorSubject } from 'rxjs';

export const GAME_API_HOST = process.env.GAME_API_HOST || 'https://game-api.anhmtv.xyz';
export const TELEGRAM_WEBAPP_LINK = process.env.TELEGRAM_WEBAPP_LINK || 'Playnation_bot/app';
const storage = SWStorage.instance;
const telegramConnector = TelegramConnector.instance;

// Increase of changing the cache version, we need to clear the cache
// From version 1.2 use localStorage instead of cloudStorage for cache
const cacheVersion = '1.2';
const CACHE_KEYS = {
  account: 'data--account-cache',
  taskCategoryList: 'data--task-category-list-cache',
  taskList: 'data--task-list-cache',
  gameList: 'data--game-list-cache',
  energyConfig: 'data--energy-config-cache',
  rankInfoMap: 'data--rank-info-map-cache',
  leaderboardConfigSubject: 'data--leaderboard-config-list-cache',
  airdropCampaignList: 'data--airdrop-campaign-list-cache'
};

function parseCache<T> (key: string): T | undefined {
  const data = localStorage.getItem(key);

  if (data) {
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Failed to parse cache', e);
    }
  }

  return undefined;
}

const metadataHandler = MetadataHandler.instance;

export class BookaSdk {
  private syncHandler = createPromiseHandler<void>();
  private accountSubject = new BehaviorSubject<BookaAccount | undefined>(undefined);
  private taskListSubject = new BehaviorSubject<Task[]>([]);
  private taskCategoryListSubject = new BehaviorSubject<TaskCategory[]>([]);
  private gameListSubject = new BehaviorSubject<Game[]>([]);
  private currentGamePlaySubject = new BehaviorSubject<GamePlay | undefined>(undefined);
  private leaderBoardSubject = new BehaviorSubject<LeaderboardPerson[]>([]);
  private referralListSubject = new BehaviorSubject<ReferralRecord[]>([]);
  private gameItemMapSubject = new BehaviorSubject<Record<string, GameItem[]>>({});
  private gameInventoryItemListSubject = new BehaviorSubject<GameInventoryItem[]>([]);
  private gameInventoryItemInGame = new BehaviorSubject<GameInventoryItem['inventoryInGame']>({});
  private gameItemInGame = new BehaviorSubject<Record<string, InGameItem>>({});
  private energyConfigSubject = new BehaviorSubject<EnergyConfig | undefined>(undefined);
  private rankInfoSubject = new BehaviorSubject<Record<AccountRankType, RankInfo> | undefined>(undefined);
  private airdropCampaignSubject = new BehaviorSubject<AirdropCampaign[]>([]);
  private checkEligibility = new BehaviorSubject<AirdropEligibility[]>([]);
  private leaderboardConfigSubject = new BehaviorSubject<Record<string, object>>({});

  // Special cases
  // Check if the account is banned
  isAccountEnable = new BehaviorSubject<boolean>(true);

  constructor () {
    this.initMetadataHandling();
    const version = localStorage.getItem('cache-version');

    if (cacheVersion === version) {
      const account = parseCache<BookaAccount>(CACHE_KEYS.account);
      const taskCategoryList = parseCache<TaskCategory[]>(CACHE_KEYS.taskCategoryList);
      const tasks = parseCache<Task[]>(CACHE_KEYS.taskList);
      const game = parseCache<Game[]>(CACHE_KEYS.gameList);
      const energyConfig = parseCache<EnergyConfig>(CACHE_KEYS.energyConfig);
      const airdropCampaignList = parseCache<AirdropCampaign[]>(CACHE_KEYS.airdropCampaignList);
      const rankInfoMap = parseCache<Record<AccountRankType, RankInfo>>(CACHE_KEYS.rankInfoMap);
      const leaderboardConfigSubject = parseCache<Record<string, object>>(CACHE_KEYS.leaderboardConfigSubject);

      account && this.accountSubject.next(account);
      taskCategoryList && this.taskCategoryListSubject.next(taskCategoryList);
      tasks && this.taskListSubject.next(tasks);
      game && this.gameListSubject.next(game);
      energyConfig && this.energyConfigSubject.next(energyConfig);
      rankInfoMap && this.rankInfoSubject.next(rankInfoMap);
      airdropCampaignList && this.airdropCampaignSubject.next(airdropCampaignList);
      leaderboardConfigSubject && this.leaderboardConfigSubject.next(leaderboardConfigSubject);
    } else {
      console.debug('Clearing cache');
      storage.removeItems(Object.keys(CACHE_KEYS).concat(['cache-version'])).catch(console.error);
      Object.keys(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      localStorage.setItem('cache-version', cacheVersion);
    }
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

  public get gameList () {
    return this.gameListSubject.value;
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
    return this.referralListSubject.value;
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
      return (await request.json()) as unknown as T;
    } else {
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

      throw new Error(errorResponse.error || 'Bad request');
    }

    return await response.json() as T;
  }

  initMetadataHandling () {
    this.fetchMetadata().then((metadata) => {
      metadata && metadataHandler.updateMetadata(metadata);
    }).catch(console.error);

    setInterval(() => {
      this.fetchMetadata().then((metadata) => {
        metadata && metadataHandler.updateMetadata(metadata);
      }).catch(console.error);
    }, 30000);

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
    return await this.getRequest<AppMetadata>(`${GAME_API_HOST}/api/metadata/fetch`);
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
  }

  subscribeTaskCategoryList () {
    return this.taskCategoryListSubject;
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

  async completeTask (taskId: number | undefined) {
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

  public getShareTwitterAirdropURL (item: AirdropCampaign) {
    if (!item.share) {
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

  async fetchReferalList () {
    await this.waitForSync;
    const refList = await this.getRequest<ReferralRecord[]>(`${GAME_API_HOST}/api/account/get-rerferal-logs`);

    if (refList) {
      this.referralListSubject.next(refList);
    }
  }

  subscribeReferralList () {
    this.fetchReferalList().catch(console.error);

    return this.referralListSubject;
  }

  async sync (address: string) {
    const userInfo = telegramConnector.userInfo;
    const message = `Login as ${userInfo?.username || 'booka'}`;
    const signature = await this.requestSignature(address, message);
    const referralCode = telegramConnector.getStartParam() || '';

    this.accountSubject.next(undefined);

    const syncData = {
      address,
      signature,
      referralCode,
      telegramId: userInfo?.id || 111,
      telegramUsername: userInfo?.username || 'booka',
      isBot: !!userInfo?.is_bot,
      addedToAttachMenu: !!userInfo?.added_to_attachment_menu,
      firstName: userInfo?.first_name || 'Booka',
      lastName: userInfo?.last_name || '',
      photoUrl: userInfo?.photo_url,
      isPremium: userInfo?.is_premium,
      languageCode: userInfo?.language_code || 'en'
    };

    try {
      const account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/sync`, syncData);

      if (account) {
        this.accountSubject.next(account);
        localStorage.setItem(CACHE_KEYS.account, JSON.stringify(account));
        this.syncHandler.resolve();

        await Promise.all([
          this.fetchEnergyConfig(),
          this.fetchRankInfoMap(),
          this.fetchGameList(),
          this.fetchTaskCategoryList(),
          this.fetchTaskList(),
          this.fetchLeaderboardConfigList()
          // this.fetchGameItemMap(),
          // this.fetchGameInventoryItemList(),
          // this.fetchGameItemInGameList()
        ]);

        await Promise.all([this.fetchGameList(), this.fetchTaskList(), this.fetchAirdropCampaign()]);
      }
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.message === 'ACCOUNT_BANNED') {
        this.isAccountEnable.next(false);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.syncHandler.reject(error?.message);
      }

      throw error;
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

  async playGame (gameId: number, energyUsed: number): Promise<GamePlay> {
    await this.waitForSync;
    const gamePlay = await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/new-game`, {
      gameId
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

  async submitGame (gamePlayId: number, point: number, signature: string) {
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

  async submitState (gamePlayId: number, stateData: GameState<any>) {
    return await this.postRequest<{success: boolean}>(`${GAME_API_HOST}/api/game/submit-state`, {
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
    const leaderBoard = await this.postRequest<LeaderboardPerson[]>(`${GAME_API_HOST}/api/leaderboard/fetch`, {
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

  // Singleton
  private static _instance: BookaSdk;

  public static get instance () {
    if (!this._instance) {
      this._instance = new BookaSdk();
    }

    return this._instance;
  }
}
