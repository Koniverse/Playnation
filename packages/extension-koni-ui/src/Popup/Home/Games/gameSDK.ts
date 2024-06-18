// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game } from '@subwallet/extension-koni-ui/connector/booka/types';
import { BuyInGameItemResponse, ErrorCode, GameError, GetLeaderboardRequest, GetLeaderboardResponse, HapticFeedbackType, InGameItem, Player, PlayResponse, SDKInitParams, Tournament, UseInGameItemResponse } from '@subwallet/extension-koni-ui/Popup/Home/Games/types';
import { camelCase } from 'lodash';
import z from 'zod';

export interface GameAppOptions {
  viewport: HTMLIFrameElement;
  apiSDK: BookaSdk;
  currentGameInfo: Game;
  onExit: () => void;
}

export class GameApp {
  private listener = this._onMessage.bind(this);
  private options: GameAppOptions;
  private viewport: HTMLIFrameElement;
  private apiSDK: BookaSdk;
  private currentGameInfo: Game;
  private inventoryQuantityMap: Record<string, number> = {};
  private gameItemInGame: { [key: string]: any } = {};

  constructor (options: GameAppOptions) {
    this.options = options;
    this.viewport = options.viewport;
    this.apiSDK = options.apiSDK;
    this.currentGameInfo = options.currentGameInfo;
    this.inventoryQuantityMap = this.apiSDK.gameInventoryItemInGameList;
    this.gameItemInGame = this.apiSDK.gameItemInGameList;
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

  onGetPlayer () {
    const account = this.apiSDK.account;
    const playerId = `${account?.info?.telegramUsername || 'player1'}-${account?.info.id || 0}`;
    const gameData = (account?.gameData || []).find((item) => item.gameId === this.currentGameInfo.id);
    const point = gameData?.point || 0;

    const player: Player = {
      id: playerId,
      balance: point,
      name: `${account?.info?.firstName || ''} ${account?.info?.lastName || ''}` || 'Player',
      avatar: 'https://thispersondoesnotexist.com/',
      level: 1,
      energy: account?.attributes?.energy || 0,
      inventory: Object.entries(this.inventoryQuantityMap)
        .map(([id, quantity]) => ({
          itemId: id,
          quantity
        }))
    };

    console.log('GetPlayer', player);

    return player;
  }

  onGetTournament (): Tournament {
    const account = this.apiSDK.account;
    const currentGame = this.currentGameInfo;
    if (!account || !currentGame) {
      throw newError('invalid account or game', errorCodes.SystemError);
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
    const items: InGameItem[] = Object.values(this.gameItemInGame);
    return { items };
  }

  async onPlay () {

    const account = this.apiSDK.account;
    const currentGame = this.currentGameInfo;
    const energy = account?.attributes.energy || 0;
    if (energy < currentGame.energyPerGame) {
      throw newError('Not enought energy', errorCodes.NotEnoughEnergy);
    }
    const gamePlay = await this.apiSDK.playGame(this.currentGameInfo.id, this.currentGameInfo.energyPerGame);


    if (!account || !currentGame) {
      throw newError('invalid account or game', errorCodes.SystemError);
    }

    const tickets = Math.floor(account.attributes.energy) - 1;

    const res: PlayResponse = {
      token: gamePlay.token,
      remainingTickets: tickets
    };

    return res;
  }

  onTrackScore (gameplayId: string, score: number) {
    console.log('track score', gameplayId, score);
  }

  onBuyTickets () {
    throw newError('not supported', errorCodes.SystemError);
  }

  onBuyIngameItem (itemId: string, gameplayId?: string): BuyInGameItemResponse {
    console.log('buy item', itemId, gameplayId);

    if (!this.gameItemInGame[itemId]) {
      throw newError('invalid item id', errorCodes.InvalidRequest);
    }

    this.inventoryQuantityMap[itemId] = (this.inventoryQuantityMap[itemId] || 0) + 1;

    const res: BuyInGameItemResponse = {
      receipt: Math.random().toString(),
      item: this.gameItemInGame[itemId]
    };

    return res;
  }

  onUseIngameItem (req: {itemId: string, gameplayId?: string }): UseInGameItemResponse {
    let success = false;
    const { itemId } = req;

    const remaining = this.inventoryQuantityMap[itemId] || 0;

    // find object by itemId, return gameItemId;
    const gameItemId = this.gameItemInGame[itemId].gameItemId;
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

    console.log(itemId, res);

    this.apiSDK.useInventoryItem(gameItemId);

    return res;
  }

  onTriggerHapticFeedback (type: HapticFeedbackType) {
    // Implementation needed
  }

  async onSignResult (result: {gamePlayId: string, gameToken: string, score: number}) {
    const currentGame = this.apiSDK.currentGamePlay;

    if (!currentGame) {
      throw newError('game not started', errorCodes.InvalidRequest);
    }

    if (currentGame.token !== result.gameToken) {
      throw newError('invalid game token', errorCodes.InvalidRequest);
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
    this.stop();
    this.options.onExit();
  }

  onExitToListGames () {
    this.stop();
    this.options.onExit();
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

      console.log('handleMethod', handleMethod, action, data, requestId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const handler = (this as any)[handleMethod];

      if (!handler || typeof handler !== 'function') {
        throw newError(
          `missing handle func ${handleMethod} for action ${action}`,
          errorCodes.SystemError
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      res = await handler.call(this, data);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/restrict-template-expressions
      res = { error: `${e}`, code: (e as GameError)?.code || -1 };
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
  const err = new GameError(msg);

  err.code = code;

  return err;
}

const errorCodes = {
  SystemError: -1, // something went wrong
  InvalidRequest: 10,
  TourNotAvailable: 100, // tournament has ended or disabled
  NotEnoughGEM: 110, // no enought GEM to buy tickets or items
  InvalidScore: 120, // score was not accepted (cheat detected)
  UserReject: 130, // User reject transaction (buy tickets or items)
  NotEnoughTicket: 140, // Not enough ticket to play game
  NotEnoughEnergy: 150
};
