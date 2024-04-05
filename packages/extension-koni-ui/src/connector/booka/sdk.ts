// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWStorage } from '@subwallet/extension-base/storage';
import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { TelegramUser, TelegramWebApp } from '@subwallet/extension-base/utils/telegram';
import { BookaAccount, BookaEvent, BookaEventType, BuyInGameItemResponse, GameSDK, GetLeaderboardRequest, GetLeaderboardResponse, HapticFeedbackType, InGameItem, Player, PlayResponse, SDKInitParams, Tournament, UseInGameItemResponse } from '@subwallet/extension-koni-ui/connector/booka/types';
import { signRaw } from '@subwallet/extension-koni-ui/messaging';
import fetch from 'cross-fetch';

export const BOOKA_API_HOST = 'https://booka-api.koni.studio';
const storage = SWStorage.instance;

export class BookaSdk implements GameSDK {
  private account?: BookaAccount;
  private accountHandler = createPromiseHandler<BookaAccount>();
  private EventTypeMap: Record<string, BookaEventType> = {};

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

  async sync (address: string) {
    const message = `Login as ${TelegramUser?.username || 'booka'}`;
    const signature = await this.requestSignature(address, message);

    if (this.account) {
      this.account = undefined;
      this.accountHandler = createPromiseHandler<BookaAccount>();
    }

    const syncData = {
      address,
      signature,
      telegramId: TelegramUser?.id || 111,
      telegramUsername: TelegramUser?.username || 'booka',
      isBot: !!TelegramUser?.is_bot,
      addedToAttachMenu: !!TelegramUser?.added_to_attachment_menu,
      firstName: TelegramUser?.first_name || 'Booka',
      lastName: TelegramUser?.last_name || 'Gaming',
      photoUrl: TelegramUser?.photo_url,
      languageCode: TelegramUser?.language_code || 'en'
    };

    const account = await this.postRequest<BookaAccount>(`${BOOKA_API_HOST}/api/account/sync`, syncData);

    if (account) {
      this.account = account;
      this.accountHandler.resolve(account);

      await this.fetchEventTypeMap();

      await new Promise((resolve) => setTimeout(resolve, 3000));

      TelegramWebApp.showConfirm(`Current Point: ${account.attributes.point}. Do you want play game?`, (confirm) => {
        if (confirm) {
          (async () => {
            const game = await this.play('play_booka');

            await new Promise((resolve) => setTimeout(resolve, 1000));

            await this.trackScore(game.gamePlayId, 99);

            TelegramWebApp.showAlert(`Total point: ${this.account?.attributes.point || 0}. Thank you for playing game!`);
          })().catch(console.error);
        }
      });
    } else {
      this.accountHandler.reject(new Error('Failed to sync account'));
    }
  }

  async fetchEventTypeMap () {
    const eventTypes = await this.getRequest<BookaEventType[]>(`${BOOKA_API_HOST}/api/event/event-types`);

    if (eventTypes) {
      this.EventTypeMap = [...eventTypes].reduce((acc, eventType) => {
        acc[eventType.slug] = eventType;

        return acc;
      }, {} as Record<string, BookaEventType>);
    } else {
      this.EventTypeMap = {};
    }

    console.log('Event Type Map', this.EventTypeMap);
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

  buyInGameItem (itemId: string, gameplayId?: string): Promise<BuyInGameItemResponse> {
    // Implement later
    return Promise.resolve({
      receipt: '',
      item: {
        id: '',
        name: '',
        price: 0
      }
    });
  }

  buyTickets (): Promise<{ balance: number; tickets: number }> {
    // Implement later
    return Promise.resolve({ balance: 0, tickets: 0 });
  }

  exit (confirm: boolean): void {
    // Implement later
  }

  exitToListGames (confirm: boolean): void {
    // Implement later
  }

  getInGameItems (): Promise<{ items: InGameItem[] }> {
    // Implement later
    return Promise.resolve({ items: [] });
  }

  getLeaderboard (req: GetLeaderboardRequest): Promise<GetLeaderboardResponse> {
    // Implement later
    return Promise.resolve({
      players: []
    });
  }

  async getPlayer (): Promise<Player> {
    const account = await this.accountHandler.promise;

    return {
      id: account.info.id.toString(),
      name: `${account.info.firstName || ''} ${account.info.lastName || ''}`,
      energy: account.attributes.energy,
      balance: account.attributes.point
    } as Player;
  }

  getTournament (): Promise<Tournament | undefined> {
    // Implement later
    return Promise.resolve(undefined);
  }

  getVersion (): string {
    // Implement later
    return '0.1';
  }

  init (params: SDKInitParams): Promise<{ currentTimestamp: string }> {
    return Promise.resolve({ currentTimestamp: '' });
  }

  private runningEvent: BookaEvent | undefined;

  async play (game = 'play_booka'): Promise<PlayResponse> {
    const event = await this.postRequest<BookaEvent>(`${BOOKA_API_HOST}/api/event/join`, {
      slug: game
    });

    if (!event) {
      throw new Error('Failed to join event');
    }

    this.runningEvent = event;

    return {
      gamePlayId: event.id.toString(),
      token: event.token,
      remainingTickets: event?.energy
    } as PlayResponse;
  }

  showLeaderboard (): Promise<void> {
    // Implement later
    return Promise.resolve(undefined);
  }

  showShop (): Promise<void> {
    // Implement later
    return Promise.resolve(undefined);
  }

  async signResult (gamePlayId: string, gameToken: string, score: number): Promise<string> {
    if (this.account) {
      // Implement later
      return await this.requestSignature(this.account?.info.address, `${gamePlayId}|${gameToken}|${score}`);
    } else {
      throw new Error('Account not found');
    }
  }

  private async reloadAccount () {
    const account = await this.getRequest<Omit<BookaAccount, 'token'>>(`${BOOKA_API_HOST}/api/account/get-attribute`);

    if (this.account && account) {
      this.account.info = account.info;
      this.account.attributes = account.attributes;
    }
  }

  async trackScore (gamePlayId: string, score: number): Promise<void> {
    const runningEvent = this.runningEvent;

    if (runningEvent && gamePlayId === runningEvent.id.toString()) {
      // const signature = await this.signResult(runningEvent.id.toString(), runningEvent.token, score);
      const event = await this.postRequest<BookaEvent>(`${BOOKA_API_HOST}/api/event/submit`, {
        eventId: runningEvent.id,
        signature: '0xxxxxxxx',
        point: score
      });

      if (!event) {
        throw new Error('Failed to join event');
      }

      this.runningEvent = undefined;

      if (event.success) {
        console.log('Event success', score);
      }
    } else {
      throw new Error('Game not found');
    }

    await this.reloadAccount();
  }

  triggerHapticFeedback (type: HapticFeedbackType): Promise<void> {
    // Implement later
    return Promise.resolve(undefined);
  }

  useInGameItem (itemId: string, gamePlayId: string): Promise<UseInGameItemResponse> {
    // Implement later
    return Promise.resolve({
      success: true,
      inventory: [{
        itemId: '',
        quantity: 0
      }]
    });
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
