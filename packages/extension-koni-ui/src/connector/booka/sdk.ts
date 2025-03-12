// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InGameItem } from '@playnation/game-sdk';
import { GameState } from '@playnation/game-sdk/dist/types';
import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler, detectTranslate, wait } from '@subwallet/extension-base/utils';
import { AppMetadata, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { AccountRankType, AirdropCampaign, AirdropEligibility, AirdropRaffle, AirdropRewardHistoryLog, APIResponse, BookaAccount, EnergyConfig, Game, GameInventoryItem, GameItem, GamePlay, IAirdropNftMinting, IntegratedProfileResult, IpAssetParams, IpAssetResponse, LeaderboardPerson, NftMintingEligibility, NftMintingLog, RankInfo, ReferralRecord, Task, TaskCategory } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { SHOW_INSTRUCTION_MODAL } from '@subwallet/extension-koni-ui/constants';
import { signRaw } from '@subwallet/extension-koni-ui/messaging';
import { populateTemplateString } from '@subwallet/extension-koni-ui/utils';
import { formatDateFully } from '@subwallet/extension-koni-ui/utils/date';
import fetch from 'cross-fetch';
import { BehaviorSubject } from 'rxjs';

export const DEFAULT_INIT_DATA = process.env.DEFAULT_INIT_DATA;
export const GAME_API_HOST = process.env.GAME_API_HOST || 'https://game-api.anhmtv.xyz';
export const TELEGRAM_WEBAPP_LINK = process.env.TELEGRAM_WEBAPP_LINK || 'Playnation_bot/app';
export const STORY_BADGE_HOST = process.env.STORY_BADGE_HOST || 'http://localhost:3000';
const storage = SWStorage.instance;
const telegramConnector = TelegramConnector.instance;
const dataNeedClearWhenChangeAccount = [SHOW_INSTRUCTION_MODAL];

const ACCOUNT_POINT_AVAILABLE_IN_BETA = 15000;
// Increase of changing the cache version, we need to clear the cache
// From version 1.2 use localStorage instead of cloudStorage for cache
const CACHE_VERSION = '1.2';
const CACHE_KEYS = {
  account: 'data--account-cache',
  taskCategoryList: 'data--task-category-list-cache',
  taskList: 'data--task-list-cache',
  gameList: 'data--game-list-cache',
  energyConfig: 'data--energy-config-cache',
  rankInfoMap: 'data--rank-info-map-cache',
  leaderboardConfigSubject: 'data--leaderboard-config-list-cache',
  airdropCampaignList: 'data--airdrop-campaign-list-cache',
  airdropNftList: 'data--airdrop-nft-list-cache',
  accountIntegrationProfile: 'data--account-integration-profile-cache'
};

// Get login token from url search params in location
export function getLoginTokenFromUrl (): string | null {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('otp');
}

const OTP = getLoginTokenFromUrl();

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
  private cacheHandler = createPromiseHandler<void>();
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
  private airdropNftMintSubject = new BehaviorSubject<IAirdropNftMinting[]>([]);
  private checkEligibility = new BehaviorSubject<AirdropEligibility[]>([]);
  private leaderboardConfigSubject = new BehaviorSubject<Record<string, object>>({});
  private addressLinkedSubject = new BehaviorSubject<string | undefined>(undefined);
  private addressLinkingSubject = new BehaviorSubject<string | undefined>(undefined);
  private accountIntegrationProfile = new BehaviorSubject<IntegratedProfileResult>({} as IntegratedProfileResult);

  // Special cases
  // Check if the account is banned
  handleAccountAction = new BehaviorSubject<string>('');

  // need remaining to renew token
  needRenewOTP = false;

  constructor () {
    this.initMetadataHandling();
    const version = localStorage.getItem('koni-cache-version');

    console.log('Init sdk with cache version', CACHE_VERSION);

    if (CACHE_VERSION === version) {
      const account = parseCache<BookaAccount>(CACHE_KEYS.account);
      const taskCategoryList = parseCache<TaskCategory[]>(CACHE_KEYS.taskCategoryList);
      const tasks = parseCache<Task[]>(CACHE_KEYS.taskList);
      const game = parseCache<Game[]>(CACHE_KEYS.gameList);
      const energyConfig = parseCache<EnergyConfig>(CACHE_KEYS.energyConfig);
      const airdropCampaignList = parseCache<AirdropCampaign[]>(CACHE_KEYS.airdropCampaignList);
      const airdropNftMintList = parseCache<IAirdropNftMinting[]>(CACHE_KEYS.airdropNftList);
      const rankInfoMap = parseCache<Record<AccountRankType, RankInfo>>(CACHE_KEYS.rankInfoMap);
      const leaderboardConfigSubject = parseCache<Record<string, object>>(CACHE_KEYS.leaderboardConfigSubject);
      const accountIntegrationProfile = parseCache<IntegratedProfileResult>(CACHE_KEYS.accountIntegrationProfile);

      account && this.accountSubject.next(account);
      taskCategoryList && this.taskCategoryListSubject.next(taskCategoryList);
      tasks && this.taskListSubject.next(tasks);
      game && this.gameListSubject.next(game);
      energyConfig && this.energyConfigSubject.next(energyConfig);
      rankInfoMap && this.rankInfoSubject.next(rankInfoMap);
      airdropCampaignList && this.airdropCampaignSubject.next(airdropCampaignList);
      airdropNftMintList && this.airdropNftMintSubject.next(airdropNftMintList);
      leaderboardConfigSubject && this.leaderboardConfigSubject.next(leaderboardConfigSubject);
      accountIntegrationProfile && this.accountIntegrationProfile.next(accountIntegrationProfile);
    } else {
      console.debug('Clearing cache');
      Object.values(CACHE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      localStorage.setItem('koni-cache-version', CACHE_VERSION);
      console.log('Update cache version', CACHE_VERSION);
    }

    this.cacheHandler.resolve();
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

  public get airdropNftMintList () {
    return this.airdropNftMintSubject.value;
  }

  get addressLinked (): string | undefined {
    return this.addressLinkedSubject.value;
  }

  private getRequestHeader (needAuthorize = true) {
    const header: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.account && needAuthorize) {
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

  private async postRequest<T> (url: string, body: any, needAuthorize = true) {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getRequestHeader(needAuthorize),
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

  subscribeAddressLinking (): BehaviorSubject<string | undefined> {
    return this.addressLinkingSubject;
  }

  get addressLinking () {
    return this.addressLinkingSubject.value;
  }

  setAddressLinking (address?: string) {
    this.addressLinkingSubject.next(address);
  }

  async reloadAccount () {
    const account = this.account;
    const newAccountData = await this.getRequest<Omit<BookaAccount, 'token'>>(`${GAME_API_HOST}/api/account/get-attribute`);

    if (account && newAccountData) {
      account.attributes = newAccountData.attributes;
      account.info.address = newAccountData.info.address;
      // @ts-ignore
      account.gameData = newAccountData.gameData;
    }

    this.accountSubject.next(account);
    localStorage.setItem(CACHE_KEYS.account, JSON.stringify(account));
  }

  subscribeAccount () {
    return this.accountSubject;
  }

  subscribeAddressLinked () {
    return this.addressLinkedSubject;
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

  async finishTask (taskId: number, payload: Record<string, unknown>) {
    const data = await this.postRequest(`${GAME_API_HOST}/api/task/submit`, { taskId, ...payload });

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

  public getShareTwitterMintNftURL (item: IAirdropNftMinting) {
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

  async getSignatureMintNft (address: string) {
    const data = await this.postRequest(`${GAME_API_HOST}/api/mint-nft/create-signature`, { address });

    return data as { signature: string, validate: boolean };
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

  clearAccountData () {
    dataNeedClearWhenChangeAccount.forEach((key) => {
      localStorage.removeItem(key);
    });

    this.accountSubject.next(undefined);
  }

  /**
   * Telegram login actions
   * */

  async renewOTP () {
    await this.cacheHandler.promise;

    if (!this.needRenewOTP && this.account?.otp) {
      return this.account?.otp;
    }

    const initData = telegramConnector.initData || DEFAULT_INIT_DATA;
    const referralCode = telegramConnector.getStartParam() || '';

    let account = this.account;

    const syncData = {
      address: undefined,
      referralCode,
      initData
    };

    this.accountSubject.next(undefined);
    account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/login`, {
      ...syncData,
      requestOTP: true
    });
    this.accountSubject.next(account);

    return account.otp;
  }

  async login (address?: string) {
    await this.cacheHandler.promise;

    const initData = telegramConnector.initData || DEFAULT_INIT_DATA;
    const referralCode = telegramConnector.getStartParam() || '';

    let account = this.account;

    const syncData = {
      address,
      referralCode,
      initData
    };

    try {
      // Re-login with new data
      if (initData) {
        this.accountSubject.next(undefined);
        account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/login`, {
          ...syncData,
          requestOTP: true
        });
        this.accountSubject.next(account);
        await this.fetchMetadata();
        this.handleAccountAction.next('login-pwa-confirm');
        setTimeout(() => {
          this.needRenewOTP = true;
        }, 1000 * 60 * 2.5);

        return;
      } else if (OTP) {
        this.clearAccountData();
        account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/login-by-otp`, { otp: OTP });

        this.handleAccountAction.next('login-success');
      } else if (this.account) {
        // Todo: Check limit time to access to latest token
        account = this.account;
      }

      if (account) {
        this.accountSubject.next(account);
        localStorage.setItem(CACHE_KEYS.account, JSON.stringify(account));
        this.addressLinkedSubject.next(account.info.address);

        this.syncHandler.resolve();

        await Promise.all([
          this.fetchEnergyConfig(),
          this.fetchRankInfoMap(),
          this.fetchGameList(),
          this.fetchTaskCategoryList(),
          this.fetchTaskList(),
          this.fetchLeaderboardConfigList(),
          this.fetchAirdropCampaign(),
          this.fetchNftAirdrop(),
          this.fetchMetadata()
          // this.fetchGameItemMap(),
          // this.fetchGameInventoryItemList(),
          // this.fetchGameItemInGameList()
        ]);

        this.autoSyncMintingLog();
      } else {
        throw new Error('CANNOT_LOGIN');
      }
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.message === 'ACCOUNT_BANNED') {
        this.handleAccountAction.next('baned');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.syncHandler.reject(error?.message);
      } else {
        console.error('Failed to login', error);
        this.handleAccountAction.next('login-failed');
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

  subscribeAirdropNftMint () {
    return this.airdropNftMintSubject;
  }

  // airdrop history
  async fetchNftAirdrop () {
    const { promise, resolve } = createPromiseHandler<void>();

    await wait(1000);

    const getUCTPlus7 = (dateString: string) => {
      // Split the input date string into components (e.g., "2024-11-20 07:00")
      const [datePart, timePart] = dateString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number); // Parse date
      const [hours, minutes] = timePart.split(':').map(Number); // Parse time

      // Create a UTC+7 date object manually
      return new Date(Date.UTC(year, month - 1, day, hours - 7, minutes));
    };

    const eligibilityList = [
      {
        id: 1,
        name: 'Hunt at least 19,999 SP accumulated from 07 Nov to 05 Dec',
        start: getUCTPlus7('2024-11-07 07:00'),
        end: getUCTPlus7('2024-12-05 07:00')
      },
      {
        id: 2,
        name: 'Haven’t minted Phase 1 badge'
      }
    ];

    this.airdropNftMintSubject.next([{
      id: 1,
      name: 'Koni Story badge',
      icon: '/images/mint-event-logo.png',
      nft_url: '/images/default-nft-logo.png',
      banner: '',
      start_snapshot: getUCTPlus7('2024-12-05 10:00'),
      start_mint: getUCTPlus7('2024-12-06 10:00'),
      network: 'Polkadot',
      total_badges: 5000,
      sub_title: 'Phase 2',
      symbol: 'badge',
      // decimal: number;
      // method: string;
      // raffle_count: number;
      start: getUCTPlus7('2024-12-02 07:00'),
      end: getUCTPlus7('2024-12-09 12:00'),
      conditionDescription: '',
      share: {
        url_share: 'https://x.koni.studio/mint-badge',
        content: `Odyssey Testnet is LIVE! Have fun with easy-peasy tasks and earn the exclusive Koni Story badge through your IPventure 👑
        %0ALast chance to become an @StoryProtocol OG before mainnet launch 💨
        %0AJoin now 👇`
      },
      description: `
      <p>
          Let your IPventure begin by participating in the campaign now for a chance to earn the exclusive Koni Story badge!
        </p>

        <h2>Who we are</h2>

        <p>
          Koni Story is a unified Telegram mini app that lets you bring your IPs to life. With Koni Story, you can create unique
          stories in your adventure — an IPventure that activates creativity, participation, and cross-community collaboration
          through story-writing and Story World exploration within the Story ecosystem.
        </p>

        <h2>
          How does the badge work?
        </h2>

        <p>
          Each Koni Story badge is a soul-bound token signifying your active involvement in our campaign during Odyssey testnet
          and can only be earned ONCE per user.
        </p>

        <h2>
            How to hunt Koni Story badge Phase 2?
        </h2>

        <p>
          👉Hunt at least 19,999 SP accumulated from Nov 07 to Dec 05
        </p>

        <p>
          👉Haven’t minted Phase 1 badge
        </p>

        <h2>
          For Odyssey Badge Program Hunters
        </h2>

        <p>
          Those who have minted badges from projects on Story ecosystem will receive a
          <b>special bonus!</b>
        </p>
      `,
      shortDescription: '',
      // tokenDistributions: JSON;
      // npsDistributions: JSON;
      // share: AirdropCampaignShare;
      token_slug: 'DOT',
      status: 'active',
      // createdAt: Date;
      // updatedAt: Date;
      eligibilityList: eligibilityList,
      eligibilityIds: [1]
    }]);

    resolve();

    return promise;
  }

  async nftMintingCheckEligible (address: string, campaign = 'default') {
    const data = await this.postRequest<APIResponse<NftMintingEligibility>>(`${GAME_API_HOST}/api/mint-nft/check-eligible`, { address, campaign });

    return data.data;
  }

  private mintingLogSubject = new BehaviorSubject<{
    isFetched: boolean;
    data?: NftMintingLog;
  }>({ isFetched: false });

  async getNftMintingLog (campaign = 'default') {
    await this.syncHandler.promise;
    const data = await this.postRequest<APIResponse<NftMintingLog>>(`${GAME_API_HOST}/api/mint-nft/get-mint`, { campaign });

    this.mintingLogSubject.next({ isFetched: true, data: data.data });

    return data.data;
  }

  subscribeNftMintingLog () {
    return this.mintingLogSubject;
  }

  autoSyncMintingLog () {
    let runCheck = false;

    this.mintingLogSubject.subscribe((data) => {
      runCheck = data.data?.status === 'minting' || data.data?.status === 'submitted';
    });

    setInterval(() => {
      if (runCheck) {
        this.getNftMintingLog().catch(console.error);
      }
    }, 10000);
  }

  async nftMintingRequestSignature (address: string, campaign = 'default') {
    const data = await this.postRequest<APIResponse<NftMintingLog>>(`${GAME_API_HOST}/api/mint-nft/request-signature`, { address, campaign });

    this.mintingLogSubject.next({ isFetched: true, data: data.data });

    return data.data;
  }

  async nftMintingStart (extrinsicHash?: string, campaign = 'default') {
    const data = await this.postRequest<APIResponse<NftMintingLog>>(`${GAME_API_HOST}/api/mint-nft/start-mint`, { campaign, extrinsicHash });

    this.mintingLogSubject.next({ isFetched: true, data: data.data });

    return data.data;
  }

  async getMintedAddress () {
    const data = await this.getRequest<{ address: string, status: boolean }>(`${GAME_API_HOST}/api/integrated-profile/get-minted-address`);

    return data?.address;
  }

  async setAccountAddress (address: string) {
    const data = await this.postRequest<{ status: boolean }>(`${GAME_API_HOST}/api/integrated-profile/set-account-address`, { address });

    if (!data.status) {
      throw new Error('Address already registered');
    } else {
      this.addressLinkedSubject.next(address);
      await this.reloadAccount();
    }
  }

  async getStatsOfAddress () {
    const data = await this.getRequest<IntegratedProfileResult>(`${GAME_API_HOST}/api/integrated-profile/account-profile-stats`);

    if (data) {
      this.accountIntegrationProfile.next(data);
      localStorage.setItem(CACHE_KEYS.accountIntegrationProfile, JSON.stringify(data));
    }

    return data || {} as IntegratedProfileResult;
  }

  async checkAccountAvailableBetaVersion () {
    try {
      const checkWhiteList = async () => {
        const data = await this.getRequest<{ status: boolean }>(`${GAME_API_HOST}/api/integrated-profile/check-telegram-whitelist`);

        return !!data?.status;
      };

      const checkAccountMinted = async () => {
        return !!(await this.getMintedAddress());
      };

      const checkAccountPoint = async () => {
        return new Promise<boolean>((resolve) => {
          if (this.account) {
            resolve((this.account.attributes.accumulatePoint >= ACCOUNT_POINT_AVAILABLE_IN_BETA));
          } else {
            this.subscribeAccount().subscribe((account) => {
              if (account) {
                resolve(account.attributes.accumulatePoint >= ACCOUNT_POINT_AVAILABLE_IN_BETA);
              }
            });
          }
        });
      };

      await this.waitForSync;

      return (await Promise.all([checkWhiteList()])).some((condition) => condition);
    } catch (e) {
      console.error(e);

      return false;
    }
  }

  subscribeAccountIntegrationProfile () {
    return this.accountIntegrationProfile;
  }

  registerIPAsset (ipParams: IpAssetParams) {
    return this.postRequest<IpAssetResponse>(`${GAME_API_HOST}/api/ip-asset/register`, ipParams);
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
