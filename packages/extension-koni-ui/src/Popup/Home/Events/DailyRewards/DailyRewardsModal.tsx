// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton, XIcon } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Achievement } from '@subwallet/extension-koni-ui/connector/booka/types';
import { CheckInItem, CheckInItemType } from '@subwallet/extension-koni-ui/Popup/Home/Events/DailyRewards/CheckInItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { getTimeRemaining, preloadImages } from '@subwallet/extension-koni-ui/utils';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onCancel: VoidFunction;
  onClaimed: VoidFunction;
}

export const DAILY_REWARDS_MODAL_ID = 'DAILY_REWARDS_MODAL_ID';
const modalId = DAILY_REWARDS_MODAL_ID;
const apiSdk = BookaSdk.instance;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { className = '', onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [isClaimable, setIsClaimable] = useState(false);
  const [dailyRewards, setDailyRewards] = useState(apiSdk.getDailyRewardAchievements());
  const [timeRange, setTimeRange] = useState(apiSdk.getMetadata()?.timeRange);

  const onClaim = useCallback(() => {
    if (loading || !isClaimable) {
      return;
    }

    const remainingDailyRewards = dailyRewards.filter((item) => item.status === 'claimable');

    setLoading(true);

    Promise.all(remainingDailyRewards.map((item) => apiSdk.claimAchievement(item.milestoneId)))
      .catch(console.error)
      .finally(() => {
        apiSdk.fetchAchievementList()
          .catch(console.error)
          .finally(() => {
            setLoading(false);
          });
      });
  }, [dailyRewards, isClaimable, loading]);

  useEffect(() => {
    const sub1 = apiSdk.subscribeDailyRewardAchievements().subscribe((achievements: Achievement[]) => {
      setDailyRewards(achievements);
    });
    const sub2 = apiSdk.subscribeMetadata().subscribe((metadata) => {
      metadata && setTimeRange(metadata.timeRange);
    });

    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, []);

  const claimButtonLabel = useMemo(() => {
    const claimLabel = t('Claim');

    if (isClaimable) {
      return claimLabel;
    }

    const now = timeRange?.now;
    const endTime = timeRange?.daily?.end;

    if (!now || !endTime) {
      return t('Unavailable');
    }

    return (
      <>
        <span className={'__claim-text'}>{claimLabel}</span>
        <span>&nbsp;</span>
        <span className={'__time-remaining'}>
          ({getTimeRemaining(now, new Date(endTime).toString())})
        </span>
      </>
    );
  }, [isClaimable, t, timeRange?.daily?.end, timeRange?.now]);

  const checkinItems = useMemo<CheckInItemType[]>(() => {
    const result: CheckInItemType[] = [];

    let claimable = false;
    let getChecked = false;

    for (const item of dailyRewards) {
      let state: CheckInItemType['state'] = 'LOCKED';

      console.log(item.milestoneName, item.status);

      if (item.status === 'claimed') {
        state = 'CHECKED';
        getChecked = true;
      } else if (item.status === 'claimable') {
        state = 'AVAILABLE';
        claimable = true;
      } else if (claimable || getChecked) {
        state = 'LOCKED';
      } else {
        state = 'CHECKED';
      }

      result.push({
        id: item.id,
        label: item.milestoneName,
        point: item.pointReward,
        state
      });
    }

    setIsClaimable(claimable);

    return result;
  }, [dailyRewards]);

  useEffect(() => {
    preloadImages([
      '/images/mythical/daily-rewards/modal-background.png',
      '/images/mythical/daily-rewards/claimed.png',
      '/images/mythical/daily-rewards/unclaimed.png',
      '/images/mythical/daily-rewards/cancel-button-mask.png',
      '/images/mythical/daily-rewards/claim-button-mask.png'
    ]);
  }, []);

  return (
    <SwModal
      className={CN(className)}
      id={modalId}
      onCancel={onCancel}
    >
      <div className={'__modal-title'}>{t('Daily rewards')}</div>

      <div className={'__modal-subtitle'}>{t('Come back tomorrow for your next reward.')}</div>

      <div className='__checkin-item-list-container'>
        {
          checkinItems.map((item) => (
            <CheckInItem
              {...item}
              className={'__checkin-item'}
              key={item.id}
            />
          ))
        }
      </div>

      <div className='__buttons-container'>
        <MythButton
          className={'__action-button __close-button'}
          icon={(
            <XIcon className={'__action-button-icon'} />
          )}
          onClick={onCancel}
        >
          {t('Close')}
        </MythButton>

        <MythButton
          className={CN('__action-button __claim-button', {
            '-lock': !isClaimable,
            '-claimable': isClaimable
          })}
          isLoading={loading}
          onClick={onClaim}
        >
          {claimButtonLabel}
        </MythButton>
      </div>
    </SwModal>
  );
}

export const DailyRewardsModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    paddingBottom: 40,
    paddingLeft: 16,
    paddingRight: 16,

    '&.ant-sw-modal.ant-sw-modal': {
      justifyContent: 'flex-start',
      alignItems: 'center',

      '&:before, &:after': {
        content: '""',
        display: 'block',
        flex: 1
      }
    },

    '.ant-sw-modal-content.ant-sw-modal-content': {
      borderRadius: 0,
      maxWidth: 370,
      paddingTop: 24,
      backgroundImage: 'url(/images/mythical/daily-rewards/modal-background.png)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      width: '100%'
    },

    '.ant-sw-modal-body': {
      paddingBottom: 35
    },

    '.ant-sw-modal-header': {
      display: 'none'
    },

    '.__modal-title': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: '32px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '40px',
      textTransform: 'uppercase',
      marginBottom: 10
    },

    '.__modal-subtitle': {
      color: extendToken.mythColorGray1,
      textAlign: 'center',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px',
      marginBottom: 20
    },

    '.__checkin-item-list-container': {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 20
    },

    '.__checkin-item': {
      // flex: '1 1 20.1%'
    },

    '.__buttons-container': {
      display: 'flex',
      gap: 12
    },

    '.__action-button': {
      height: 52,
      paddingLeft: 12,
      paddingRight: 10,

      '.__button-content': {
        fontSize: '22px',
        lineHeight: '24px',
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__close-button': {
      maxWidth: '45%',
      flex: '1 5 auto',

      '.__button-inner': {
        gap: 4
      },

      '.__action-button-icon': {
        order: 1,
        color: extendToken.mythColorDark,
        fontSize: 24
      },

      '.__button-background:before': {
        backgroundColor: token.colorWhite,
        maskImage: 'url(/images/mythical/daily-rewards/cancel-button-mask.png)'
      }
    },

    '.__time-remaining': {
      color: extendToken.mythColorGray4
    },

    '.__claim-button': {
      flex: '1 0 auto',

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/daily-rewards/claim-button-mask.png)'
      },

      '&.-lock': {
        '.__button-background:before': {
          backgroundColor: extendToken.mythColorGray2
        }
      },

      '&.-claimable': {
        '.__button-background:before': {
          backgroundColor: token.colorPrimary
        }
      }
    }
  });
});
