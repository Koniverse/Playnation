// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountBlock, GameCardItem, ShopModal } from '@subwallet/extension-koni-ui/components';
import { ShopModalId } from '@subwallet/extension-koni-ui/components/Modal/Shop/ShopModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { EnergyConfig, Game, GameInventoryItem, GameItem } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const shopModalId = ShopModalId;

const orderGameList = (data: Game[]): Game[] => {
  const now = Date.now();
  const dataActive = data.filter((item) => item.active && (!item.endTime || new Date(item.endTime).getTime() > now));
  const dataComingSoon = dataActive.filter((item) => item.startTime && new Date(item.startTime).getTime() > now);
  const dataStartNull = dataActive.filter((item) => !item.startTime);
  const dataActiveNow = dataActive.filter((item) => item.startTime && new Date(item.startTime).getTime() <= now);
  const items = dataActiveNow.sort((a, b) => {
    if (a.startTime === null && b.startTime === null) {
      return 0;
    }

    if (a.startTime === null) {
      return 1;
    }

    if (b.startTime === null) {
      return -1;
    }

    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();

    return bTime - aTime;
  });

  return items.concat(dataStartNull).concat(dataComingSoon);
};

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
  const { setContainerClass } = useContext(HomeContext);

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
      setGameList(orderGameList(data));
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

  const showGame = !!currentGame;

  useEffect(() => {
    setContainerClass(showGame ? 'game-screen-wrapper -show-game' : 'game-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass, showGame]);

  return (
    <div className={className}>
      <div className='game-account-block-wrapper'>
        <GameAccountBlock
          accountInfo={account}
          maxEnergy={energyConfig?.maxEnergy}
        />
      </div>

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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',

    '.game-account-block-wrapper': {
      paddingLeft: token.sizeXS,
      paddingRight: token.sizeXS,
      paddingBottom: token.padding
    },

    '.game-card-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingLeft: token.sizeXS,
      paddingRight: token.sizeXS,
      paddingBottom: 34
    },

    '.game-card-item': {
      marginBottom: token.marginSM
    },

    '.game-play': {
      backgroundColor: extendToken.colorBgSecondary2,
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
