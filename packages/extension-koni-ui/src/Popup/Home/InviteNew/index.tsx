// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { GameAccountItem, SubScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { GameAccountItemType } from '@subwallet/extension-koni-ui/components/Mythical/Leaderboard/GameAccountItem';
import { useDefaultNavigate, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import CallToAction from '../../../components/Mythical/Common/CallToAction';
import { InviteFriendsArea } from './InviteFriendsArea';
import { InviteMissionArea } from './InviteMissionArea';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/invite');
  const { goBack } = useDefaultNavigate();

  const { t } = useTranslation();

  const mockItems = useMemo(() => {
    const result: GameAccountItemType[] = [];

    for (let i = 1; i <= 20; i++) {
      result.push({
        avatarSrc: '/images/mythical/user-image.png',
        name: `Brad_MaddenMaster_${i}`,
        point: 7712000
      });
    }

    return result;
  }, []);

  return (
    <Layout.Base
      className={className}
      showHeader={false}
    >
      <SubScreenHeader
        className={'header-area'}
        onBack={goBack}
        title={t('Your friends')}
      />

      <InviteFriendsArea className={'invite-friends-area'} />

      <InviteMissionArea className={'invite-mission-area'} />

      <div className='friend-list-container'>
        {
          mockItems.map((item) => (
            <GameAccountItem
              {...item}
              className={'friend-item'}
              key={item.prefix}
            />
          ))
        }
      </div>

      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        subtitle={'Download NFL Rivals App'}
        title={'Want more friends?'}
      />
    </Layout.Base>
  );
};

const Invite = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-screen-layout-body-inner': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 4
    },

    '.header-area': {
      marginBottom: 12
    },

    '.invite-friends-area': {
      paddingTop: 26,
      paddingLeft: 24,
      paddingRight: 24,
      marginBottom: 8
    },

    '.invite-mission-area': {
      marginBottom: 8
    },

    '.friend-list-container': {
      flex: 1,
      overflow: 'auto',
      paddingBottom: 4
    },

    '.friend-item + .friend-item': {
      marginTop: 4
    },

    '.call-to-action': {

    }
  };
});

export default Invite;
