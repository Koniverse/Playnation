// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, LoadingScreen, TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign, AirdropEligibility, AirdropRaffle, AirdropRewardHistoryLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { AirdropDetailAbout } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/About';
import { AirdropDetailCondition } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/Condition';
import { AirdropDetailHeader } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/Header';
import { AirdropDetailHistory } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/History';
import { AIRDROP_REWARD_MODAL_ID, AirdropRewardModal } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/RewardModal';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { ArrowCircleRight, CheckCircle, ShareNetwork } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';

type WrapperProps = ThemeProps;
type Props = ThemeProps & {
  currentAirdrop: AirdropCampaign;
};

const apiSDK = BookaSdk.instance;

enum TabType {
  CONDITION = 'condition',
  ABOUT = 'about',
  HISTORY = 'history',
}

const enum buttonTypeConst {
  ELIGIBLE = 1,
  RAFFLE = 2,
  INELIGIBLE = 3,
  END_CAMPAIGN = 4,
  COMING_SOON = 5
}

const enum AirdropCampaignProcess {
  RAFFLE = 'RAFFLE',
  END_CAMPAIGN = 'END_CAMPAIGN',
  INELIGIBLE = 'INELIGIBLE',
  ELIGIBLE = 'ELIGIBLE'
}

const rewardModalId = AIRDROP_REWARD_MODAL_ID;
const telegramConnector = TelegramConnector.instance;

const Component: React.FC<Props> = ({ className, currentAirdrop }: Props) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const [eligibility, setEligibility] = useState<AirdropEligibility | null>(null);
  const [raffle, setRaffle] = useState<AirdropRaffle | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingRaffle, setIsLoadingRaffle] = useState<boolean>(false);
  const [airdropHistory, setAirdropHistory] = useState<AirdropRewardHistoryLog | null>(null);

  const tabGroupItems = useMemo<TabGroupItemType[]>(() => {
    return [
      {
        label: t('Condition'),
        value: TabType.CONDITION
      },
      {
        label: t('About'),
        value: TabType.ABOUT
      },
      {
        label: t('History'),
        value: TabType.HISTORY
      }

    ];
  }, [t]);

  const fetchEligibility = useCallback(async () => {
    try {
      const data = await apiSDK.fetchEligibility(currentAirdrop.airdrop_campaign_id) as unknown as AirdropEligibility;

      if (data) {
        setEligibility(data);
        currentAirdrop.eligibilityIds = data.eligibilityIds;
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  }, [currentAirdrop]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await apiSDK.fetchAirdropHistory(currentAirdrop.airdrop_campaign_id) as AirdropRewardHistoryLog;

      if (data) {
        setAirdropHistory(data);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  }, [currentAirdrop.airdrop_campaign_id]);

  useEffect(() => {
    fetchEligibility().catch(console.error);
    fetchHistory().catch(console.error);
  }, [fetchEligibility, fetchHistory]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const onBack = useCallback(() => {
    navigate('/home/airdrop');
  }, [navigate]);

  const onClickShare = useCallback(async () => {
    if (!currentAirdrop) {
      return;
    }

    const url = apiSDK.getShareTwitterAirdropURL(currentAirdrop);

    if (url) {
      telegramConnector.openLink(url);
    }
  }, [currentAirdrop]);

  const subHeaderIcons = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={ShareNetwork}
            size='md'
          />
        ),
        onClick: () => {
          onClickShare().catch(console.error);
        }
      }
    ];
  }, [onClickShare]);

  const buttonType = (() => {
    const now = Date.now();
    const shouldCheck = currentAirdrop?.start_claim && new Date(currentAirdrop?.start_claim).getTime() < now;
    const endCampaign = currentAirdrop?.end && new Date(currentAirdrop?.end).getTime() < now;

    if (!shouldCheck && !endCampaign) {
      return buttonTypeConst.COMING_SOON;
    }

    if (eligibility && eligibility.currentProcess) {
      switch (eligibility.currentProcess) {
        case AirdropCampaignProcess.ELIGIBLE:
          return buttonTypeConst.ELIGIBLE;
        case AirdropCampaignProcess.INELIGIBLE:
          return buttonTypeConst.INELIGIBLE;
        case AirdropCampaignProcess.RAFFLE:
          return buttonTypeConst.RAFFLE;
        case AirdropCampaignProcess.END_CAMPAIGN:
          return buttonTypeConst.END_CAMPAIGN;
        default:
          return buttonTypeConst.ELIGIBLE;
      }
    } else {
      return buttonTypeConst.INELIGIBLE;
    }
  })();

  const onRaffle = useCallback(async () => {
    try {
      setIsLoadingRaffle(true);
      const raffleResult = await apiSDK.raffleAirdrop(currentAirdrop.airdrop_campaign_id) as AirdropRaffle;

      setRaffle(raffleResult);
      activeModal(rewardModalId);
      setIsLoadingRaffle(false);
    } catch (error) {
      setRaffle(null);
      setIsLoadingRaffle(false);
      notify({
        message: (error as Error).message,
        type: 'error'
      });
    }
  }, [activeModal, currentAirdrop.airdrop_campaign_id, notify]);

  const onCancel = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  const onClaim = useCallback(async (airdropRecordId?: number) => {
    setIsLoading(true);

    try {
      let airdropRecordLogId;

      if (raffle) {
        airdropRecordLogId = raffle.airdropRecordLogId;
      } else if (airdropRecordId !== undefined) {
        airdropRecordLogId = airdropRecordId;
      } else {
        throw new Error('No airdrop record ID available');
      }

      await apiSDK.claimRaffle(airdropRecordLogId);

      notify({
        message: t('Claim successfully'),
        type: 'success'
      });
      inactiveModal(rewardModalId);
      setIsLoading(false);
      await fetchHistory();
    } catch (error) {
      notify({
        message: (error as Error).message,
        type: 'error'
      });
      inactiveModal(rewardModalId);
      setIsLoading(false);
    }
  }, [raffle, notify, t, inactiveModal, fetchHistory]);

  const onClaimLater = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  const renderButton = () => {
    return (
      <>
        {eligibility
          ? (
            <>
              {buttonType === buttonTypeConst.COMING_SOON && (
                <Button
                  block={true}
                  disabled={true}
                  shape={'round'}
                >
                  {t('Coming Soon')}
                </Button>
              )}
              {buttonType === buttonTypeConst.INELIGIBLE && (
                <Button
                  block={true}
                  disabled={true}
                  shape={'round'}
                >
                  {t('InEligible')}
                </Button>
              )}
              {buttonType === buttonTypeConst.END_CAMPAIGN && (
                <Button
                  block={true}
                  disabled={true}
                  icon={
                    <Icon
                      phosphorIcon={ArrowCircleRight}
                      weight='fill'
                    />
                  }
                  shape={'round'}
                >
                  {t('End Campaign')}
                </Button>
              )}
              {buttonType === buttonTypeConst.ELIGIBLE && (
                <Button
                  block={true}
                  disabled={true}
                  icon={
                    <Icon
                      phosphorIcon={ArrowCircleRight}
                      weight='fill'
                    />
                  }
                  shape={'round'}
                >
                  {t('Eligible')}
                </Button>
              )}
              {buttonType === buttonTypeConst.RAFFLE && (
                <Button
                  block={true}
                  disabled={eligibility?.totalBoxOpen === eligibility?.totalBox}
                  icon={
                    <Icon
                      iconColor={token.colorPrimary}
                      phosphorIcon={CheckCircle}
                      weight='fill'
                    />
                  }
                  loading={isLoadingRaffle}
                  onClick={onRaffle}
                  shape={'round'}
                >
                  {t('Raffle')} {eligibility.price > 0 ? t('with {{price}} NPS', { price: eligibility.price }) : ''} ({eligibility?.totalBoxOpen}/{eligibility?.totalBox})
                </Button>
              )}
            </>
          )
          : (
            <Button
              block={true}
              disabled={true}
              shape={'round'}
            >
              {t('Coming Soon')}
            </Button>
          )}
      </>
    );
  };

  return (
    <Layout.WithSubHeaderOnly
      backgroundStyle={'secondary'}
      className={className}
      onBack={onBack}
      subHeaderIcons={subHeaderIcons}
      title={t('Campaign detail')}
    >
      <AirdropDetailHeader
        airdropInfo={currentAirdrop}
        className={'header-part'}
      />

      <div className='body-part'>
        <div className='tab-group-wrapper'>
          <TabGroup
            className={'tab-group'}
            items={tabGroupItems}
            onSelect={onSelectTab}
            selectedItem={selectedTab}
          />
        </div>

        {
          selectedTab === TabType.CONDITION && (
            <AirdropDetailCondition
              airdropInfo={currentAirdrop}
              className={'tab-content'}
            />
          )
        }
        {
          selectedTab === TabType.ABOUT && (
            <AirdropDetailAbout
              airdropInfo={currentAirdrop}
              className={'tab-content'}
            />
          )
        }
        {
          selectedTab === TabType.HISTORY && (
            <AirdropDetailHistory
              airdropHistory={airdropHistory}
              className={'tab-content'}
              onClaim={onClaim}
            />
          )
        }
      </div>

      <div className='footer-part'>
        {renderButton()}

      </div>

      <AirdropRewardModal
        currentAirdrop={currentAirdrop}
        isLoading={isLoading}
        onCancel={onCancel}
        onClaim={onClaim}
        onClaimLater={onClaimLater}
        raffle={raffle}
      />

    </Layout.WithSubHeaderOnly>
  );
};

