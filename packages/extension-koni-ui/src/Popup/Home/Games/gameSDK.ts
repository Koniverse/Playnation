// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BuyInGameItemResponse, ErrorCode, GetLeaderboardRequest, GetLeaderboardResponse, HapticFeedbackType, InGameItem, Player, PlaynationSDKError, PlayResponse, SDKInitParams, Tournament, UpdateStatePayload, UseInGameItemResponse } from '@playnation/game-sdk';
import { GameState } from '@playnation/game-sdk/dist/types';
import { SWStorage } from '@subwallet/extension-base/storage';
import { addLazy, createPromiseHandler, removeLazy } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game } from '@subwallet/extension-koni-ui/connector/booka/types';
import { camelCase } from 'lodash';
import z from 'zod';

export interface GameAppOptions {
  viewport: HTMLIFrameElement;
  apiSDK: BookaSdk;
  currentGameInfo: Game;
  onExit: () => void;
}

const cloudStorage = SWStorage.instance;

export class GameApp {
  private listener = this._onMessage.bind(this);
  private options: GameAppOptions;
  private viewport: HTMLIFrameElement;
  private apiSDK: BookaSdk;
  private currentGameInfo: Game;
  private inventoryQuantityMap: Record<string, number> = {};
  private gameItemInGame: Record<string, InGameItem> = {};

  private gameStateHandler = createPromiseHandler<GameState<any>>();
  private theLastSignature = '';

  constructor (options: GameAppOptions) {
    this.options = options;
    this.viewport = options.viewport;
    this.apiSDK = options.apiSDK;
    this.currentGameInfo = options.currentGameInfo;
    this.inventoryQuantityMap = this.apiSDK.gameInventoryItemInGameList;
    this.gameItemInGame = this.apiSDK.gameItemInGameList;

    this.getLatestGameState().catch(console.error);
  }

  start () {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.addEventListener('message', this.listener);
  }

  stop () {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    window.removeEventListener('message', this.listener);
  }

  onInit (params: SDKInitParams) {
    console.log('Init game with params', params);
    // Todo: Send client id into game
  }

  onGetEnergyPerGame () {
    return this.currentGameInfo.energyPerGame;
  }

  async onGetPlayer () {
    const account = this.apiSDK.account;
    const playerId = `${account?.info?.telegramId || 'player'}-${account?.info.id || 0}`;
    const gameData = (account?.gameData || []).find((item) => item.gameId === this.currentGameInfo.id);
    const point = gameData?.point || 0;

    const state = await this.gameStateHandler.promise;

    const player: Player = {
      id: playerId,
      balance: point,
      name: `${account?.info?.firstName || ''} ${account?.info?.lastName || ''}` || 'Player',
      avatar: 'https://thispersondoesnotexist.com/',
      energy: account?.attributes?.energy || 0,
      pointConversionRate: this.currentGameInfo.pointConversionRate || 0,
      gameEnergy: this.currentGameInfo.energyPerGame,
      level: 1,
      inventory: Object.entries(this.inventoryQuantityMap)
        .map(([id, quantity]) => ({
          itemId: id,
          quantity
        })),
      balanceNPS: account?.attributes.point || 0,
      state
    };

    return player;
  }

  onGetTournament (): Tournament {
    const account = this.apiSDK.account;
    const currentGame = this.currentGameInfo;

    if (!account || !currentGame) {
      throw newError('invalid account or game', ErrorCode.SYSTEM_ERROR);
    }

    const tickets = Math.floor((account.attributes.energy + 0.3) / currentGame.energyPerGame);

    const tour: Tournament = {
      id: 'tour1',
      name: 'Tour 01',
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      entryFee: 1,
      entryTickets: 10,
      prizePool: {
        total: 10
      },
      tickets: tickets,
      totalPlayers: 100
    };

    return tour;
  }

  onGetIngameItems () {
    const items = Object.values(this.gameItemInGame);

    return { items };
  }

  async onPlay () {
    const account = this.apiSDK.account;
    const currentGame = this.currentGameInfo;
    const energy = account?.attributes.energy || 0;

    if (energy < currentGame.energyPerGame) {
      throw newError('Not enought energy', ErrorCode.NOT_ENOUGH_ENERGY);
    }

    const gamePlay = await this.apiSDK.playGame(this.currentGameInfo.id, this.currentGameInfo.energyPerGame);

    if (!account || !currentGame) {
      throw newError('invalid account or game', ErrorCode.SYSTEM_ERROR);
    }

    const remainingEnergy = account.attributes.energy - currentGame.energyPerGame;

    const res: PlayResponse = {
      token: gamePlay.token,
      remainingTickets: Math.floor(remainingEnergy / currentGame.energyPerGame),
      energy: remainingEnergy
    };

    return res;
  }

  onTrackScore (gameplayId: string, score: number) {
    console.log('track score', gameplayId, score);
  }

  onBuyTickets () {
    throw newError('not supported', ErrorCode.SYSTEM_ERROR);
  }

  onBuyIngameItem (itemId: string, gameplayId?: string): BuyInGameItemResponse {
    console.log('buy item', itemId, gameplayId);

    if (!this.gameItemInGame[itemId]) {
      throw newError('invalid item id', ErrorCode.INVALID_REQUEST);
    }

    this.inventoryQuantityMap[itemId] = (this.inventoryQuantityMap[itemId] || 0) + 1;

    const res: BuyInGameItemResponse = {
      receipt: Math.random().toString(),
      item: this.gameItemInGame[itemId]
    };

    return res;
  }

