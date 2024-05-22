// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountBlock, GameCardItem, ShopModal } from '@subwallet/extension-koni-ui/components';
import { ShopModalId } from '@subwallet/extension-koni-ui/components/Modal/Shop/ShopModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { EnergyConfig, Game, GameInventoryItem, GameItem } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const shopModalId = ShopModalId;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const gameIframe = useRef<HTMLIFrameElement>(null);
  const [gameList, setGameList] = useState<Game[]>(apiSDK.gameList);
  const [energyConfig, setEnergyConfig] = useState<EnergyConfig | undefined>(apiSDK.energyConfig);
  const [gameItemMap, setGameItemMap] = useState<Record<string, GameItem[]>>(apiSDK.gameItemMap);
  const [gameInventoryItemList, setGameInventoryItemList] = useState<GameInventoryItem[]>(apiSDK.gameInventoryItemList);
  const [currentGameShopId, setCurrentGameShopId] = useState<number>();
  const { activeModal } = useContext(ModalContext);
  const [account, setAccount] = useState(apiSDK.account);
  const [currentGame, setCurrentGame] = useState<Game | undefined>(undefined);

  const exitGame = useCallback(() => {
    if (gameIframe.current) {
      gameIframe.current.style.opacity = '0';
    }

    setTimeout(() => {
      setCurrentGame(undefined);
    }, 600);
  }, []);

  const playGame = useCallback((game: Game) => {
    return () => {
      setCurrentGame(game);

      const checkInterval = setInterval(() => {
        if (gameIframe.current) {
          new GameApp({
            apiSDK,
            currentGameInfo: game,
            viewport: gameIframe.current,
            onExit: exitGame
          }).start();

          gameIframe.current.style.opacity = '1';

          clearInterval(checkInterval);
        }
      }, 30);
    };
  }, [exitGame]);

  // @ts-ignore
  const onOpenShop = useCallback((gameId?: number) => {
    return () => {
      setCurrentGameShopId(gameId);
      activeModal(shopModalId);
    };
  }, [activeModal]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const gameListSub = apiSDK.subscribeGameList().subscribe((data) => {
      setGameList(data);
    });

    const energyConfigSub = apiSDK.subscribeEnergyConfig().subscribe((data) => {
      setEnergyConfig(data);
    });

    const gameItemMapSub = apiSDK.subscribeGameItemMap().subscribe((data) => {
      setGameItemMap(data);
    });

    const gameInventoryItemListSub = apiSDK.subscribeGameInventoryItemList().subscribe((data) => {
      setGameInventoryItemList(data);
    });

    return () => {
      accountSub.unsubscribe();
      energyConfigSub.unsubscribe();
      gameListSub.unsubscribe();
      gameItemMapSub.unsubscribe();
      gameInventoryItemListSub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>

      <GameAccountBlock
        accountInfo={account}
        maxEnergy={energyConfig?.maxEnergy}
      />

      <div className='game-card-list-container'>
        {
          gameList.map((g) => (
            <GameCardItem
              className={'game-card-item'}
              item={g}
              key={g.id}
              onPlay={playGame(g)}
            />
          ))
        }
      </div>

      {currentGame && <div className={'game-play'}>
        <iframe
          className={'game-iframe'}
          key={`gameplay-${currentGame.id}`}
          ref={gameIframe}
          src={currentGame.url}
        />
      </div>}

      <ShopModal
        energyConfig={energyConfig}
        gameId={currentGameShopId}
        gameInventoryItemList={gameInventoryItemList}
        gameItemMap={gameItemMap}
      />
    </div>
  );
};

const Games = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

    '.account-info': {
      marginBottom: token.margin
    },

    '.game-card-item': {
      marginBottom: token.marginSM
    },

    '.game-play': {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      zIndex: 9999,

      '.game-iframe': {
        opacity: 0,
        transition: 'opacity 0.6s ease-in-out',
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 0
      }
    },

    '.game-energy': {
      display: 'block',
      color: 'rgba(0, 0, 0, 0.65)',
      borderRadius: token.borderRadius
    }
  };
});

export default Games;
