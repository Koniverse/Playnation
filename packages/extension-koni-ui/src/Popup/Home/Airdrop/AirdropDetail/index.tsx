// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, LoadingScreen, TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign, AirdropEligibility, AirdropReward } from '@subwallet/extension-koni-ui/connector/booka/types';
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

const Component: React.FC<Props> = ({ className, currentAirdrop }: Props) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;
  const [eligibility, setEligibility] = useState<AirdropEligibility | null>(null);
  const [checkEgibility, setCheckEgibility] = useState<boolean>(false);
  const [reward, setReward] = useState<AirdropReward | null>(null);

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

  const fetchEligibility = async (campaignId: number) => {
    try {
      const result: any = await apiSDK.checkEgibilityList(campaignId);
      if (result) {
        setEligibility(result);
        setCheckEgibility(true);
        currentAirdrop.eligibilityIds = [1, 2]
      }
    } catch (error) {
      setCheckEgibility(false)
      setEligibility(null);
    } finally {
      console.log('fetching eligibility list done');
    }
  };
  useEffect(() => {
    if (currentAirdrop && currentAirdrop.airdrop_campaign_id) {
      const startDate = new Date(currentAirdrop.start);
      const currentDate = new Date();
      if (startDate <= currentDate) {
        fetchEligibility(currentAirdrop.airdrop_campaign_id);
      }
    }
  }, [currentAirdrop]);




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


  const onRaffle = useCallback(() => {
    handleRaffle();
  }, [activeModal]);

  const onCancel = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  const onClaim = useCallback(() => {
    if (reward) {
      handleClaim();
    } else {
      console.log('No reward to claim');
    }
  }, [reward]);

  const onClaimLater = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  // handle raflle
  async function handleRaffle() {
    try {
      const result = await apiSDK.raffleAirdrop(currentAirdrop.airdrop_campaign_id) as unknown as AirdropReward;
      setReward(result);
      activeModal(rewardModalId);
    } catch (error) {
      setReward(null);
      console.log('error', error);
    } finally {
      console.log('raffle done');
    }
  }


  // handle claim
  async function handleClaim() {
    if (reward) {
      try {
        const claim = await apiSDK.claimAirdrop(reward.airdropRecordLogId) as unknown as AirdropReward;
        if (claim) {
          notify({
            message: t('Claim successfully'),
            type: 'success'
          });
        }
        inactiveModal(rewardModalId);
      } catch (error) {
        console.log('error', error);
        notify({
          message: (error as Error).message,
          type: 'error'
        });
      } finally {
        console.log('claim done');
      }
    }
  }



  const renderButton = () => {
    return (
      <>
        {checkEgibility ? (
          <>
            {buttonType === buttonTypeConst.INELIGIBLE && (
              <Button
                block={true}
                disabled={true}
                shape={'round'}
              >
                {t('INELIGIBLE')}
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
                {t('END CAMPAIGN')}
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
                {t('ELIGIBLE')}
              </Button>
            )}
            {buttonType === buttonTypeConst.RAFFLE && (
              <Button
                block={true}
                disabled={eligibility?.totalBoxOpen === eligibility?.totalBox ? true : false}
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
            {t('ELIGIBLE')}
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
        reward={reward}
      />
    </Layout.WithSubHeaderOnly>
  );
};

const WrapperComponent = (props: WrapperProps): React.ReactElement<Props> => {
  const { id: campaignId } = useParams<{ id: string }>();
  const [airdropList, setAirdropList] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);
  const [eligibility, setEligibility] = useState<AirdropEligibility[]>(apiSDK.checkEligibilityList);

  const currentAirdropCampaign = useMemo(() => {
    return airdropList.find((a) => campaignId && a.airdrop_campaign_id === +campaignId);
  }, [airdropList, campaignId]);



  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropCampaign().subscribe((data) => {
      setAirdropList(data);
    });
    const subscriptionEligibility = apiSDK.subscribeCheckEligibility().subscribe((data) => {
      setEligibility(data);
    });

    return () => {
      subscription.unsubscribe();
      subscriptionEligibility.unsubscribe();
    };
  }, []);

  if (!currentAirdropCampaign || !eligibility) {
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
