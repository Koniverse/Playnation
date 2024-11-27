// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MissionItem, MissionItemType } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement, AchievementLogStatus } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

// todo: Some functions is the same with the ones in Mission, move them to utils later
function getAccordantAchievement (achievements: Achievement[]): Achievement | undefined {
  const resultMap: Record<string, Achievement> = {};

  achievements.forEach((achievement) => {
    // Skip items with CLAIMED status
    if ([AchievementLogStatus.CLAIMED, AchievementLogStatus.CLAIMABLE].includes(achievement.status)) {
      return;
    }

    if (!achievement.metrics.some((m) => m.type === 'referral:quantity')) {
      return;
    }

    // If there's no existing item in the result for this slug, or if the new item has a lower milestoneOrdinal, update it
    if (
      !resultMap[achievement.documentId] ||
      achievement.milestoneOrdinal < resultMap[achievement.documentId].milestoneOrdinal
    ) {
      resultMap[achievement.documentId] = achievement;
    }
  });

  return Object.values(resultMap).filter((a) => !!a)[0];
}

function getMetricCounterpart (metricId: string, achievement: Achievement): string {
  const metric = achievement.metrics.find((m) => m.metricId === metricId);

  return metric ? (metric.unit || '') : '';
}

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props) => {
  const [achievements, setAchievements] = useState<Achievement[]>(apiSDK.achievementList);

  const getAchievementStatusText = useCallback((achievement: Achievement) => {
    const firstProcessItem = achievement.progress[0];

    if (firstProcessItem) {
      const completed = Math.min(firstProcessItem.completed || 0, firstProcessItem.required);

      return `${completed}/${firstProcessItem.required} ${getMetricCounterpart(firstProcessItem.metricId, achievement)}`.trim();
    }

    return '';
  }, []);

  const missionData: MissionItemType | undefined = useMemo<MissionItemType | undefined>(() => {
    const accordantAchievement = getAccordantAchievement(achievements);

    if (!accordantAchievement) {
      return;
    }

    return {
      id: `${accordantAchievement.id}`,
      title: accordantAchievement.name || '',
      statusText: getAchievementStatusText(accordantAchievement),
      type: 'achievement',
      point: accordantAchievement.pointReward || 0,
      state: 'UNCOMPLETED'
    };
  }, [achievements, getAchievementStatusText]);

  useEffect(() => {
    const achievementListSub = apiSDK.subscribeAchievementList().subscribe((data) => {
      setAchievements(data);
    });

    apiSDK.fetchAchievementList().catch(console.error);

    return () => {
      achievementListSub.unsubscribe();
    };
  }, []);

  if (!missionData) {
    return null;
  }

  return (
    <div
      className={className}
    >
      <MissionItem
        {...missionData}
        className='__mission-item'
      />
    </div>
  );
};

export const InviteMissionArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.__mission-item': {
      backgroundImage: 'url(/images/mythical/invite/invite-mission-area-background.png)',
      backgroundSize: 'calc(100% - 3px) 100%',
      // filter: 'drop-shadow(4px 6px 0px #000)',
      paddingLeft: 24,
      paddingTop: 20,
      paddingRight: 24,
      paddingBottom: 19
    }
  };
});
