// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { MintNftDetailAbout, MintNftDetailCondition } from '@subwallet/extension-koni-ui/components/Mint/MintNftDetail/variants';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NftAirdropMint } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { ALERT_CONNECT_WALLET_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useConfirmModal, useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModalFuncProps } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, ShareNetwork, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = ThemeProps & {
  nftAirdropInfo: NftAirdropMint
};

const apiSDK = BookaSdk.instance;

enum TabType {
  CONDITION = 'condition',
  ABOUT = 'about',
  HISTORY = 'history',
}

const enum buttonTypeConst {
  MINT = 1,
  COMING_SOON = 2,
  END_CAMPAIGN = 3
}

const enum NftAirdropMintProcess {
  END_CAMPAIGN = 'END_CAMPAIGN',
  ELIGIBLE = 'ELIGIBLE'
}

const telegramConnector = TelegramConnector.instance;

const Component: React.FC<Props> = ({ className, nftAirdropInfo }: Props) => {
  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const tabGroupItems = useMemo<TabGroupItemType[]>(() => {
    return [
      {
        label: t('Condition'),
        value: TabType.CONDITION
      },
      {
        label: t('About'),
        value: TabType.ABOUT
      }
    ];
  }, [t]);

  const fetchEligibility = useCallback(async () => {
    try {
      if (!wcAccount?.address) {
        return;
      }

      return await apiSDK.fetchStoryBadgeEligibility(wcAccount?.address);
    } catch (error) {
      console.error('Error fetching eligibility:', error);
    }

    return false;
  }, [wcAccount?.address]);

  const notifyIneligibleProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'alert-ineligible-mint',
    className: CN('mint-detail-sup-modal', className),
    title: t('Ineligible to mint'),
    okText: t('Back to home'),
    content: (
      <div>
        <div>{t('Oops, your account is not eligible')}</div>
        <div>{t('Your account doesn’t meet the required conditions to be eligible to mint Koni Story badge')}</div>
      </div>
    ),
    closable: true,
    maskClosable: true,
    okCancel: false,
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={XCircle}
          size='md'
        />
      ),
      schema: 'secondary'
    }
  }), [className, t]);

  const { handleSimpleConfirmModal: handleIneligibleModal } = useConfirmModal(notifyIneligibleProps);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const onClickShare = useCallback(async () => {
    if (!nftAirdropInfo) {
      return;
    }

    const url = '';

    if (url) {
      telegramConnector.openLink(url);
    }
  }, [nftAirdropInfo]);

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
    const shouldCheck = nftAirdropInfo?.start_mint && new Date(nftAirdropInfo?.start_mint).getTime() < now;
    const endCampaign = nftAirdropInfo?.end && new Date(nftAirdropInfo?.end).getTime() < now;
    const eligibility = { currentProcess: NftAirdropMintProcess.ELIGIBLE };

    if (!shouldCheck && !endCampaign) {
      return buttonTypeConst.COMING_SOON;
    }

    if (eligibility && eligibility.currentProcess) {
      switch (eligibility.currentProcess) {
        case NftAirdropMintProcess.END_CAMPAIGN:
          return buttonTypeConst.END_CAMPAIGN;
        default:
          return buttonTypeConst.MINT;
      }
    } else {
      return buttonTypeConst.MINT;
    }
  })();

  const onMint = useCallback(() => {
    setIsLoading(true);

    if (!wcAccount?.address) {
      setIsLoading(false);
      activeModal(ALERT_CONNECT_WALLET_MODAL);

      return;
    }

    fetchEligibility().then((eligibility) => {
      if (!eligibility) {
        handleIneligibleModal().then(goHome).catch(console.error);

        return;
      }

      // TODO: Implement minting logic

      notify({
        message: t('Please check your wallet'),
        type: 'warning'
      });
      setIsLoading(false);
    }).catch((error) => {
      notify({
        message: (error as Error).message,
        type: 'error'
      });
      setIsLoading(false);
    });
  }, [wcAccount?.address, fetchEligibility, notify, t, handleIneligibleModal]);

  const renderButton = () => {
    return (

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
        {buttonType === buttonTypeConst.MINT && (
          <Button
            block={true}
            icon={
              <Icon
                customSize={'20px'}
                phosphorIcon={ArrowCircleRight}
                weight='fill'
              />
            }
            loading={isLoading}
            onClick={onMint}
            shape={'round'}
          >
            {t('Mint now')}
          </Button>
        )}
      </>
    );
  };

  return (
    <div className={className}>
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
            <MintNftDetailCondition
              airdropInfo={nftAirdropInfo}
              className={'tab-content'}
            />
          )
        }
        {
          selectedTab === TabType.ABOUT && (
            <MintNftDetailAbout
              airdropInfo={nftAirdropInfo}
              className={'tab-content'}
            />
          )
        }
      </div>

      <div className='footer-part'>
        {renderButton()}

      </div>
    </div>

  );
};

const MintNftDetail = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    backgroundColor: extendToken.colorBgSecondary1,
    marginBottom: token.margin,
    borderRadius: 20,
    maxHeight: 350,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
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
      display: 'flex',
      flexDirection: 'column'
    },

    '.footer-part': {
      padding: token.padding,

      '.ant-btn': {
        height: 48
      },

      '.ant-btn-content-wrapper': {
        fontSize: token.fontSizeHeading6,
        lineHeight: token.lineHeightHeading6,
        weight: 500
      }
    },

    '&.mint-detail-sup-modal': {
      maxHeight: '100%',
      marginBottom: 0,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',
      '.ant-sw-modal-confirm-btns': {
        flexDirection: 'row',

        '.ant-btn': {
          flex: 1
        }
      }
    }
  });
});

export default MintNftDetail;
