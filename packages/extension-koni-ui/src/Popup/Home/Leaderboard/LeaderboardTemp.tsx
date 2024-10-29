// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GameAccountItem, MainScreenHeader, TimeRemaining, TopAccountItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import CallToAction from '../../../components/Mythical/Common/CallToAction';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { t } = useTranslation();

  return (
    <div className={className}>
      <MainScreenHeader
        className={'main-screen-header'}
        title={t('Weekly leaderboard')}
      />

      <div className='time-remaining-wrapper'>
        <TimeRemaining datetime={'12day 10hrs'} />
      </div>

      <div className='top-three-area'>
        <div className='top-account-item-wrapper'>
          {
            <TopAccountItem
              point={8712762}
              rank={2}
              tokenValue={762}
            />
          }
        </div>
        <div className='top-account-item-wrapper -is-first'>
          {
            <TopAccountItem
              isFirst
              point={9712762}
              rank={1}
              tokenValue={762}
            />
          }
        </div>
        <div className='top-account-item-wrapper'>
          {
            <TopAccountItem
              point={8212762}
              rank={3}
              tokenValue={762}
            />
          }
        </div>
      </div>

      <CallToAction
        buttonLabel={'Play now'}
        className={'call-to-action'}
        subtitle={'Download NFL Rivals App'}
        title={'Want to take your profile to the next level?'}
      />

      <div>
        <GameAccountItem
          avatarSrc={'/images/mythical/user-image.png'}
          className={'game-account-item'}
          name={'Brad_MaddenMaster'}
          point={7712000}
          prefix={'100'}
        />

        <GameAccountItem
          avatarSrc={'/images/mythical/user-image.png'}
          className={'game-account-item'}
          name={'Brad_MaddenMaster'}
          point={7712000}
          prefix={'100'}
        />

        <GameAccountItem
          avatarSrc={'/images/mythical/user-image.png'}
          className={'game-account-item'}
          isMine={true}
          name={'Brad_MaddenMaster'}
          point={7712000}
          prefix={'100'}
        />
      </div>
    </div>
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.main-screen-header': {
      maxWidth: 250
    },

    '.time-remaining-wrapper': {
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 20
    },

    '.top-account-item-wrapper': {
      maxWidth: 94,
      flex: 1,
      overflow: 'hidden'
    },

    '.top-account-item-wrapper.-is-first': {
      maxWidth: 123,
      minWidth: 123
    },

    '.top-three-area': {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      gap: 8,
      paddingBottom: token.size
    },

    '.call-to-action': {
      marginBottom: 12
    },

    '.game-account-item + .game-account-item': {
      marginTop: 4
    }
  };
});

export default Leaderboard;
