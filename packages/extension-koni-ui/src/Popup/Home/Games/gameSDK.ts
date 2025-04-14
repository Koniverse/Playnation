// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BuyInGameItemResponse, ErrorCode, GetLeaderboardRequest, HapticFeedbackType, InGameItem, NewGamePlayPayload, Player, PlaynationSDKError, PlayResponse, SDKInitParams, Tournament, UpdateStatePayload, UseInGameItemResponse } from '@playnation/game-sdk';
import { GameState } from '@playnation/game-sdk/dist/types';
import { SWStorage } from '@subwallet/extension-base/storage';
import { addLazy, createPromiseHandler, removeLazy } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game, GameEvent, LeaderboardGroups, LeaderboardInfo, LeaderboardPerson } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { camelCase } from 'lodash';
import z from 'zod';

export interface GameAppOptions {
  viewport: HTMLIFrameElement;
  apiSDK: BookaSdk;
  currentGameInfo: Game;
  currentGameEvent?: GameEvent;
  onExit: (path?: string) => void;
}

export type LeaderboardItem = {
  rank: number;
  score: number;
}

export interface GetLeaderboardResponse {
  players: LeaderboardPerson[];
  me?: LeaderboardItem;
}

const cloudStorage = SWStorage.instance;
const telegramConnector = TelegramConnector.instance;

export class GameApp {
  private listener = this._onMessage.bind(this);
  private options: GameAppOptions;
  private viewport: HTMLIFrameElement;
  private apiSDK: BookaSdk;
  private currentGameInfo: Game;
  private currentGameEvent?: GameEvent;
  private inventoryQuantityMap: Record<string, number> = {};
  private gameItemInGame: Record<string, InGameItem> = {};

  private gameStateHandler = createPromiseHandler<GameState<any>>();
  private theLastSignature = '';

  constructor (options: GameAppOptions) {
    this.options = options;
    this.viewport = options.viewport;
    this.apiSDK = options.apiSDK;
    this.currentGameInfo = options.currentGameInfo;
    this.currentGameEvent = options.currentGameEvent;
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
      totalScore: 0,
      id: playerId,
      balance: point,
      name: `${account?.info?.firstName || ''} ${account?.info?.lastName || ''}` || 'Player',
      avatar: account?.info.photoUrl,
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
      state,
      event: this.currentGameEvent
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
      id: 1,
      name: 'Tour 01',
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      tickets: tickets
    };

