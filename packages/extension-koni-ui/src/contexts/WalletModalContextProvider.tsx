// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AlertModal, AttachAccountModal, ClaimDappStakingRewardsModal, ConfirmLinkingAccountModal, CreateAccountModal, DeriveAccountModal, ExistedAddressModal, ImportAccountModal, ImportSeedModal, LeaderboardModal, NewSeedModal, OnChainProfileModal, RemindBackupSeedPhraseModal, RequestCameraAccessModal, RequestCreatePasswordModal } from '@subwallet/extension-koni-ui/components';
import { LeaderboardModalProps } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardModal';
import { CustomizeModal } from '@subwallet/extension-koni-ui/components/Modal/Customize/CustomizeModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ADDRESS_EXISTED_MODAL, CONFIRM_LINKING_ACCOUNT_MODAL, EARNING_INSTRUCTION_MODAL, GLOBAL_ALERT_MODAL, LEADERBOARD_MODAL, ON_CHAIN_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useAlert, useGetConfig, useSetSessionLatest } from '@subwallet/extension-koni-ui/hooks';
import Confirmations from '@subwallet/extension-koni-ui/Popup/Confirmations';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { AlertDialogProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext, SwModal, useExcludeModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { UnlockModal } from '../components/Modal/UnlockModal';
import { WalletConnectContextProvider } from './WalletConnectContext';

interface Props {
  children: React.ReactNode;
}

export const PREDEFINED_MODAL_NAMES = ['debugger', 'transaction', 'confirmations'];
type PredefinedModalName = typeof PREDEFINED_MODAL_NAMES[number];

export interface WalletModalContextType {
  openLeaderboardModal: (props: LeaderboardModalProps) => void;
  closeLeaderboardModal: VoidFunction;
  alertModal: {
    open: (props: AlertDialogProps) => void,
    update: React.Dispatch<React.SetStateAction<AlertDialogProps | undefined>>;
    close: VoidFunction
  },
}

export const WalletModalContext = React.createContext<WalletModalContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openLeaderboardModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeLeaderboardModal: () => {},
  alertModal: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    open: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close: () => {}
  }
});

export const usePredefinedModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const openPModal = useCallback((name: PredefinedModalName | null) => {
    setSearchParams((prev) => {
      if (name) {
        prev.set('popup', name);
      } else {
        prev.delete('popup');
      }

      return prev;
    });
  }, [setSearchParams]);

  const isOpenPModal = useCallback(
    (popupName?: string) => {
      const currentPopup = searchParams.get('popup');

      if (popupName) {
        return currentPopup === popupName;
      } else {
        return !!currentPopup;
      }
    },
    [searchParams]
  );

  return { openPModal, isOpenPModal };
};

const alertModalId = GLOBAL_ALERT_MODAL;
const onChainProfileAlterModal = ON_CHAIN_PROFILE_MODAL;
const addressExitedModal = ADDRESS_EXISTED_MODAL;
const confirmLinkingAddress = CONFIRM_LINKING_ACCOUNT_MODAL;
const apiSDK = BookaSdk.instance;

