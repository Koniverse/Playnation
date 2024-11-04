// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { MissionItem, MissionItemType } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement, AchievementLogStatus, BookaAccount, Task, TaskCategory, TaskCategoryType } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { actionTaskOnChain } from '@subwallet/extension-koni-ui/utils/game/task';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  taskCategories: TaskCategory[];
  tasks: Task[];
  achievements: Achievement[];
  selectedTab: TaskCategoryType;
  accountInfo: BookaAccount | undefined;
};

type MissionSectionType = {
  id: string,
  title: string,
  items: MissionItemType[],
}

function isTaskComplete (task: Task) {
  return !!task.completedAt;
}

function getTaskState (task: Task) {
  return isTaskComplete(task) ? 'COMPLETED' : 'UNCOMPLETED';
}

function getAchievementState (achievement: Achievement): MissionItemType['state'] {
  if (achievement.status === AchievementLogStatus.CLAIMED) {
    return 'COMPLETED';
  }

  if (achievement.status === AchievementLogStatus.CLAIMABLE) {
    return 'CLAIMABLE';
  }

  return 'UNCOMPLETED';
}

const metricLabelMap: Record<string, string> = {
  'all:nps': 'all:nps',
  'task:nps': 'task:nps',
  'task:quantity': 'task:quantity',
  'referral:nps': 'referral:nps',
  'referral:quantity': 'referral:quantity',
  'referral:inviteToPlay:nps': 'referral:inviteToPlay:nps',
  'referral:inviteToPlay:quantity': 'referral:inviteToPlay:quantity',
  'game:casual:nps': 'game:casual:nps',
  'game:casual:point': 'game:casual:point',
  'game:casual:quantity': 'game:casual:quantity',
  'game:farming:point': 'game:farming:point',
  'game:farming:totalPoint': 'game:farming:totalPoint',
  'game:farming:earnSpeed': 'game:farming:earnSpeed',
  'account:daily:quantity': 'account:daily:quantity'
};

function getMetricCounterpart (metricId: string, achievement: Achievement): string {
  const metric = achievement.metrics.find((m) => m.metricId === metricId);

  return metric ? (metricLabelMap[metric.type] || '') : '';
}

function filterAchievements (achievements: Achievement[], taskSectionMap: Record<number, MissionSectionType>): Achievement[] {
  const result: Record<string, Achievement> = {};

  achievements.forEach((item) => {
    if (!item.categoryId || !taskSectionMap[item.categoryId]) {
      return;
    }

    // Skip items with CLAIMED status
    if (item.status === AchievementLogStatus.CLAIMED) {
      return;
    }

    // If there's no existing item in the result for this slug, or if the new item has a lower milestoneOrdinal, update it
    if (
      !result[item.slug] ||
      item.milestoneOrdinal < result[item.slug].milestoneOrdinal
    ) {
      result[item.slug] = item;
    }
  });

  return Object.values(result);
}

const apiSDK = BookaSdk.instance;

