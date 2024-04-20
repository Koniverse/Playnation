// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { BookaAccount, Game, GamePlay, LeaderboardPerson, ReferralRecord, Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { signRaw } from '@subwallet/extension-koni-ui/messaging';
import fetch from 'cross-fetch';
import { BehaviorSubject } from 'rxjs';

export const GAME_API_HOST = process.env.GAME_API_HOST || 'http://localhost:3001';
export const TELEGRAM_WEBAPP_LINK = process.env.TELEGRAM_WEBAPP_LINK || 'BookaGamesBot/swbooka';
const storage = SWStorage.instance;
const telegramConnector = TelegramConnector.instance;

const CACHE_KEYS = {
  account: 'data--account-cache',
  taskList: 'data--task-list-cache',
  gameList: 'data--game-list-cache'
};

export class BookaSdk {
  private syncHandler = createPromiseHandler<void>();
  private accountSubject = new BehaviorSubject<BookaAccount | undefined>(undefined);
  private taskListSubject = new BehaviorSubject<Task[]>([]);
  private gameListSubject = new BehaviorSubject<Game[]>([]);
  private currentGamePlaySubject = new BehaviorSubject<GamePlay | undefined>(undefined);
  private leaderBoardSubject = new BehaviorSubject<LeaderboardPerson[]>([]);
  private referralListSubject = new BehaviorSubject<ReferralRecord[]>([]);

  constructor () {
    storage.getItems(Object.values(CACHE_KEYS)).then(([account, tasks, game]) => {
      if (account) {
        try {
          const accountData = JSON.parse(account) as BookaAccount;

          this.accountSubject.next(accountData);
        } catch (e) {
          console.error('Failed to parse account data', e);
        }
      }

      if (tasks) {
        try {
          const taskList = JSON.parse(tasks) as Task[];

          this.taskListSubject.next(taskList);
        } catch (e) {
          console.error('Failed to parse task list', e);
        }
      }

      if (game) {
        try {
          const gameList = JSON.parse(game) as Game[];

          this.gameListSubject.next(gameList);
        } catch (e) {
          console.error('Failed to parse game list', e);
        }
      }
    }).catch(console.error);
  }

  public get waitForSync () {
    return this.syncHandler.promise;
  }

  public get account () {
    return this.accountSubject.value;
  }

  public get taskList () {
    return this.taskListSubject.value;
  }

  public get gameList () {
    return this.gameListSubject.value;
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
    const request = await fetch(url, {
      method: 'POST',
      headers: this.getRequestHeader(),
      body: JSON.stringify(body)
    });

    if (request.status === 200 || request.status === 304) {
      return (await request.json()) as unknown as T;
    } else {
      return undefined;
    }
  }

  private async reloadAccount () {
    const account = this.account;
    const newAccountData = await this.getRequest<Omit<BookaAccount, 'token'>>(`${GAME_API_HOST}/api/account/get-attribute`);

    if (account && newAccountData) {
      account.attributes = newAccountData.attributes;
    }

    this.accountSubject.next(account);
    storage.setItem(CACHE_KEYS.account, JSON.stringify(account)).catch(console.error);
  }

  subscribeAccount () {
    return this.accountSubject;
  }

  async fetchGameList () {
    const gameList = await this.getRequest<Game[]>(`${GAME_API_HOST}/api/game/fetch`);

    if (gameList) {
      this.gameListSubject.next(gameList);
      storage.setItem(CACHE_KEYS.gameList, JSON.stringify(gameList)).catch(console.error);
    }
  }

  subscribeGameList () {
    return this.gameListSubject;
  }

  async fetchTaskList () {
    await this.waitForSync;
    const taskList = await this.getRequest<Task[]>(`${GAME_API_HOST}/api/task/history`);

    if (taskList) {
      this.taskListSubject.next(taskList);
      storage.setItem(CACHE_KEYS.taskList, JSON.stringify(taskList)).catch(console.error);
    }
  }

  subscribeTaskList () {
    return this.taskListSubject;
  }

  async finishTask (taskId: number) {
    await this.postRequest(`${GAME_API_HOST}/api/task/submit`, { taskId });

    await this.fetchTaskList();

    await this.reloadAccount();
  }

  getInviteURL (): string {
    return `https://t.me/${TELEGRAM_WEBAPP_LINK}?startapp=${this.account?.info.inviteCode || 'booka'}`;
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
      lastName: userInfo?.last_name || 'Gaming',
      photoUrl: userInfo?.photo_url,
      isPremium: userInfo?.is_premium,
      languageCode: userInfo?.language_code || 'en'
    };

    const account = await this.postRequest<BookaAccount>(`${GAME_API_HOST}/api/account/sync`, syncData);

    if (account) {
      this.accountSubject.next(account);
      storage.setItem(CACHE_KEYS.account, JSON.stringify(account)).catch(console.error);
      this.syncHandler.resolve();

      await Promise.all([this.fetchGameList(), this.fetchTaskList(), this.fetchLeaderboard()]);
    } else {
      throw new Error('Failed to sync account');
    }
  }

  async requestSignature (address: string, message: string): Promise<string> {
    const loginMessage = await storage.getItem('loginMessage');

    let loginMap: Record<string, string> = {};

    try {
      loginMap = JSON.parse((await storage.getItem('loginMap') || '{}')) as Record<string, string>;
    } catch (e) {
      console.log('sync error', e);
    }

    if (loginMessage === message && loginMap[address]) {
      return loginMap[address];
    }

    const result = await signRaw({
      address,
      type: 'payload',
      data: message
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
    await this.postRequest<GamePlay>(`${GAME_API_HOST}/api/game/submit`, {
      gamePlayId: gamePlayId,
      point: point,
      signature
    });

    this.currentGamePlaySubject.next(undefined);

    await Promise.all([this.reloadAccount()]);
  }

  async fetchLeaderboard () {
    await this.waitForSync;
    const leaderBoard = await this.getRequest<LeaderboardPerson[]>(`${GAME_API_HOST}/api/game/leader-board`);

    if (leaderBoard) {
      this.leaderBoardSubject.next(leaderBoard);
    }
  }

  subscribeLeaderboard () {
    this.fetchLeaderboard().catch(console.error);

    return this.leaderBoardSubject;
  }

  async signResult (gamePlayId: string, gameToken: string, score: number): Promise<string> {
    if (this.account) {
      // Implement later
      return await this.requestSignature(this.account?.info.address, `${gamePlayId}|${gameToken}|${score}`);
    } else {
      throw new Error('Account not found');
    }
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
