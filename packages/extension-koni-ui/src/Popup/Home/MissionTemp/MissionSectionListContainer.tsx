// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { MissionItem, MissionItemType } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement, AchievementLogStatus, BookaAccount, Task, TaskAction, TaskActionComponent, TaskActionDirect, TaskActionOnchain, TaskActionOpenScreen, TaskActionShare, TaskActionUrl, TaskCategory, TaskCategoryType } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { AuthenticationMythContext } from '@subwallet/extension-koni-ui/contexts/AuthenticationMythProvider';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { actionTaskOnChain } from '@subwallet/extension-koni-ui/utils/game/task';
import { Check, X } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  taskCategories: TaskCategory[];
  tasks: Task[];
  achievements: Achievement[];
  selectedTab: TaskCategoryType;
  accountInfo: BookaAccount | undefined;
  endTime?: number;
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

function getMetricCounterpart (metricId: string, achievement: Achievement): string {
  const metric = achievement.metrics.find((m) => m.metricId === metricId);

  return metric ? (metric.unit || '') : '';
}

function filterAchievements (
  achievements: Achievement[],
  taskSectionMap: Record<number, MissionSectionType>
): Achievement[] {
  const result: Record<string, Achievement> = {};

  achievements.forEach((item) => {
    if (!item.categoryId || !taskSectionMap[item.categoryId]) {
      return;
    }

    const current = result[item.documentId];

    // If all items are CLAIMED, track the highest milestoneOrdinal
    if (item.status === AchievementLogStatus.CLAIMED) {
      if (!current || current.milestoneOrdinal < item.milestoneOrdinal) {
        result[item.documentId] = item;
      }

      return;
    }

    // For non-CLAIMED items, track the lowest milestoneOrdinal
    if (
      !current ||
      current.status === AchievementLogStatus.CLAIMED ||
      item.milestoneOrdinal < current.milestoneOrdinal
    ) {
      result[item.documentId] = item;
    }
  });

  return Object.values(result);
}

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ accountInfo,
  achievements,
  className,
  endTime,
  selectedTab,
  taskCategories,
  tasks }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const { alertModal } = useContext(WalletModalContext);
  const { isLinkedMyth, linkMythAccount, mythicalWallet } = useContext(AuthenticationMythContext);
  const doLinkAccount = useCallback(() => {
    linkMythAccount('/home/mission').catch(console.error);
  }, [linkMythAccount]);

  const getTaskStatusText = useCallback((task: Task) => {
    return isTaskComplete(task) ? t('Done') : t('To do');
  }, [t]);

  const handleLinkAccountModal = useCallback(() => {
    alertModal.open({
      className: 'general-confirmation-modal modal-revert-header',
      title: t('Link your mythical account'),
      content: (
        t('You need to link your Mythical account to complete this task')
      ),
      okButton: {
        icon: Check,
        iconWeight: 'fill',
        text: t('LINK NOW'),
        onClick: doLinkAccount
      },
      cancelButton: {
        icon: X,
        text: t('CANCEL'),
        onClick: alertModal.close
      }
    });
  }, [alertModal, doLinkAccount, t]);

  const handleMythicalAddressModal = useCallback(() => {
    alertModal.open({
      className: 'general-confirmation-modal modal-revert-header',
      title: t('link your mythical address'),
      content: (
        t('You need to link your Mythical address with your account on the NFL Rivals app to complete this task')
      ),
      okButton: {
        text: t('GOT IT'),
        onClick: alertModal.close
      }
    });
  }, [alertModal, t]);

  const handleInsufficientBalanceModal = useCallback((balanceRequired: string) => {
    alertModal.open({
      className: 'general-confirmation-modal modal-revert-header',
      title: t('insufficient balance'),
      content: (
        t(`Your Mythical address has less than ${balanceRequired} MYTH. Top up your balance to complete this task`)
      ),
      okButton: {
        text: t('GOT IT'),
        onClick: alertModal.close
      }
    });
  }, [alertModal, t]);

  const getTaskActionContent = useCallback((task: Task) => {
    const action = task.action;

    return action?.label || t('Go');
  }, [t]);

  const handleOnChainAction = useCallback(async (taskId: number, action: TaskActionOnchain) => {
    const { address } = accountInfo?.info || {};

    if (!address) {
      return;
    }

    let res: SWTransactionResponse | null = null;
    const networkKey = action.network || '';

    const now = new Date();
    const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const data = JSON.stringify({ address, type: action.type, date });

    const checkCompleted = await apiSDK.checkCompleteTask(taskId);

    if (checkCompleted) {
      if (checkCompleted.completed) {
        return;
      }

      if (checkCompleted.isSubmitting) {
        notify({
          message: t('Mission in progress on another device. Use one device to complete it.'),
          type: 'warning'
        });

        return;
      }
    }

    res = await actionTaskOnChain(action.type, networkKey, address, data);

    if ((res && res.errors.length > 0) || !res) {
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

    return res.extrinsicHash;
  }, [accountInfo?.info, notify, t]);

  const handleUrlAction = useCallback(async (action: TaskActionUrl) => {
    action.url && telegramConnector.openLink(action.url);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, []);

  const handleOpenScreenAction = useCallback(async (action: TaskActionOpenScreen) => {
    const screen = action.screen;

    if (screen === 'events') {
      navigate('/home/events');
    } else if (screen === 'mission') {
      navigate('/home/mission');
    } else if (screen === 'leaderboard') {
      navigate('/home/leaderboard');
    } else if (screen === 'cards') {
      navigate('/home/cards');
    } else if (screen === 'account') {
      navigate('/home/my-profile');
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, [navigate]);

  const handleDirectAction = useCallback(async (action: TaskActionDirect) => {
    const type = action.type;

    if (type === 'invite') {
      navigate('/invite');
    } else if (type === 'mythical-login') {
      alert('Implement mythical login');
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, [navigate]);

  const handleCheckBalanceAction = useCallback(async (taskId?: number) => {
    if (!taskId) {
      return;
    }

    if (!isLinkedMyth) {
      handleLinkAccountModal();

      return;
    } else if (!mythicalWallet.address) {
      handleMythicalAddressModal();

      return;
    }

    const checkAchievement = await apiSDK.checkAchievement(taskId);

    if (checkAchievement) {
      if (checkAchievement.success) {
        return;
      }

      if (checkAchievement.message?.startsWith('Mythical Balance hold is less')) {
        const parts = checkAchievement.message?.split('less than');
        const balanceRequired = parts[1]?.trim();

        handleInsufficientBalanceModal(balanceRequired);

        return;
      }

      notify({
        message: t(checkAchievement.message || 'Check balance failed'),
        type: 'warning'
      });

      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, [handleInsufficientBalanceModal, handleLinkAccountModal, handleMythicalAddressModal, isLinkedMyth, mythicalWallet.address, notify, t]);

  const handleShareAction = useCallback(async (action: TaskActionShare) => {
    alert(`Implement share action: ${action.url}`);

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }, []);

  const doAction = useCallback((action: TaskAction, taskId?: number) => {
    return (async () => {
      const actionType = action?.__component;
      const networkKey = (action as TaskActionOnchain)?.network || '';
      let extrinsicHash: string | undefined = '';

      if (actionType === TaskActionComponent.ONCHAIN) {
        if (taskId) {
          extrinsicHash = await handleOnChainAction(taskId, action as TaskActionOnchain);
        }
      } else if (actionType === TaskActionComponent.URL) {
        await handleUrlAction(action as TaskActionUrl);
      } else if (actionType === TaskActionComponent.OPEN_SCREEN) {
        await handleOpenScreenAction(action as TaskActionOpenScreen);
      } else if (actionType === TaskActionComponent.DIRECT) {
        await handleDirectAction(action as TaskActionDirect);
      } else if (actionType === TaskActionComponent.SHARE) {
        await handleShareAction(action as TaskActionShare);
      } else if (actionType === TaskActionComponent.CHECK_BALANCE) {
        await handleCheckBalanceAction(taskId);
      }

      // Finish the task
      return {
        extrinsicHash,
        networkKey
      };
    })();
  }, [handleDirectAction, handleOnChainAction, handleOpenScreenAction, handleShareAction, handleUrlAction, handleCheckBalanceAction]);

  const doTaskAction = useCallback((task: Task) => {
    const action = task.action;

    if (!action) {
      return undefined;
    }

    return async () => {
      const { extrinsicHash, networkKey } = await doAction(action, task.id);

      // Finish the task
      extrinsicHash !== undefined && await apiSDK.finishTask(task.id, extrinsicHash, networkKey);
    };
  }, [doAction]);

  // todo: will support multi achievement process, current only support the first one
  const getAchievementStatusText = useCallback((achievement: Achievement) => {
    const firstProcessItem = achievement.progress[0];

    if (firstProcessItem) {
      const completed = Math.min(firstProcessItem.completed || 0, firstProcessItem.required);

      return `${toDisplayNumber(completed)}/${toDisplayNumber(firstProcessItem.required)} ${getMetricCounterpart(firstProcessItem.metricId, achievement)}`.trim();
    }

    return '';
  }, []);

  const getAchievementActionContent = useCallback((achievement: Achievement) => {
    if (achievement.status === AchievementLogStatus.CLAIMABLE) {
      return t('Claim');
    } else if (achievement.action?.label) {
      return achievement.action?.label;
    }

    return undefined;
  }, [t]);

  const doAchievementAction = useCallback((achievement: Achievement) => {
    const action = achievement.action;

    if (achievement.status === AchievementLogStatus.CLAIMABLE) {
      return async () => {
        await apiSDK.claimAchievement(achievement.milestoneId);
        await apiSDK.fetchAchievementList();
      };
    } else if (action) {
      return async () => {
        await doAction(action, achievement.milestoneId);
      };
    }

    return undefined;
  }, [doAction]);

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

      if (tk.endTime && endTime && (new Date(tk.endTime).getTime() <= endTime)) {
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
  }, [taskCategories, endTime, tasks, achievements, selectedTab, getTaskStatusText, getTaskActionContent, doTaskAction, getAchievementStatusText, getAchievementActionContent, doAchievementAction]);

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

    '.mission-section + .mission-section': {
      marginTop: 24
    },

    '.mission-item + .mission-item': {
      marginTop: 6
    }
  };
});

export default MissionSectionListContainer;
