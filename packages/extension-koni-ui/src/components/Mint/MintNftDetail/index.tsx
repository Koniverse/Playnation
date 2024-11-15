// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { MintNftDetailAbout, MintNftDetailCondition } from '@subwallet/extension-koni-ui/components/Mint/MintNftDetail/variants';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useConfirmModal, useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { odysseyMintNft } from '@subwallet/extension-koni-ui/messaging/transaction/odyssey';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModalFuncProps } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, HouseLine, ShareNetwork, SmileySad } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  airdropNftInfo: IAirdropNftMinting,
  onSuccess: VoidFunction;
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

const enum IAirdropNftMintingProcess {
  END_CAMPAIGN = 'END_CAMPAIGN',
  ELIGIBLE = 'ELIGIBLE'
}

const telegramConnector = TelegramConnector.instance;

const Component: React.FC<Props> = (props: Props) => {
  const { airdropNftInfo, className, onSuccess } = props;
  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const { token } = useTheme() as Theme;
  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connectWC, requireWC } = useContext(WalletConnectContext);
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

  const notifyIneligibleProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'alert-ineligible-mint',
    className: CN('mint-detail-sub-modal', className),
    title: t('Ineligible to mint'),
    okText: t('Back to home'),
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Oops, your account is not eligible')}</div>
        <div className={'__sub-title-modal'}>{t('Your account doesn’t meet the required conditions to be eligible to mint Koni Story badge')}</div>
      </div>
    ),
    icon: (
      <div className={'__icon-modal'}>
        <Icon
          customSize={'60px'}
          iconColor={token.colorIcon}
          phosphorIcon={SmileySad}
          size='md'
          weight={'fill'}
        />
      </div>
    ),
    closable: true,
    maskClosable: true,
    okCancel: false,
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={HouseLine}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIcon]);

  const failedToMintProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'failed_to_mint',
    className: CN('mint-detail-sub-modal', className),
    title: t('Failed to mint'),
    okCancel: false,
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Oops, your badge can’t be minted')}</div>
        <div className={'__sub-title-modal'}>{t('Due to some issues, your Koni Story badge can’t be minted at the moment. Come back and try again later!')}</div>
      </div>
    ),
    icon: (
      <div className={'__icon-modal'}>
        <Icon
          customSize={'60px'}
          iconColor={token.colorIconHover}
          phosphorIcon={SmileySad}
          size='md'
          weight={'fill'}
        />
      </div>
    ),
    closable: true,
    maskClosable: true,
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={HouseLine}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIconHover]);

  const { handleSimpleConfirmModal: handleIneligibleModal } = useConfirmModal(notifyIneligibleProps);
  const { handleSimpleConfirmModal: handleFailedToMintModal } = useConfirmModal(failedToMintProps);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const buttonType = (() => {
    const now = Date.now();
    const shouldCheck = airdropNftInfo?.start_mint && new Date(airdropNftInfo?.start_mint).getTime() < now;
    const endCampaign = airdropNftInfo?.end && new Date(airdropNftInfo?.end).getTime() < now;
    const eligibility = { currentProcess: IAirdropNftMintingProcess.ELIGIBLE };

    if (!shouldCheck && !endCampaign) {
      return buttonTypeConst.COMING_SOON;
    }

    if (eligibility && eligibility.currentProcess) {
      switch (eligibility.currentProcess) {
        case IAirdropNftMintingProcess.END_CAMPAIGN:
          return buttonTypeConst.END_CAMPAIGN;
        default:
          return buttonTypeConst.MINT;
      }
    } else {
      return buttonTypeConst.MINT;
    }
  })();

  const onMint = useCallback(async (address: string) => {
    try {
      setIsLoading(true);

      const isEligible = await new Promise<boolean>((resolve) => {
        if (!address) {
          resolve(false);
        }

        apiSDK
          .fetchStoryBadgeEligibility(address)
          .then(resolve)
          .catch((error: Error) => {
            console.error('Error fetching eligibility:', error);
            resolve(false);
          });
      });

      if (!isEligible) {
        handleIneligibleModal().then(goHome).catch(console.error);
        setIsLoading(false);

        return;
      }

      const { signature } = await apiSDK.getSignatureMintNft(address);

      const transaction = await odysseyMintNft({ address, chain: 'storyOdyssey_testnet', signature });

      if (transaction.errors.length) {
        handleFailedToMintModal().then(goHome).catch(console.error);
        setIsLoading(false);

        return;
      } else {
        onSuccess();
      }
    } catch (e) {
      notify({
        message: (e as Error).message,
        type: 'error'
      });
    }

    setIsLoading(false);
  }, [handleIneligibleModal, goHome, handleFailedToMintModal, onSuccess, notify]);

  const onPreMint = useCallback(() => {
    const getAddress = new Promise<string>((resolve, reject) => {
      if (wcAccount) {
        resolve(wcAccount.address);
      } else {
        requireWC()
          .then(connectWC)
          .then((address) => {
            if (address) {
              resolve(address);
            } else {
              reject(new Error('Failed to get address'));
            }
          })
          .catch(reject);
      }
    });

    getAddress
      .then((address) => {
        return onMint(address);
      })
      .catch(console.error);
  }, [connectWC, onMint, requireWC, wcAccount]);

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
            onClick={onPreMint}
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
              airdropInfo={airdropNftInfo}
              className={'tab-content'}
            />
          )
        }
        {
          selectedTab === TabType.ABOUT && (
            <MintNftDetailAbout
              airdropInfo={airdropNftInfo}
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

    '&.mint-detail-sub-modal': {
      maxHeight: '100%',
      marginBottom: 0,
      backgroundColor: 'transparent',
      justifyContent: 'flex-end',

      '.ant-sw-modal-confirm-body': {
        background: extendToken.colorBgGradient,
        borderRadius: 24,
        padding: `${token.paddingXL}px ${token.paddingMD}px`,

        '.ant-sw-modal-confirm-content': {
          padding: 0,
          margin: 0
        },

        '.__icon-modal': {
          borderRadius: '50%',
          padding: token.paddingLG - 2,
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: token.colorWhite
        },

        '.__description-modal': {
          display: 'flex',
          flexDirection: 'column',
          gap: token.size
        },

        '.__title-modal': {
          fontSize: token.fontSizeHeading5,
          lineHeight: token.lineHeightHeading5,
          color: token.colorText,
          fontWeight: 600
        },

        '.__sub-title-modal': {
          fontSize: token.fontSizeHeading6,
          lineHeight: token.lineHeightHeading6,
          fontWeight: 500,
          color: token.colorTextDark2
        }
      },
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
