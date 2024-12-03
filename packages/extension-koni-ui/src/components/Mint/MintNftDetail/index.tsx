// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { ConfirmYourAccountModal, TabGroup } from '@subwallet/extension-koni-ui/components';
import { TabGroupItemType } from '@subwallet/extension-koni-ui/components/Common/TabGroup';
import { MintNftDetailAbout, MintNftDetailCondition } from '@subwallet/extension-koni-ui/components/Mint/MintNftDetail/variants';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { IAirdropNftMinting, NftMintingLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { CONFIRM_YOUR_ACCOUNT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useConfirmModal, useDefaultNavigate } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { odysseyMintNft } from '@subwallet/extension-koni-ui/messaging/transaction/odyssey';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwModalFuncProps } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, CheckCircle, HouseLine, SmileySad } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  airdropNftInfo: IAirdropNftMinting,
  onSuccess: (mintedAddress: string) => void;
  isFetchingNftMintingLog: boolean;
  mintingLog?: NftMintingLog;
  alwaysShowMint?: boolean; // for debug
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

const telegramConnector = TelegramConnector.instance;

const Component: React.FC<Props> = (props: Props) => {
  const { airdropNftInfo, alwaysShowMint, className, isFetchingNftMintingLog, mintingLog, onSuccess } = props;
  const notify = useNotification();
  const { goHome } = useDefaultNavigate();
  const { activeModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;
  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>(TabType.CONDITION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { connectWC, requireWC } = useContext(WalletConnectContext);
  const { alertModal } = useContext(WalletModalContext);

  useEffect(() => {
    apiSDK.getNftMintingLog().catch(console.error);
  }, []);

  useEffect(() => {
    if (mintingLog?.status === 'success') {
      onSuccess(mintingLog.address);
      setIsLoading(false);
    } else if (mintingLog?.status === 'submitted') {
      setIsLoading(true);
    } else if (mintingLog?.status === 'failed') {
      if (mintingLog.notify) {
        // Todo: Issue-219 Nofity the minting failed
      }
    }
  }, [mintingLog, onSuccess]);

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
    className: CN('general-confirmation-modal', className),
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
    className: CN('general-confirmation-modal', className),
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

  const badgeAlreadyMintedProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'badge_already_minted',
    className: CN('general-confirmation-modal', className),
    title: t('Failed to mint'),
    okText: t('Got it'),
    okCancel: false,
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Oops, your badge is already minted')}</div>
        <div className={'__sub-title-modal'}>{t('Another Telegram ID has minted a Koni Story badge with this account. Connect to another account and try again')}</div>
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
          phosphorIcon={CheckCircle}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIconHover]);

  const inSufficientBalanceProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'in_sufficient_balance',
    className: CN('general-confirmation-modal', className),
    title: t('Failed to mint'),
    okText: t('Got it'),
    okCancel: false,
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Oops, your badge can’t be minted')}</div>
        <div className={'__sub-title-modal'}>
          <Trans
            components={{ highlight: (
              <a
                className={'__link'}
                href={'https://faucet.story.foundation'}
                rel='noreferrer'
                target='_blank'
              />
            ) }}
            i18nKey={detectTranslate('You don’t have enough IP to mint Koni Story badge. <highlight>Get faucet</highlight> and try again')}
          />
        </div>
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
          phosphorIcon={CheckCircle}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIconHover]);

  const { handleSimpleConfirmModal: handleIneligibleModal } = useConfirmModal(notifyIneligibleProps);
  const { handleSimpleConfirmModal: handleFailedToMintModal } = useConfirmModal(failedToMintProps);
  const { handleSimpleConfirmModal: handleInSufficientBalanceModal } = useConfirmModal(inSufficientBalanceProps);
  const { handleSimpleConfirmModal: handleBadgeAlreadyMintedModal } = useConfirmModal(badgeAlreadyMintedProps);

  const handleExistedLinkedAddressModal = useCallback((address: string) => {
    alertModal.open({
      className: 'general-confirmation-modal modal-revert-header',
      title: t('Failed to mint'),
      iconProps: {
        phosphorIcon: SmileySad,
        weight: 'fill'

      },
      contentTitle: t('Change your wallet account'),
      content: (
        t('Your Telegram ID is linked to account {{address}}. Connect to this account and try minting again', {
          replace: {
            address: toShort(address, 5, 8)
          }
        })
      ),
      okButton: {
        icon: CheckCircle,
        iconWeight: 'fill',
        text: t('Got it'),
        onClick: alertModal.close
      }
    });
  }, [alertModal, t]);

  const onSelectTab = useCallback((value: string) => {
    setSelectedTab(value);
  }, []);

  const buttonType = (() => {
    if (alwaysShowMint) {
      return buttonTypeConst.MINT;
    }

    const now = Date.now();
    const comingSoon = airdropNftInfo?.start_mint && new Date(airdropNftInfo?.start_mint).getTime() > now;
    const endCampaign = airdropNftInfo?.end && new Date(airdropNftInfo?.end).getTime() < now;

    if (comingSoon) {
      return buttonTypeConst.COMING_SOON;
    }

    if (endCampaign) {
      return buttonTypeConst.END_CAMPAIGN;
    }

    return buttonTypeConst.MINT;
  })();

  const onMint = useCallback(async (address: string) => {
    try {
      setIsLoading(true);

      const handleIneligible = () => {
        handleIneligibleModal().then(goHome).catch(console.error);
        setIsLoading(false);
      };

      try {
        const { inWhiteList, mintedNft } = await apiSDK.nftMintingCheckEligible(address);

        if (!inWhiteList) {
          handleIneligible();

          return;
        }

        if (mintedNft) {
          handleBadgeAlreadyMintedModal().catch(console.error);
          setIsLoading(false);

          return;
        }
      } catch (e) {
        console.error('Error fetching eligibility:', e);
        handleIneligible();

        return;
      }

      const { signature, status } = await apiSDK.nftMintingRequestSignature(address);

      if (status === 'success') {
        setIsLoading(false);
        onSuccess(address);

        return;
      }

      const transaction = await odysseyMintNft({ address, chain: 'storyOdyssey_testnet', signature });

      // account has insufficient balance
      if (transaction.errors.some((e) => e.message.toLowerCase().includes('Insufficient balance'.toLowerCase()))) {
        handleInSufficientBalanceModal().then(noop).catch(console.error);
      } else if (transaction.errors.some((e) => e.message.toLowerCase().includes('Rejected by user'.toLowerCase()))) {
        // do nothing
      } else if (transaction.errors.length) {
        handleFailedToMintModal().then(goHome).catch(console.error);
      } else {
        await apiSDK.nftMintingStart(transaction?.extrinsicHash);
      }

      setIsLoading(false);
    } catch (e) {
      const error = e as Error;

      if (error.message?.startsWith('Please mint with wallet "')) {
        const address = (() => {
          const match = error.message.match(/^Please mint with wallet "([^"]+)"/);

          if (match) {
            return match[1];
          }

          console.error('Can not get address of:', error);

          return '';
        })();

        handleExistedLinkedAddressModal(address);

        setIsLoading(false);

        return;
      }

      notify({
        message: error.message,
        type: 'error',
        duration: null
      });
    }

    setIsLoading(false);
  }, [handleIneligibleModal, goHome, handleBadgeAlreadyMintedModal, onSuccess, handleInSufficientBalanceModal, handleFailedToMintModal, notify, handleExistedLinkedAddressModal]);

  const onPreMint = useCallback(() => {
    const getAddress = new Promise<string>((resolve, reject) => {
      if (wcAccount) {
        resolve(wcAccount.address);
      } else {
        requireWC()
          .then(() => {
            return (async () => {
              return await connectWC(false);
            })();
          })
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
        activeModal(CONFIRM_YOUR_ACCOUNT_MODAL);
      })
      .catch((e: Error) => {
        console.error(e);

        if (e.message?.toLowerCase().includes('Unsupported chains'.toLowerCase())) {
          telegramConnector.showPopup({
            message: t('Your chosen wallet hasn’t supported Story Odyssey Testnet. Add network to your wallet or change to another wallet'),
            buttons: [{
              type: 'ok',
              text: t('Got it')
            }]
          }, noop);
        }
      });
  }, [activeModal, connectWC, requireWC, t, wcAccount]);

  const onConfirmAccount = useCallback((address: string) => {
    onMint(address).catch(console.error);
  }, [onMint]);

  const renderButton = () => {
    return (

      <>
        {buttonType === buttonTypeConst.COMING_SOON && (
          <Button
            block={true}
            disabled={true}
            shape={'round'}
          >
            {t('Coming soon')}
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
            {t('End campaign')}
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
    <>
      <div className={CN(className, '-mint-nft-detail')}>
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

        {
          !isFetchingNftMintingLog && (
            <div className='footer-part'>
              {renderButton()}
            </div>
          )
        }
      </div>

      <ConfirmYourAccountModal
        address={wcAccount?.address || ''}
        callback={onConfirmAccount}
      />
    </>
  );
};

const MintNftDetail = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    '&.-mint-nft-detail': {
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 20,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flex: 1,
      overflow: 'hidden',

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
      }
    },

    '&.ant-sw-modal': {
      '.__link': {
        color: token.colorSuccess,
        textDecoration: 'underline'
      }
    }
  });
});

export default MintNftDetail;