const Component = ({ accountInfo,
  achievements,
  className,
  selectedTab,
  taskCategories,
  tasks }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const notify = useNotification();

  const getTaskStatusText = useCallback((task: Task) => {
    return isTaskComplete(task) ? t('Done') : t('To do');
  }, [t]);

  const getTaskActionContent = useCallback((task: Task) => {
    return t('Go');
  }, [t]);

  const doTaskAction = useCallback((task: Task) => {
    if (!accountInfo) {
      return undefined;
    }

    return (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
      const taskId = task.id;
      const onChainType = task.onChainType;
      const { address } = accountInfo?.info || {};

      if (!address) {
        return;
      }

      setLoading(true);

      (async () => {
        let res: SWTransactionResponse | null = null;
        const networkKey = task.network || '';

        if (onChainType) {
          const now = new Date();
          const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
          const data = JSON.stringify({ address, type: onChainType, date });

          const checkCompleted = await apiSDK.completeTask(taskId);

          if (checkCompleted) {
            if (checkCompleted.completed) {
              setLoading(false);

              return;
            }

            if (checkCompleted.isSubmitting) {
              setLoading(false);

              notify({
                message: t('Mission in progress on another device. Use one device to complete it.'),
                type: 'warning'
              });

              return;
            }
          }

          res = await actionTaskOnChain(onChainType, networkKey, address, data);

          if ((res && res.errors.length > 0) || !res) {
            setLoading(false);
            let message = t(`Network ${networkKey} not enable`);

            if (res && res.errors.length > 0) {
              const error = res?.errors[0] || {};

              // @ts-ignore
              message = error?.message || '';
            }

            notify({
              message: message,
              type: 'error'
            });

            return;
          }
        }

        let extrinsicHash = '';

        if (res) {
          extrinsicHash = res.extrinsicHash || '';
        }

        await apiSDK.finishTask(taskId, extrinsicHash, networkKey);
      })().catch(console.error).finally(() => {
        setLoading(false);
      });
    };
  }, [accountInfo, notify, t]);

  // todo: will support multi achievement process, current only support the first one
  const getAchievementStatusText = useCallback((achievement: Achievement) => {
    const firstProcessItem = achievement.progress[0];

    if (firstProcessItem) {
      return `${firstProcessItem.completed}/${firstProcessItem.required} ${getMetricCounterpart(firstProcessItem.metricId, achievement)}`.trim();
    }

    return '';
  }, []);

  const getAchievementActionContent = useCallback((achievement: Achievement) => {
    if (achievement.status === AchievementLogStatus.CLAIMABLE) {
      return t('Claim');
    }

    return undefined;
  }, [t]);

  const doAchievementAction = useCallback((achievement: Achievement) => {
    if (achievement.status !== AchievementLogStatus.CLAIMABLE) {
      return undefined;
    }

    return (setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
      setLoading(true);

      apiSDK.claimAchievement(achievement.milestoneId).catch(console.error).finally(() => {
        setLoading(false);
      });
    };
  }, []);

  const missionSections: MissionSectionType[] = useMemo(() => {
    const taskSectionMap: Record<number, MissionSectionType> = {};

    taskCategories.forEach((tc) => {
      if (selectedTab !== tc.type) {
        return;
      }

      taskSectionMap[tc.id] = {
        id: `${tc.id}`,
        title: tc.name || '',
        items: []
      };
    });

    tasks.forEach((tk) => {
      if (!tk.categoryId || !taskSectionMap[tk.categoryId]) {
        return;
      }

      taskSectionMap[tk.categoryId].items.push({
        id: `${tk.id}`,
        title: tk.name || '',
        statusText: getTaskStatusText(tk),
        actionContent: getTaskActionContent(tk),
        type: 'oneTime',
        doAction: doTaskAction(tk),
        point: tk.pointReward || 0,
        state: getTaskState(tk)
      });
    });

    const filteredAchievements = filterAchievements(achievements, taskSectionMap);

    filteredAchievements.forEach((ach) => {
      taskSectionMap[ach.categoryId].items.push({
        id: `${ach.id}`,
        title: ach.name || '',
        statusText: getAchievementStatusText(ach),
        actionContent: getAchievementActionContent(ach),
        type: 'achievement',
        doAction: doAchievementAction(ach),
        point: ach.pointReward || 0,
        state: getAchievementState(ach)
      });
    });

    return Object.values(taskSectionMap).filter((ts) => !!ts.items.length);
  }, [taskCategories, tasks, achievements, selectedTab, getTaskStatusText, getTaskActionContent, doTaskAction, getAchievementStatusText, getAchievementActionContent, doAchievementAction]);

  // const mockItems: MissionSectionType[] = useMemo(() => {
  //   return [
  //     {
  //       id: 'friend-tasks',
  //       title: 'Friend Tasks',
  //       items: [
  //         {
  //           id: 'invite-friends',
  //           title: 'Invite 5 friends this week',
  //           statusText: '5/5 FRIENDS',
  //           actionContent: 'INVITE',
  //           doAction: () => console.log('Inviting friends...'),
  //           type: 'achievement',
  //           point: 90,
  //           state: 'COMPLETED'
  //         },
  //         {
  //           id: 'follow-twitter',
  //           title: 'Follow NFL Rivals on Twitter',
  //           statusText: 'TO DO',
  //           actionContent: 'X', // Example of using an SVG icon
  //           doAction: () => console.log('Following on Twitter...'),
  //           type: 'oneTime',
  //           point: 50,
  //           state: 'UNCOMPLETED'
  //         },
  //         {
  //           id: 'join-discord',
  //           title: 'Join NFL Rivals Discord',
  //           statusText: 'DONE',
  //           point: 40,
  //           type: 'oneTime',
  //           state: 'COMPLETED'
  //         }
  //       ]
  //     },
  //     {
  //       id: 'wallet-tasks',
  //       title: 'Wallet Tasks',
  //       items: [
  //         {
  //           id: 'create-wallet',
  //           title: 'Create a Mythical Wallet',
  //           statusText: 'TO DO',
  //           actionContent: 'GO',
  //           doAction: () => console.log('Creating wallet...'),
  //           type: 'oneTime',
  //           point: 90,
  //           state: 'UNCOMPLETED'
  //         },
  //         {
  //           id: 'hold-myth',
  //           title: 'Hold 15 amount of Myth',
  //           statusText: 'DONE',
  //           point: 30,
  //           type: 'oneTime',
  //           state: 'COMPLETED'
  //         }
  //       ]
  //     },
  //     {
  //       id: 'gameplay-tasks',
  //       title: 'Gameplay Tasks',
  //       items: [
  //         {
  //           id: 'play-events',
  //           title: 'Play 10 of events',
  //           statusText: '2/10 EVENTS',
  //           actionContent: 'PLAY',
  //           doAction: () => console.log('Playing events...'),
  //           type: 'achievement',
  //           point: 90,
  //           state: 'UNCOMPLETED'
  //         },
  //         {
  //           id: 'score-hard-events',
  //           title: 'Score 60,000 Points from hard events',
  //           statusText: '30,000/60,000',
  //           point: 50,
  //           type: 'achievement',
  //           state: 'UNCOMPLETED'
  //         },
  //         {
  //           id: 'claim-hard-events',
  //           title: 'Score 30,000 Points from hard events',
  //           statusText: '30,000/30,000',
  //           actionContent: 'CLAIM',
  //           doAction: () => console.log('Claiming points...'),
  //           type: 'achievement',
  //           point: 50,
  //           state: 'CLAIMABLE'
  //         },
  //         {
  //           id: 'claim-invite-friends',
  //           title: 'Invite 5 friends this week',
  //           statusText: '5/5 FRIENDS',
  //           actionContent: 'CLAIM',
  //           doAction: () => console.log('Claiming points...'),
  //           type: 'achievement',
  //           point: 50,
  //           state: 'CLAIMABLE'
  //         },
  //         {
  //           id: 'install-nfl-rivals',
  //           title: 'Install NFL Rivals',
  //           statusText: 'INSTALLED',
  //           point: 50,
  //           type: 'oneTime',
  //           state: 'COMPLETED'
  //         }
  //       ]
  //     }
  //   ] as MissionSectionType[];
  // }, []);

  return (
    <div className={className}>
      {
        missionSections.map((section) => (
          <div
            className={'mission-section'}
            key={section.id}
          >
            <div className='mission-section-title'>{section.title}</div>

            <div className='mission-items-block'>
              {
                section.items.map((item) => (
                  <MissionItem
                    {...item}
                    className='mission-item'
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

const MissionSectionListContainer = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.mission-section-title': {
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

    '.mission-items-block': {
      paddingLeft: 4,
      paddingRight: 4
    },

    '.mission-section + .task-section': {
      marginTop: 24
    },

    '.mission-item + .mission-item': {
      marginTop: 6
    }
  };
});

export default MissionSectionListContainer;
