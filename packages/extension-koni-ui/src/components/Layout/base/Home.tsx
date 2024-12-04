// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { AlertModal, Layout, WalletConnect } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NftMintingLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { CONFIRM_SHOW_MINTING_FAILED_MODAL, VISIT_INVITATION_SCREEN_FLAG } from '@subwallet/extension-koni-ui/constants';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useAlert, useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ButtonProps, Icon, ModalContext, Tooltip } from '@subwallet/react-ui';
import { CheckCircle, Export, FadersHorizontal, Gift, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = {
  children?: React.ReactNode;
  showGiftIcon?: boolean;
  showFilterIcon?: boolean;
  showSearchIcon?: boolean;
  showConnectIcon?: boolean;
  onClickFilterIcon?: () => void;
  onClickSearchIcon?: () => void;
  showTabBar?: boolean
  backgroundStyle?: LayoutBaseProps['backgroundStyle'];
  backgroundImages?: LayoutBaseProps['backgroundImages'];
  onTabSelected?: LayoutBaseProps['onTabSelected'];
  className?: string;
};

const telegramConnector = TelegramConnector.instance;
const apiSDK = BookaSdk.instance;

const alertModalId = 'alert-minting-failed-modal';

const Component = (props: Props) => {
  const { backgroundImages, backgroundStyle, children, className, onClickFilterIcon, onClickSearchIcon, onTabSelected, showConnectIcon = true, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar } = props;

  const navigate = useNavigate();
  // @ts-ignore
  const [isVisitedInvitationScreen, setIsVisitedInvitationScreen] = useLocalStorage(VISIT_INVITATION_SCREEN_FLAG, false);
  // @ts-ignore
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { connectWC, disconnectWC } = useContext(WalletConnectContext);

  const [mintingLog, setMintingLog] = useState<NftMintingLog | undefined>();
  const [isShowPopupMintFailed, setIsShowPopupMintFailed] = useLocalStorage(CONFIRM_SHOW_MINTING_FAILED_MODAL, 'nonConfirmed');
  const { alertProps, closeAlert, openAlert } = useAlert(alertModalId);

  const { wcAccount } = useSelector((state) => state.accountState);

  const notify = useNotification();

  const [connectLoading, setConnectLoading] = useState(false);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenInvite = useCallback(() => {
    navigate('/home/invite');
    setIsVisitedInvitationScreen(true);
  }, [navigate, setIsVisitedInvitationScreen]);

  const onConnectWallet = useCallback(() => {
    setConnectLoading(true);

    connectWC()
      .then((address: string) => {
        console.debug('connectWC result', address);
      })
      .catch((e: Error) => {
        if (e.message?.toLowerCase().includes('Unsupported chains'.toLowerCase())) {
          telegramConnector.showPopup({
            message: t('Your chosen wallet hasn’t supported Story Odyssey Testnet. Add network to your wallet or change to another wallet'),
            buttons: [{
              type: 'ok',
              text: t('Got it')
            }]
          }, noop);

          return;
        }

        notify({
          type: 'error',
          message: e.message
        });
      })
      .finally(() => {
        setConnectLoading(false);
      });
  }, [connectWC, notify, t]);

  const onDisconnectWallet = useCallback((wcAccount: AccountJson) => {
    return () => {
      setConnectLoading(true);
      disconnectWC(wcAccount)()
        .finally(() => {
          setConnectLoading(false);
        });
    };
  }, [disconnectWC]);

  const headerIcons = useMemo<ButtonProps[]>(() => {
    const icons: ButtonProps[] = [];

    if (showFilterIcon) {
      icons.push({
        icon: (
          <Icon
            phosphorIcon={FadersHorizontal}
            size='md'
          />
        ),
        onClick: onClickFilterIcon || onOpenCustomizeModal
      });
    }

    if (showSearchIcon) {
      icons.push({
        icon: (
          <Icon
            phosphorIcon={MagnifyingGlass}
            size='md'
          />
        ),
        onClick: onClickSearchIcon
      });
    }

    if (showGiftIcon) {
      icons.push({
        icon: (
          <>
            <Icon
              customSize={'20px'}
              phosphorIcon={Export}
              weight={'fill'}
            />

            <Tooltip
              className={'invite-tooltip'}
              open={false}
              overlayClassName={'tooltip-overlay'}
              placement={'bottomRight'}
              title={t('Invite your friend')}
            >
              <div>
              </div>
            </Tooltip>
          </>
        ),
        className: 'invite-button',
        onClick: onOpenInvite
      });
    }

    if (showConnectIcon) {
      icons.push({
        icon: (
          <Icon
            customIcon={(
              <WalletConnect
                height='1em'
                width='1em'
              />
            )}
            iconColor={wcAccount ? '#bf1616' : undefined}
            type='customIcon'
          />
        ),
        onClick: wcAccount ? onDisconnectWallet(wcAccount) : onConnectWallet,
        loading: connectLoading
      });
    }

    return icons;
  }, [showFilterIcon, showSearchIcon, showGiftIcon, showConnectIcon, onClickFilterIcon, onOpenCustomizeModal, onClickSearchIcon, t, onOpenInvite, wcAccount, onDisconnectWallet, onConnectWallet, connectLoading]);

  const onClickListIcon = useCallback(() => {
    navigate('/settings/list');
  }, [navigate]);

  const handleMintingFailedModal = useCallback(() => {
    openAlert({
      className: 'general-confirmation-modal modal-revert-header',
      title: t('Badge minting failed'),
      iconProps: {
        phosphorIcon: Gift,
        weight: 'fill'
      },
      contentTitle: t('Mint your badge again'),
      content: (
        t('Due to technical issues, your badge wasn’t minted in Phase 1. Click the Mint tab to mint your badge again on December 6')
      ),
      okButton: {
        icon: CheckCircle,
        iconWeight: 'fill',
        text: t('I understand'),
        onClick: () => {
          setIsShowPopupMintFailed('confirmed');
          closeAlert();
        }
      }
    });
  }, [closeAlert, openAlert, setIsShowPopupMintFailed, t]);

  useEffect(() => {
    const fetchMintingLog = async () => {
      try {
        const mintingLog = await apiSDK.getNftMintingLog();

        setMintingLog(mintingLog);
      } catch (error) {
        console.error('Error fetching minting log:', error);
      }
    };

    fetchMintingLog().catch(console.error);
  }, []);

  const onCancel = useCallback(() => {
    setIsShowPopupMintFailed('confirmed');
  }, [setIsShowPopupMintFailed]);

  useEffect(() => {
    if (mintingLog?.notify && isShowPopupMintFailed.includes('nonConfirmed')) {
      handleMintingFailedModal();
    }
  }, [handleMintingFailedModal, isShowPopupMintFailed, mintingLog?.notify, navigate, setIsShowPopupMintFailed]);

  return (
    <>
      <Layout.Base
        backgroundImages={backgroundImages}
        backgroundStyle={backgroundStyle}
        className={className}
        headerCenter={false}
        headerIcons={headerIcons}
        headerLeft={'default'}
        headerOnClickLeft={onClickListIcon}
        headerPaddingVertical={true}
        onTabSelected={onTabSelected}
        showHeader={true}
        showLeftButton={true}
        showTabBar={showTabBar ?? true}
      >
        {children}
      </Layout.Base>

      {
        !!alertProps && (
          <AlertModal
            _onCancel={onCancel}
            modalId={alertModalId}
            {...alertProps}
          />
        )
      }
    </>
  );
};

export const Home = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({

}));