    return tour;
  }

  onGetIngameItems () {
    const items = Object.values(this.gameItemInGame);

    return { items };
  }

  async onPlay (payload?: NewGamePlayPayload) {
    const account = this.apiSDK.account;
    const currentGame = this.currentGameInfo;
    const currentEvent = this.currentGameEvent;
    const energy = account?.attributes.energy || 0;

    if (energy < currentGame.energyPerGame) {
      throw newError('Not enought energy', ErrorCode.NOT_ENOUGH_ENERGY);
    }

    const gamePlayPromise = this.apiSDK.playGame({
      gameId: currentGame.id,
      gameEventId: currentEvent?.id,
      energyUsed: currentGame.energyPerGame,
      gameInitData: payload?.gameInitData as object
    });

    const gamePlay = await Promise.race([
      gamePlayPromise,
      new Promise<never>((resolve, reject) =>
        setTimeout(() => reject(newError('Request timed out', ErrorCode.SYSTEM_ERROR)), 15000))
    ]);

    console.log('gamePlay', gamePlay);

    if (!account || !currentGame) {
      throw newError('invalid account or game', ErrorCode.SYSTEM_ERROR);
    }

    const remainingEnergy = account.attributes.energy - currentGame.energyPerGame;

    const res: PlayResponse = {
      gamePlayId: `gp-${gamePlay.id}`,
      token: gamePlay.token,
      initData: gamePlay.initState as unknown,
      stateData: gamePlay.stateData,
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
        this.apiSDK.submitState({
          gamePlayId: currentGamePlay.id,
          stateData: state
        }).catch(console.error);
        // Save state to user storage as fallback
        cloudStorage.setItem(`game-state-${currentGame.id}`, JSON.stringify(state)).catch(console.error);
      }, 1200, 9000, true);
    }
  }

  async onSubmitAction ({ gamePlayId, state }: {gamePlayId: string, state: GameState<any>}) {
    if (!this.apiSDK.currentGamePlay) {
      await this.apiSDK.getGamePlayById(Number.parseInt(gamePlayId));
    }

    const currentGamePlay = this.apiSDK.currentGamePlay;

    console.log('onSubmitAction', gamePlayId, state);

    if (currentGamePlay?.id && this.theLastSignature !== state.signature) {
      this.theLastSignature = state.signature;
      const submitPromise = this.apiSDK.submitState({
        gamePlayId: currentGamePlay.id,
        stateData: state
      }).catch((e: Error) => {
        console.error(e.message);

        return {
          error: e.message,
          success: false,
          gamePlay: undefined
        };
      });

      const timeoutPromise = new Promise<never>((resolve, reject) =>
        setTimeout(() => reject(newError('Request timed out', ErrorCode.SYSTEM_ERROR)), 15000)
      );

      const response = await Promise.race([submitPromise, timeoutPromise]);

      return {
        success: !!response?.success,
        stateData: response?.gamePlay?.stateData || response?.error,
        point: response?.gamePlay?.point
      };
    }

    return { success: false };
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

    await this.apiSDK.submitGame({
      gamePlayId: currentGame.id,
      point: result.score,
      signature
    });

    return signature;
  }

  onShowLeaderboard () {
    this.onExit('/home/leaderboard');
  }

  // Todo: Rename this function to onNavigateToSupportWebsite
  onShowShop () {
    telegramConnector.openLink('https://support.rivals.game/hc/en-us/requests/new');

    this.onExit();
  }

  async onGetLeaderboard (req: GetLeaderboardRequest): Promise<GetLeaderboardResponse> {
    const leaderboardGeneral = this.apiSDK.leaderboardConfig.leaderboard_general as unknown as LeaderboardGroups[];
    const leaderboards = this.apiSDK.leaderboardConfig.leaderboard_map as unknown as LeaderboardInfo[];

    if (leaderboardGeneral && leaderboards) {
      const firstLeaderboardGroups = leaderboardGeneral[0];

      if (!firstLeaderboardGroups || !firstLeaderboardGroups.leaderboards.length) {
        return { players: [] };
      }

      const weekLeaderBoard = leaderboards.find((l) => l.id === firstLeaderboardGroups.leaderboards[0]?.id);

      if (!weekLeaderBoard) {
        return { players: [] };
      }

      const mapLeader = await this.apiSDK.fetchLeaderboard(
        weekLeaderBoard.id,
        {
          withoutDelayTime: true
        }
      );
      const mineRanked = mapLeader.results.find((item) => item.mine);

      if (!mineRanked) {
        return { players: mapLeader.results };
      }

      return { players: mapLeader.results, me: { score: mineRanked.point, rank: mineRanked.rank } };
    }

    return { players: [] };
  }

  onExit (path?: string) {
    if (this.apiSDK.currentGamePlay?.id) {
      removeLazy(`update-state-${this.apiSDK.currentGamePlay.id}`, true);
    }

    this.stop();
    this.options.onExit(path);
  }

  onExitToListGames () {
    this.stop();
    this.options.onExit();
  }

  async getLatestGameState () {
    const sdk = this.apiSDK;

    while (!this.currentGameInfo?.id) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const gameId = this.currentGameInfo.id;

    console.log(this.currentGameInfo.gameType);

    if (this.currentGameInfo.gameType === 'casual') {
      this.gameStateHandler.resolve({} as GameState<any>);

      return;
    }

    if (this.currentGameInfo.gameType === 'mythical-card') {
      this.gameStateHandler.resolve({
        data: {
          mythicalCards: await sdk.getNFLRivalCardList()
        },
        signature: '0x0000',
        timestamp: new Date().toISOString()
      });

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
      const lastGameplay = await sdk.getLastState(gameId);

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
    // @ts-ignore
    if (!apiState || (storageState?.timestamp && apiState?.timestamp && storageState.timestamp > apiState.timestamp)) {
      state = storageState;
    }

    try {
      await this.onPlay();

      // @ts-ignore
      this.gameStateHandler.resolve(state || {} as GameState<any>);
    } catch (e) {
      this.onExit();
      telegramConnector.showAlert('Not enough energy to play', () => {
        console.log('alert closed');
      });
      throw e;
    } finally {
      await this.apiSDK.reloadAccount().catch(console.error);
    }
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
