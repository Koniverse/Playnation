// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CalendarIcon, MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DAILY_REWARDS_MODAL_ID, DailyRewardsModal } from './DailyRewardsModal';

type Props = ThemeProps;
const apiSdk = BookaSdk.instance;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { className = '' } = props;
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [dailyRewards, setDailyRewards] = useState(apiSdk.getDailyRewardAchievements());

  const claimableDailyRewards = useCallback(() => {
    return dailyRewards.filter((item) => item.status === 'claimable');
  }, [dailyRewards]);
  const openDailyRewardsModal = useCallback(() => {
    activeModal(DAILY_REWARDS_MODAL_ID);
  }, [activeModal]);

  const closeDailyRewardsModal = useCallback(() => {
    inactiveModal(DAILY_REWARDS_MODAL_ID);
  }, [inactiveModal]);

  const onCancelDailyRewardsModal = useCallback(() => {
    closeDailyRewardsModal();
  }, [closeDailyRewardsModal]);

  const onClaimedDailyRewardsModal = useCallback(() => {
    closeDailyRewardsModal();
  }, [closeDailyRewardsModal]);

  useEffect(() => {
    const sub1 = apiSdk.subscribeDailyRewardAchievements().subscribe((achievements: Achievement[]) => {
      setDailyRewards(achievements);
    });

    return () => {
      sub1.unsubscribe();
    };
  }, []);

  return (
    <>
      <div className={className}>

        <div className='__action-button-wrapper'>
          <MythButton
            className={'__action-button'}
            icon={
              <CalendarIcon className={'__action-button-icon'} />
            }
            onClick={openDailyRewardsModal}
          >

            {t('Daily rewards')}
          </MythButton>

          {claimableDailyRewards().length > 0 && <div className={'__notice-icon'}></div>}
        </div>
      </div>

      <DailyRewardsModal
        onCancel={onCancelDailyRewardsModal}
        onClaimed={onClaimedDailyRewardsModal}
      />
    </>
  );
}

export const DailyRewardsArea = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    position: 'relative',

    '.__action-button-wrapper': {
      position: 'relative'
    },

    '.__action-button': {
      height: 40,
      paddingLeft: 9,
      paddingRight: 7,

      '.__button-inner': {
        gap: 4
      },

      '.__action-button-icon': {
        fontSize: 16,
        color: token.colorWhite
      },

      '.__button-content': {
        fontSize: '16px',
        lineHeight: '20px',
        color: token.colorWhite
      },

      '.__button-background': {
        filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        backgroundImage: 'url(/images/mythical/daily-rewards/trigger-button.png)',
        backgroundPosition: 'center center',
        filter: 'drop-shadow(1.197px 1.197px 0px #000)',
        backgroundSize: '100% 100%'
      }
    },

    '.__notice-icon': {
      position: 'absolute',
      zIndex: 2,
      minWidth: 17,
      height: 17,
      backgroundImage: 'url(/images/mythical/notice-icon.png)',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      top: -5,
      right: -5
    }
  });
});
