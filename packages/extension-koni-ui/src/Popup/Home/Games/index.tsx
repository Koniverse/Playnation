// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Game, LeaderboardPerson, Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Image } from '@subwallet/react-ui';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const gameSDK = BookaSdk.instance;

enum GameStatus {
  START = 0,
  PLAYING = 1,
  END = 2
}

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const [gameList, setGameList] = useState<Game[]>(gameSDK.gameList);
  const [taskList, setTaskList] = useState<Task[]>(gameSDK.taskList);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardPerson[]>([]);
  const [account, setAccount] = useState(gameSDK.account);
  const [currentGame, setCurrentGame] = useState<Game | undefined>(undefined);
  const [gameStatus, setGameStatus] = useState(GameStatus.START);
  const [score, setScore] = useState(0);
  const [taskLoading, setTaskLoading] = useState<Record<number, boolean>>({});

  const play = (game: Game) => {
    setCurrentGame(game);
  };

  const startGame = async () => {
    if (!currentGame) {
      return;
    }

    let gScore = 0;

    setScore(0);
    setGameStatus(GameStatus.PLAYING);

    const gamePlay = await gameSDK.playGame(currentGame.id);

    let count = 3;
    const interval = setInterval(() => {
      gScore += Math.floor(Math.random() * 50);
      setScore(gScore);
      count--;

      if (count <= 0) {
        clearInterval(interval);
        gameSDK.submitGame(gamePlay.id, gScore, '0xxx')
          .finally(() => {
            setGameStatus(GameStatus.END);
          })
          .catch(console.error);
      }
    }, 1000);
  };

  const restartGame = () => {
    startGame().catch(console.error);
  };

  const exitGame = () => {
    setScore(0);
    setGameStatus(GameStatus.START);
    setCurrentGame(undefined);
  };

  const finishTask = (taskId: number) => {
    setTaskLoading((prev) => ({
      ...prev,
      [taskId]: true
    }));
    gameSDK.finishTask(taskId)
      .finally(() => {
        setTaskLoading((prev) => ({
          ...prev,
          [taskId]: false
        }));
      })
      .catch(console.error);
  };

  useEffect(() => {
    const accountSub = gameSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const gameListSub = gameSDK.subscribeGameList().subscribe((data) => {
      setGameList(data);
    });

    const taskListSub = gameSDK.subscribeTaskList().subscribe((data) => {
      setTaskList(data);
    });

    const leaderBoardSub = gameSDK.subscribeLeaderboard().subscribe((data) => {
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
    <hr/>
    {!currentGame && <div className={'game-list'}>
      <h1>Games</h1>
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
          onClick={() => {
            play(game);
          }}
          size={'sm'}
        >Play</Button>
      </div>))}
    </div>}
    {!currentGame && <div className={'game-list'}>
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
          disabled={task.status && task.status > 0}
          loading={taskLoading[task.id]}
          onClick={() => {
            finishTask(task.id);
          }}
          size={'sm'}
        >{`Claim ${task.pointReward} point`}</Button>
      </div>))}
    </div>}
    {!currentGame && <div className={'leader-board'}>
      <h1>Leader board</h1>
      {leaderBoard.map((item) => (<div
        className={'game-item'}
        key={item.rank}
      >
        <h3 className={'game-title'}>{item.rank}: {item.firstName} {item.lastName}: {item.point}</h3>
      </div>))}
    </div>}
    {currentGame && <div className={'game-play'}>
      <Image
        className={'game-banner'}
        src={currentGame.icon}
        width={64}
      ></Image>
      <h2>{currentGame?.name}</h2>
      <p>score: {score}</p>

      {gameStatus === GameStatus.START && <Button
        className={'start-button'}
        onClick={startGame}
        size={'sm'}
      >
        Start Game
      </Button>}

      {gameStatus === GameStatus.END && <Button
        className={'restart-button'}
        onClick={restartGame}
        size={'sm'}
      >
        Restart
      </Button>}

      {gameStatus !== GameStatus.PLAYING && <Button
        className={'exit-button'}
        onClick={exitGame}
        size={'sm'}
      >
        Exit
      </Button>}
    </div>}
  </div>;
};

const Games = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    padding: token.padding,

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
