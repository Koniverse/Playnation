// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, LoadingScreen, TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign, AirdropEligibility, AirdropRaffle, AirdropRewardHistoryLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { AirdropDetailAbout } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/About';
import { AirdropDetailCondition } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/Condition';
import { AirdropDetailHeader } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/Header';
import { AirdropDetailHistory } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/History';
import { AIRDROP_REWARD_MODAL_ID, AirdropRewardModal } from '@subwallet/extension-koni-ui/Popup/Home/Airdrop/AirdropDetail/RewardModal';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { Alarm, ArrowCircleRight, CheckCircle, ShareNetwork } from 'phosphor-react';
import React, { Context, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { ThemeContext } from 'styled-components';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import DefaultLogosMap  from '@subwallet/extension-koni-ui/assets/logo';
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
  END_CAMPAIGN = 4
};

const enum AirdropCampaignProcess {
  RAFFLE = 'RAFFLE',
  END_CAMPAIGN = 'END_CAMPAIGN',
  INELIGIBLE = 'INELIGIBLE',
  ELIGIBLE = 'ELIGIBLE'
}

const rewardModalId = AIRDROP_REWARD_MODAL_ID;

const LoadingGIF = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

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
  const [claim, setClaim] = useState<boolean>(false);
  const [airdropHistory, setAirdropHistory] = useState<AirdropRewardHistoryLog | null>(null);
  const [loadingRaffle, showLoadingRaffle] = useState<boolean>(false);

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
      const data = await apiSDK.subscribeCheckEligibility(currentAirdrop.airdrop_campaign_id) as unknown as AirdropEligibility;
      if (data) {
        setEligibility(data);
        currentAirdrop.eligibilityIds = data.eligibilityIds;
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  }, [currentAirdrop.airdrop_campaign_id, raffle, inactiveModal, claim]);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await apiSDK.subscribeAirdropHistory(currentAirdrop.airdrop_campaign_id) as unknown as AirdropRewardHistoryLog;
      if (data) {
        setAirdropHistory(data);
      }
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }
  }, [currentAirdrop.airdrop_campaign_id, raffle, inactiveModal, claim, notify]);

  useEffect(() => {
    fetchEligibility();
    fetchHistory();
  }, [fetchEligibility, fetchHistory]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const onBack = useCallback(() => {
    navigate('/home/airdrop');
  }, [navigate]);

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
          //
        }
      }
    ];
  }, []);

  const buttonType = (() => {
    if (eligibility && eligibility.currentProcess && eligibility.eligibility) {
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
      const result = await apiSDK.subscribeAirdropRaffle(currentAirdrop.airdrop_campaign_id) as unknown as AirdropRaffle;
      setRaffle(result);
      showLoadingRaffle(true);
      setTimeout(() => {
        showLoadingRaffle(false);
        activeModal(rewardModalId);
      },3000);

    } catch (error) {
      setRaffle(null);
      console.log('error', error);
    }
  }, [activeModal]);

  const onCancel = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  const onClaim = useCallback(async (airdrop_record_id?: number) => {
    setIsLoading(true);
    try {
      let airdropRecordLogId;
      if (raffle) {
        airdropRecordLogId = raffle.airdropRecordLogId;
      } else if (airdrop_record_id !== undefined) {
        airdropRecordLogId = airdrop_record_id;
      } else {
        throw new Error('No airdrop record ID available');
      }
      await apiSDK.subscribeAirdropClaim(airdropRecordLogId);

      notify({
        message: t('Claim successfully'),
        type: 'success'
      });
      inactiveModal(rewardModalId);
      setIsLoading(false);
      await fetchHistory();
      setClaim(true);
    } catch (error) {
      notify({
        message: (error as Error).message,
        type: 'error'
      });
      inactiveModal(rewardModalId);
      setIsLoading(false);
      setClaim(false);
    }
  }, [raffle,notify, inactiveModal]);

  const onClaimLater = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);


  const renderButton = () => {
    return (
      <>
        {eligibility ? (
          <>
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
                    weight="fill"
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
                    weight="fill"
                  />
                }
                shape={'round'}
              >
                {t('eligible')}
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
                    weight="fill"
                  />
                }
                onClick={onRaffle}
                shape={'round'}
              >
                {t('Raffle')} {eligibility?.totalBoxOpen}/{eligibility?.totalBox}
              </Button>
            )}
          </>
        ) : (
          <Button
            block={true}
            disabled={true}
            icon={
              <Icon
                phosphorIcon={Alarm}
                weight="fill"
              />
            }
            shape={'round'}
          >
            {t('Eligible')}
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
              className={'tab-content'}
              airdropHistory={airdropHistory}
              onClaim={onClaim}
            />
          )
        }
      </div>

      <div className='footer-part'>
        {renderButton()}

      </div>

      <AirdropRewardModal
        onCancel={onCancel}
        onClaim={onClaim}
        onClaimLater={onClaimLater}
        raffle={raffle}
        isLoading={isLoading}
      />
      {loadingRaffle && (
        <LoadingGIF>
          <img src={DefaultLogosMap.boxGift} alt="Loading..." />
        </LoadingGIF>)
      }

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
    '.ant-sw-screen-layout-body': {
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
