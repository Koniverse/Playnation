// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ShopModal } from '@subwallet/extension-koni-ui/components';
import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import GameEnergy from '@subwallet/extension-koni-ui/components/Games/GameEnergy';
import { ShopModalId } from '@subwallet/extension-koni-ui/components/Modal/Shop/ShopModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game, GameInventoryItem, GameItem } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Image, ModalContext, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { ShoppingBag } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

function checkComingSoon (game: Game): boolean {
  if (!game.startTime) {
    return false;
  }

  // Check coming soon by start time
  const gameStartTime = new Date(game.startTime).getTime();

  return gameStartTime > Date.now();
}

const shopModalId = ShopModalId;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const gameIframe = useRef<HTMLIFrameElement>(null);
  const [gameList, setGameList] = useState<Game[]>(apiSDK.gameList);
  const [gameItemMap, setGameItemMap] = useState<Record<string, GameItem[]>>(apiSDK.gameItemMap);
  const [gameInventoryItemList, setGameInventoryItemList] = useState<GameInventoryItem[]>(apiSDK.gameInventoryItemList);
  const [currentGameShopId, setCurrentGameShopId] = useState<number>();
  const { activeModal } = useContext(ModalContext);
  const [account, setAccount] = useState(apiSDK.account);
  const [currentGame, setCurrentGame] = useState<Game | undefined>(undefined);
  const { t } = useTranslation();

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

    const gameItemMapSub = apiSDK.subscribeGameItemMap().subscribe((data) => {
      setGameItemMap(data);
    });

    const gameInventoryItemListSub = apiSDK.subscribeGameInventoryItemList().subscribe((data) => {
      setGameInventoryItemList(data);
    });

    return () => {
      accountSub.unsubscribe();
      gameListSub.unsubscribe();
      gameItemMapSub.unsubscribe();
      gameInventoryItemListSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <div className={'account-info'}>
      <GameAccount
        avatar={account.info.photoUrl}
        className={'account-info'}
        name={`${account.info.firstName || ''} ${account.info.lastName || ''}`}
        point={account.attributes.point}
      />
      <GameEnergy
        energy={account.attributes.energy}
        startTime={account.attributes.lastEnergyUpdated}
      />

      <Button
        icon={(
          <Icon
            phosphorIcon={ShoppingBag}
            size='md'
          />
        )}
        onClick={onOpenShop()}
        size='xs'
        type='ghost'
      />
    </div>}
    {gameList.map((game) => (<div
      className={CN('game-item', { 'coming-soon': checkComingSoon(game) })}
      key={`game-${game.id}`}
    >
      <div className='game-banner'>
        <Image
          shape={'square'}
          src={game.banner}
          width={'100%'}
        />
      </div>
      <div className='game-info'>
        <Image
          className={'game-icon'}
          src={game.icon}
          width={40}
        />
        <div className={'game-text-info'}>
          <Typography.Title
            className={'__title'}
            level={5}
          >
            {game.name}
          </Typography.Title>
          <Typography.Text
            className={'__sub-title'}
            size={'sm'}
          >{game.description}</Typography.Text>
          <Typography.Title
            className={'__coming-soon-title'}
            level={5}
          >
            {t('Coming soon')}
          </Typography.Title>
        </div>
        <div className={'play-area'}>
          <div>
            <Button
              icon={(
                <Icon
                  phosphorIcon={ShoppingBag}
                  size='md'
                />
              )}
              onClick={onOpenShop(game.id)}
              size='xs'
              type='ghost'
            />

            <Button
              className={'play-button'}
              onClick={playGame(game)}
              size={'xs'}
            >
              {t('Open')}
            </Button>
          </div>

          <Typography.Text
            className={'game-energy'}
            size={'sm'}
          >
            {t('{{energy}} energy / game', { energy: game.energyPerGame })}
          </Typography.Text>
        </div>
      </div>
    </div>))}

    {currentGame && <div className={'game-play'}>
      <iframe
        className={'game-iframe'}
        key={`gameplay-${currentGame.id}`}
        ref={gameIframe}
        src={currentGame.url}
      />
    </div>}

    <ShopModal
      gameId={currentGameShopId}
      gameInventoryItemList={gameInventoryItemList}
      gameItemMap={gameItemMap}
    />
  </div>;
};

const Games = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

    '.account-info': {
      marginBottom: token.margin
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

    '.game-info': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: token.padding
    },

    '.__coming-soon-title': {
      display: 'none'
    },

    '.game-text-info': {
      flex: 1,
      marginLeft: token.marginXS,

      '.__title': {
        marginBottom: 0
      },

      '.__sub-title': {
        color: 'rgba(0, 0, 0, 0.65)'
      }
    },

    '.play-area': {
      textAlign: 'right'
    },

    '.game-energy': {
      display: 'block',
      color: 'rgba(0, 0, 0, 0.65)',
      borderRadius: token.borderRadius
    },

    '.game-item': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: token['gray-1'],
      borderRadius: token.borderRadius,
      border: 0,
      marginBottom: '10px',
      overflow: 'hidden',

      '& img': {
        width: '100%',
        height: 'auto'
      },

      '&.coming-soon': {
        '.game-banner': {
          overflow: 'hidden',
          img: {
            filter: 'blur(8px)'
          }
        },

        '.game-text-info': {
          '.__title, .__sub-title': {
            display: 'none'
          },

          '.__coming-soon-title': {
            display: 'block',
            marginTop: 0,
            marginBottom: 0
          }
        },

        '.play-area': {
          display: 'none'
        }
      }
    }
  };
});

export default Games;