export const WalletModalContextProvider = ({ children }: Props) => {
  const { activeModal, hasActiveModal, inactiveAll, inactiveModal, inactiveModals } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasConfirmations } = useSelector((state: RootState) => state.requestState);
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const { getConfig } = useGetConfig();
  const { onHandleSessionLatest, setTimeBackUp } = useSetSessionLatest();
  const [leaderboardModalProps, setLeaderboardModalProps] = useState<LeaderboardModalProps | undefined>();
  const { alertProps, closeAlert, openAlert, setAlertProps } = useAlert(alertModalId);
  const [addressLinking, setAddressLinking] = useState<string | undefined>(apiSDK.addressLinking);

  useExcludeModal('confirmations');
  useExcludeModal(EARNING_INSTRUCTION_MODAL);

  const onCloseModal = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('popup');

      return prev;
    });
  }, [setSearchParams]);

  const openLeaderboardModal = useCallback((props: LeaderboardModalProps) => {
    setLeaderboardModalProps(props);
    activeModal(LEADERBOARD_MODAL);
  }, [activeModal]);

  const closeLeaderboardModal = useCallback(() => {
    inactiveModal(LEADERBOARD_MODAL);
    setLeaderboardModalProps(undefined);
  }, [inactiveModal]);

  const contextValue = useMemo(() => ({
    openLeaderboardModal,
    closeLeaderboardModal,
    alertModal: {
      open: openAlert,
      update: setAlertProps,
      close: closeAlert
    }
  }), [closeAlert, closeLeaderboardModal, openAlert, openLeaderboardModal, setAlertProps]);

  const onShowAddressExistedModal = useCallback(() => {
    inactiveModal(onChainProfileAlterModal);
    inactiveModal(confirmLinkingAddress);
    activeModal(addressExitedModal);
  }, [activeModal, inactiveModal]);

  const setAddressLinking_ = useCallback((address?: string) => {
    apiSDK.setAddressLinking(address);
  }, []);

  useEffect(() => {
    const addressLinkingSub = apiSDK.subscribeAddressLinking()
      .subscribe((data) => {
        setAddressLinking(data);
      });

    return () => {
      addressLinkingSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasMasterPassword && isLocked) {
      inactiveAll();
    }
  }, [hasMasterPassword, inactiveAll, isLocked]);

  useEffect(() => {
    const confirmID = searchParams.get('popup');

    // Auto open confirm modal with method modalContext.activeModal else auto close all modal
    if (confirmID) {
      PREDEFINED_MODAL_NAMES.includes(confirmID) && activeModal(confirmID);
    } else {
      inactiveModals(PREDEFINED_MODAL_NAMES);
    }
  }, [activeModal, inactiveModals, searchParams]);

  useEffect(() => {
    getConfig().then(setTimeBackUp).catch(console.error);
  }, [getConfig, setTimeBackUp]);

  useEffect(() => {
    onHandleSessionLatest();
  }, [onHandleSessionLatest]);

  useEffect(() => {
    if (addressLinking) {
      activeModal(confirmLinkingAddress);
    }
  }, [activeModal, addressLinking]);

  // todo: will remove ClaimDappStakingRewardsModal after Astar upgrade to v3

  return (
    <WalletModalContext.Provider value={contextValue}>
      <WalletConnectContextProvider>
        <div
          id='popup-container'
          style={{ zIndex: hasActiveModal ? undefined : -1 }}
        />
        {children}
        <SwModal
          className={CN('modal-full', '-light-theme')}
          closable={false}
          destroyOnClose={true}
          id={'confirmations'}
          onCancel={onCloseModal}
          transitionName={'fade'}
          wrapClassName={CN({ 'd-none': !hasConfirmations })}
        >
          <Confirmations />
        </SwModal>
        <CreateAccountModal />
        <RemindBackupSeedPhraseModal />
        <ImportAccountModal />
        <AttachAccountModal />
        <NewSeedModal />
        <ImportSeedModal />
        <DeriveAccountModal />
        <ClaimDappStakingRewardsModal />
        <RequestCreatePasswordModal />
        <RequestCameraAccessModal />
        <CustomizeModal />
        <UnlockModal />
        {
          !!leaderboardModalProps && (
            <LeaderboardModal
              {...leaderboardModalProps}
              onCancel={closeLeaderboardModal}
            />
          )
        }
        <OnChainProfileModal
          onSubmitAddressLinking={setAddressLinking_}
        />
        <ExistedAddressModal
          onSubmitAddressLinking={setAddressLinking_}
        />
        <ConfirmLinkingAccountModal
          addressLinking={addressLinking}
          onErrorHandler={onShowAddressExistedModal}
          setAddressLinking={setAddressLinking_}
        />
        {
          !!alertProps && (
            <AlertModal
              modalId={alertModalId}
              {...alertProps}
            />
          )
        }
      </WalletConnectContextProvider>
    </WalletModalContext.Provider>
  );
};