const WrapperComponent = (props: WrapperProps): React.ReactElement<Props> => {
  const { id: campaignId } = useParams<{ id: string }>();
  const [airdropList, setAirdropList] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);

  const currentAirdropCampaign = useMemo(() => {
    return airdropList.find((a) => campaignId && a.airdrop_campaign_id === +campaignId);
  }, [airdropList, campaignId]);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropList(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!currentAirdropCampaign) {
    return <LoadingScreen />;
  }

  return (
    <Component
      {...props}
      currentAirdrop={currentAirdropCampaign}
    />
  );
};

const AirdropDetail = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    '.ant-sw-screen-layout-body-inner': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      display: 'flex',
      flexDirection: 'column'
    },

    '.tab-group-wrapper': {
      paddingLeft: 6,
      paddingRight: 6,
      paddingTop: token.paddingSM,
      paddingBottom: token.paddingSM
    },

    '.tab-group': {
      backgroundColor: 'transparent',

      '.__tab-item': {
        borderColor: 'transparent'
      },

      '.__tab-item.-disabled': {
        opacity: 0.4
      }
    },

    '.tab-content': {
      flex: 1,
      overflow: 'auto'
    },

    '.header-part': {
      marginBottom: token.margin
    },

    '.body-part': {
      flex: 1,
      overflow: 'hidden',
      marginBottom: token.margin,
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 20,
      display: 'flex',
      flexDirection: 'column'
    },

    '.footer-part': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 24
    }
  });
});

export default AirdropDetail;
