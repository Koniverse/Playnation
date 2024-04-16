// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import GameAccount from '@subwallet/extension-koni-ui/components/Games/GameAccount';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Image, Typography } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const gameIframe = useRef<HTMLIFrameElement>(null);
  const [gameList, setGameList] = useState<Game[]>(apiSDK.gameList);
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

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const gameListSub = apiSDK.subscribeGameList().subscribe((data) => {
      setGameList(data);
    });

    return () => {
      accountSub.unsubscribe();
      gameListSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <GameAccount
      avatar={account.info.photoUrl}
      className={'account-info'}
      info={account.attributes.point.toString()}
      name={`${account.info.firstName || ''} ${account.info.lastName || ''}`}
    />}
    {gameList.map((game) => (<div
      className={'game-item'}
      key={game.id}
    >
      <Image
        className={'game-banner'}
        shape={'square'}
        src={game.banner}
        width={'100%'}
      ></Image>
      <div className='game-info'>
        <Image
          className={'game-banner'}
          src={game.icon}
          width={40}
        />
        <div className={'game-text-info'}>
          <Typography.Title
            className={'__title'}
            level={5}
          >{game.name}</Typography.Title>
          <Typography.Text
            className={'__sub-title'}
            size={'sm'}
          >{game.description}</Typography.Text>
        </div>
        <Button
          className={'play-button'}
          onClick={playGame(game)}
          size={'xs'}
        >Open</Button>
      </div>
    </div>))}

    {currentGame && <div className={'game-play'}>
      <iframe
        className={'game-iframe'}
        key={currentGame.id}
        ref={gameIframe}
        src={currentGame.url}
      />
    </div>}
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
      }
    },

    '.game-info': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      padding: token.padding
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
    }
  };
});

export default Games;
