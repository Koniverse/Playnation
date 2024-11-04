// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MissionItem, MissionItemType } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const missionData: MissionItemType = useMemo<MissionItemType>(() => {
    return {
      id: 'invite-friends',
      title: 'Invite invite 6 friends over this week',
      statusText: '2/6 friends',
      type: 'achievement',
      point: 50,
      state: 'UNCOMPLETED'
    };
  }, []);

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
      filter: 'drop-shadow(4px 6px 0px #000)',
      paddingLeft: 24,
      paddingTop: 20,
      paddingRight: 24,
      paddingBottom: 16
    }
  };
});
