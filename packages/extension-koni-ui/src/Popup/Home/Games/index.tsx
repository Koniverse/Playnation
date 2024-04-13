// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game, LeaderboardPerson, Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { GameApp } from '@subwallet/extension-koni-ui/Popup/Home/Games/gameSDK';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Image } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const gameIframe = useRef<HTMLIFrameElement>(null);
  const [gameList, setGameList] = useState<Game[]>(apiSDK.gameList);
  const [taskList, setTaskList] = useState<Task[]>(apiSDK.taskList);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>([]);
  const [account, setAccount] = useState(apiSDK.account);
  const [currentGame, setCurrentGame] = useState<Game | undefined>(undefined);
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});

  const playGame = useCallback((game: Game) => {
    return () => {
      setCurrentGame(game);

      const checkInterval = setInterval(() => {
        if (gameIframe.current) {
          new GameApp({
            apiSDK,
            currentGameInfo: {
              ...game
            },
            viewport: gameIframe.current,
            onExit: exitGame
          }).start();

          clearInterval(checkInterval);
        }
      }, 30);
    };
  }, []);

  const exitGame = () => {
    setCurrentGame(undefined);
  };

  const finishTask = useCallback((taskId: number) => {
    return () => {
      setTaskLoading((prev) => ({
        ...prev,
        [taskId]: true
      }));
      apiSDK.finishTask(taskId)
        .finally(() => {
          setTaskLoading((prev) => ({
            ...prev,
            [taskId]: false
          }));
        })
        .catch(console.error);
    };
  }, []);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const gameListSub = apiSDK.subscribeGameList().subscribe((data) => {
      setGameList(data);
    });

    const taskListSub = apiSDK.subscribeTaskList().subscribe((data) => {
      setTaskList(data);
    });

    const leaderBoardSub = apiSDK.subscribeLeaderboard().subscribe((data) => {
      setLeaderBoard(data);
    });

    return () => {
      accountSub.unsubscribe();
      gameListSub.unsubscribe();
      taskListSub.unsubscribe();
      leaderBoardSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <div>
      <h1>Account Information</h1>
      <p>Energy: {account.attributes.energy}</p>
      <p>Point: {account.attributes.point}</p>
    </div>}
    <div className={'game-list'}>
      <h1>Games</h1>
      {currentGame && <div className={'game-play'}>
        <iframe
          className={'game-iframe'}
          key={currentGame.id}
          ref={gameIframe}
          src={currentGame.url}
        />
      </div>}
      {gameList.map((game) => (<div
        className={'game-item'}
        key={game.id}
      >
        <Image
          className={'game-banner'}
          src={game.banner}
          width={'100%'}
        ></Image>
        <h3 className={'game-title'}>Name: {game.name}</h3>
        <Button
          className={'play-button'}
          onClick={playGame(game)}
          size={'sm'}
        >Play</Button>
      </div>))}
    </div>
    <div className={'game-list'}>
      <h1>Tasks</h1>
      {taskList.map((task) => (<div
        className={'game-item'}
        key={task.id}
      >
        <Image
          className={'game-banner'}
          src={task.icon}
          width={36}
        ></Image>
        <h3 className={'game-title'}>{task.name}</h3>
        <Button
          className={'play-button'}
          disabled={!!(task.status && task.status > 0)}
          loading={taskLoading[task.id]}
          onClick={finishTask(task.id)}
          size={'sm'}
        >{`Claim ${task.pointReward} point`}</Button>
      </div>))}
    </div>
    <div className={'leader-board'}>
      <h1>Leader board</h1>
      {leaderBoard.map((item) => (<div
        className={'game-item'}
        key={item.rank}
      >
        <h3 className={'game-title'}>{item.rank}: {item.firstName} {item.lastName}: {item.point}</h3>
      </div>))}
    </div>
  </div>;
};

const Games = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

    '.game-play': {
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      top: 0,
      left: 0,
      zIndex: 9999,
      backgroundColor: token.colorPrimary,

      '.game-iframe': {
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
      padding: '10px',
      border: `1px solid ${token.colorBorder}`,
      borderRadius: '5px',
      marginBottom: '10px',

      '& img': {
        width: '100%',
        height: 'auto',
        marginBottom: '10px'
      }
    }
  };
});

export default Games;
