// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AttachAccountModal, ClaimDappStakingRewardsModal, CreateAccountModal, DeriveAccountModal, ImportAccountModal, ImportSeedModal, LeaderboardModal, NewSeedModal, RemindBackupSeedPhraseModal, RequestCameraAccessModal, RequestCreatePasswordModal } from '@subwallet/extension-koni-ui/components';
import { LeaderboardModalProps } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardModal';
import { CustomizeModal } from '@subwallet/extension-koni-ui/components/Modal/Customize/CustomizeModal';
import { EARNING_INSTRUCTION_MODAL, LEADERBOARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetConfig, useSetSessionLatest } from '@subwallet/extension-koni-ui/hooks';
import Confirmations from '@subwallet/extension-koni-ui/Popup/Confirmations';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ModalContext, SwModal, useExcludeModal } from '@subwallet/react-ui';
import { WalletConnectModal } from '@walletconnect/modal';
import { ModalCtrlState } from '@walletconnect/modal-core/dist/_types/src/types/controllerTypes';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { UnlockModal } from '../components/Modal/UnlockModal';

interface Props {
  children: React.ReactNode;
}

export const PREDEFINED_MODAL_NAMES = ['debugger', 'transaction', 'confirmations'];
type PredefinedModalName = typeof PREDEFINED_MODAL_NAMES[number];

export interface WalletModalContextType {
  openLeaderboardModal: (props: LeaderboardModalProps) => void;
  closeLeaderboardModal: VoidFunction;
  openWCConnectModal: (uri: string, id: string) => Promise<void>;
  closeWCConnectModal: VoidFunction;
  subscribeWCConnectModal: (callback: (newState: ModalCtrlState) => void) => VoidFunction
}

export const WalletModalContext = React.createContext<WalletModalContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openLeaderboardModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeLeaderboardModal: () => {},
  openWCConnectModal: () => Promise.resolve(),
  closeWCConnectModal: noop,
  subscribeWCConnectModal: () => noop
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

export const WalletModalContextProvider = ({ children }: Props) => {
  const { activeModal, hasActiveModal, inactiveAll, inactiveModal, inactiveModals } = useContext(ModalContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasConfirmations } = useSelector((state: RootState) => state.requestState);
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const { projectId } = useSelector((state: RootState) => state.walletConnect);
  const { getConfig } = useGetConfig();
  const { onHandleSessionLatest, setTimeBackUp } = useSetSessionLatest();
  const [leaderboardModalProps, setLeaderboardModalProps] = useState<LeaderboardModalProps | undefined>();
  const [wcModal, setWcModal] = useState<WalletConnectModal>();

  const currentConnectPromiseIdRef = useRef('');

  useExcludeModal('confirmations');
  useExcludeModal(EARNING_INSTRUCTION_MODAL);

  const onCloseModal = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete('popup');

      return prev;
    });
  }, [setSearchParams]);

  const openWCConnectModal = useCallback(async (uri: string, id: string) => {
    if (wcModal) {
      currentConnectPromiseIdRef.current = id;

      return wcModal.openModal({ uri });
    }
  }, [wcModal]);

  const closeWCConnectModal = useCallback(() => {
    if (wcModal) {
      currentConnectPromiseIdRef.current = '';
      wcModal.closeModal();
    }
  }, [wcModal]);

  const subscribeWCConnectModal = useCallback((callback: (newState: ModalCtrlState) => void) => {
    if (wcModal) {
      const { subscribeModal } = wcModal;

      return subscribeModal(callback);
    } else {
      return () => noop;
    }
  }, [wcModal]);

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
    openWCConnectModal,
    closeWCConnectModal,
    subscribeWCConnectModal
  }), [closeLeaderboardModal, openLeaderboardModal, openWCConnectModal, closeWCConnectModal, subscribeWCConnectModal]);

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
    if (projectId) {
      const wcModal = new WalletConnectModal({
        themeVariables: {
          '--wcm-z-index': '600'
        },
        themeMode: 'light',
        projectId
      });

      setWcModal(wcModal);

      const unsub = wcModal.subscribeModal((newState: ModalCtrlState) => {
        if (!newState.open && currentConnectPromiseIdRef.current) {
          currentConnectPromiseIdRef.current = '';
          console.log('WalletConnectModal closed');
        }
      });

      return () => {
        unsub();
      };
    } else {
      return () => {
        // Empty
      };
    }
  }, [projectId]);

  // todo: will remove ClaimDappStakingRewardsModal after Astar upgrade to v3

  return <WalletModalContext.Provider value={contextValue}>
    <div
      id='popup-container'
      style={{ zIndex: hasActiveModal ? undefined : -1 }}
    />
    {children}
    <SwModal
      className={'modal-full'}
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
  </WalletModalContext.Provider>;
};