  onUpdateState ({ gamePlayId, state }: UpdateStatePayload) {
    const currentGamePlay = this.apiSDK.currentGamePlay;
    const currentGame = this.currentGameInfo;

    if (currentGamePlay?.id && this.theLastSignature !== state.signature) {
      this.theLastSignature = state.signature;
      addLazy(`update-state-${currentGamePlay.id}`, () => {
        this.apiSDK.submitState(currentGamePlay.id, state).catch(console.error);
        // Save state to user storage as fallback
        cloudStorage.setItem(`game-state-${currentGame.id}`, JSON.stringify(state)).catch(console.error);
      }, 1200, 9000, true);
    }
  }

  async onUseIngameItem (req: {itemId: string, gameplayId?: string }) {
    let success = false;
    const { itemId } = req;

    const remaining = this.inventoryQuantityMap[itemId] || 0;

    // find object by itemId, return gameItemId;
    // @ts-ignore
    const gameItemId = this.gameItemInGame[itemId].gameItemId as number;

    if (this.gameItemInGame[itemId] && remaining > 0) {
      success = true;
      this.inventoryQuantityMap[itemId] = remaining - 1;
    }

    const res: UseInGameItemResponse = {
      success,
      inventory: Object.entries(this.inventoryQuantityMap).map(([id, quantity]) => ({
        itemId: id,
        quantity
      }))
    };

    await this.apiSDK.useInventoryItem(gameItemId);

    return res;
  }

  onTriggerHapticFeedback (type: HapticFeedbackType) {
    // Implementation needed
  }

  async onSignResult (result: {gamePlayId: string, gameToken: string, score: number}) {
    const currentGame = this.apiSDK.currentGamePlay;

    if (!currentGame) {
      throw newError('game not started', ErrorCode.INVALID_REQUEST);
    }

    if (currentGame.token !== result.gameToken) {
      console.warn('Unmatch', currentGame.token, result.gameToken);
      throw newError('invalid game token', ErrorCode.INVALID_REQUEST);
    }

    // Todo: sign result
    const signature = '0x0000';

    await this.apiSDK.submitGame(currentGame.id, result.score, signature);

    return signature;
  }

  onShowLeaderboard () {
    console.log('show leaderboard');
  }

  onShowShop () {
    console.log('open shop');
  }

  onGetLeaderboard (req: GetLeaderboardRequest): GetLeaderboardResponse {
    return { players: [] };
  }

  onExit () {
    if (this.apiSDK.currentGamePlay?.id) {
      removeLazy(`update-state-${this.apiSDK.currentGamePlay.id}`, true);
    }

    this.stop();
    this.options.onExit();
  }

  onExitToListGames () {
    this.stop();
    this.options.onExit();
  }

  async getLatestGameState () {
    const skd = this.apiSDK;
    const gameId = this.currentGameInfo.id;

    if (this.currentGameInfo.gameType !== 'farming') {
      this.gameStateHandler.resolve({} as GameState<any>);

      return;
    }

    async function getStorageState () {
      const data = await cloudStorage.getItem(`game-state-${gameId}`);

      if (data) {
        try {
          return JSON.parse(data) as GameState<any>;
        } catch (e) {
        }
      }

      return undefined;
    }

    async function getAPIState () {
      const lastGameplay = await skd.getLastState(gameId);

      if (lastGameplay?.state) {
        let stateStr = lastGameplay.state as object | string;

        if (typeof stateStr === 'object') {
          stateStr = JSON.stringify(stateStr);
        }

        return {
          data: stateStr,
          signature: lastGameplay.stateSignature,
          timestamp: lastGameplay.stateTimestamp
        } as unknown as GameState<any>;
      }

      return undefined;
    }

    const [storageState, apiState] = await Promise.all([getStorageState(), getAPIState()]);

    let state = apiState;

    // Prefer storage state if it's newer or api state is not available
    if (!apiState || (storageState?.timestamp && apiState?.timestamp && storageState.timestamp > apiState.timestamp)) {
      state = storageState;
    }

    await this.onPlay();

    this.gameStateHandler.resolve(state || {} as GameState<any>);
  }

  private async _onMessage (event: MessageEvent) {
    await this.apiSDK.waitForSync;

    const schema = z.object({
      source: z.enum(['game-sdk']),
      action: z.string().min(1),
      data: z.any(),
      requestId: z.number()
    });

    const result = schema.safeParse(event.data);

    if (!result.success) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { action, data, requestId } = result.data;
    let res;

    try {
      const handleMethod = camelCase('on_' + action);

      // console.log('handleMethod', handleMethod, action, data, requestId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const handler = (this as any)[handleMethod];

      if (!handler || typeof handler !== 'function') {
        throw newError(
          `missing handle func ${handleMethod} for action ${action}`,
          ErrorCode.SYSTEM_ERROR
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      res = await handler.call(this, data);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/restrict-template-expressions
      res = { error: `${e}`, code: (e as PlaynationSDKError)?.code || -1 };
      console.error('handle error', e);
    }

    this.viewport?.contentWindow?.postMessage(
      {
        ...(res || { _payload: undefined }),
        requestId: requestId
      },
      '*'
    );
  }
}

function newError (msg: string, code?: ErrorCode) {
  return new PlaynationSDKError(msg, code);
}
