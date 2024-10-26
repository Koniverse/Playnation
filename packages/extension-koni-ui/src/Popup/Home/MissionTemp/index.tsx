// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { TaskItem, TaskItemType } from './TaskItem';

type Props = ThemeProps;
type TaskSectionType = {
  id: string,
  title: string,
  items: TaskItemType[],
}

const Component = ({ className }: Props): React.ReactElement => {
  const { setBackgroundStyle } = useContext(HomeContext);

  const taskSections: TaskSectionType[] = useMemo(() => {
    return [
      {
        id: 'friend-tasks',
        title: 'Friend Tasks',
        items: [
          {
            id: 'invite-friends',
            title: 'Invite 5 friends this week',
            statusText: '5/5 FRIENDS',
            actionContent: 'INVITE',
            doAction: () => console.log('Inviting friends...'),
            type: 'achievement',
            point: 90,
            state: 'COMPLETED'
          },
          {
            id: 'follow-twitter',
            title: 'Follow NFL Rivals on Twitter',
            statusText: 'TO DO',
            actionContent: 'X', // Example of using an SVG icon
            doAction: () => console.log('Following on Twitter...'),
            type: 'oneTime',
            point: 50,
            state: 'UNCOMPLETED'
          },
          {
            id: 'join-discord',
            title: 'Join NFL Rivals Discord',
            statusText: 'DONE',
            point: 40,
            type: 'oneTime',
            state: 'COMPLETED'
          }
        ]
      },
      {
        id: 'wallet-tasks',
        title: 'Wallet Tasks',
        items: [
          {
            id: 'create-wallet',
            title: 'Create a Mythical Wallet',
            statusText: 'TO DO',
            actionContent: 'GO',
            doAction: () => console.log('Creating wallet...'),
            type: 'oneTime',
            point: 90,
            state: 'UNCOMPLETED'
          },
          {
            id: 'hold-myth',
            title: 'Hold 15 amount of Myth',
            statusText: 'DONE',
            point: 30,
            type: 'oneTime',
            state: 'COMPLETED'
          }
        ]
      },
      {
        id: 'gameplay-tasks',
        title: 'Gameplay Tasks',
        items: [
          {
            id: 'play-events',
            title: 'Play 10 of events',
            statusText: '2/10 EVENTS',
            actionContent: 'PLAY',
            doAction: () => console.log('Playing events...'),
            type: 'achievement',
            point: 90,
            state: 'UNCOMPLETED'
          },
          {
            id: 'score-hard-events',
            title: 'Score 60,000 Points from hard events',
            statusText: '30,000/60,000',
            point: 50,
            type: 'achievement',
            state: 'UNCOMPLETED'
          },
          {
            id: 'claim-hard-events',
            title: 'Score 30,000 Points from hard events',
            statusText: '30,000/30,000',
            actionContent: 'CLAIM',
            doAction: () => console.log('Claiming points...'),
            type: 'achievement',
            point: 50,
            state: 'CLAIMABLE'
          },
          {
            id: 'claim-invite-friends',
            title: 'Invite 5 friends this week',
            statusText: '5/5 FRIENDS',
            actionContent: 'CLAIM',
            doAction: () => console.log('Claiming points...'),
            type: 'achievement',
            point: 50,
            state: 'CLAIMABLE'
          },
          {
            id: 'install-nfl-rivals',
            title: 'Install NFL Rivals',
            statusText: 'INSTALLED',
            point: 50,
            type: 'oneTime',
            state: 'COMPLETED'
          }
        ]
      }
    ] as TaskSectionType[];
  }, []);

  useEffect(() => {
    setBackgroundStyle('style-2');

    return () => {
      setBackgroundStyle(undefined);
    };
  }, [setBackgroundStyle]);

  return (
    <div className={className}>
      {
        taskSections.map((section) => (
          <div
            className={'task-section'}
            key={section.id}
          >
            <div className='task-section-title'>{section.title}</div>

            <div className='task-items-block'>
              {
                section.items.map((item) => (
                  <TaskItem
                    {...item}
                    className='task-item'
                    key={item.id}
                  />
                ))
              }
            </div>
          </div>
        ))
      }
    </div>
  );
};

const MissionTemp = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.task-section-title': {
      fontFamily: extendToken.fontDruk,
      fontSize: '28px',
      fontStyle: 'italic',
      fontWeight: 500,
      color: token.colorWhite,
      lineHeight: '32px',
      letterSpacing: '-0.56px',
      textTransform: 'uppercase',
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 16
    },

    '.task-items-block': {
      paddingLeft: 4,
      paddingRight: 4
    },

    '.task-section + .task-section': {
      marginTop: 24
    },

    '.task-item + .task-item': {
      marginTop: 6
    }
  };
});

export default MissionTemp;
