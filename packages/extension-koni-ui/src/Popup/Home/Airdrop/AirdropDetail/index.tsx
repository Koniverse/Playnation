// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, LoadingScreen, TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
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

const rewardModalId = AIRDROP_REWARD_MODAL_ID;

const Component: React.FC<Props> = ({ className, currentAirdrop }: Props) => {
  const navigate = useNavigate();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const token = useContext<Theme>(ThemeContext as Context<Theme>).token;

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

  // todo: @Khanh, please update logic for this
  const buttonType: number = (() => {
    return 3;
  })();

  const onRaffle = useCallback(() => {
    activeModal(rewardModalId);
  }, [activeModal]);

  const onCancel = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

  const onClaim = useCallback(() => {
    //
  }, []);

  const onClaimLater = useCallback(() => {
    inactiveModal(rewardModalId);
  }, [inactiveModal]);

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
        {
          buttonType === 1 && (
            <Button
              block={true}
              disabled={true}
              icon={(
                <Icon
                  phosphorIcon={Alarm}
                  weight='fill'
                />
              )}
              shape={'round'}
            >
              {t('Comming soon')}
            </Button>
          )
        }

        {
          buttonType === 2 && (
            <Button
              block={true}
              icon={(
                <Icon
                  phosphorIcon={ArrowCircleRight}
                  weight='fill'
                />
              )}
              shape={'round'}
            >
              {t('Eligible')}
            </Button>
          )
        }

        {
          buttonType === 3 && (
            <Button
              block={true}
              icon={(
                <Icon
                  iconColor={token.colorPrimary}
                  phosphorIcon={CheckCircle}
                  weight='fill'
                />
              )}
              onClick={onRaffle}
              shape={'round'}
            >
              {t('Raffle')} {'(3/3)'}
            </Button>
          )
        }
      </div>

      <AirdropRewardModal
        onCancel={onCancel}
        onClaim={onClaim}
        onClaimLater={onClaimLater}
      />
    </Layout.WithSubHeaderOnly>
  );
};

const WrapperComponent = (props: WrapperProps): React.ReactElement<Props> => {
  const { id: campaignId } = useParams<{ id: string }>();
  const [airdropList, setAirdropList] = useState<AirdropCampaign[]>(apiSDK.airdropCampaignList);

  const currentAirdropCampaign = useMemo(() => {
    return airdropList.find((a) => campaignId && a.campaign_id === +campaignId);
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