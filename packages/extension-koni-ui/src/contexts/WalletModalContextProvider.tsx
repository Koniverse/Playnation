// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AttachAccountModal, ClaimDappStakingRewardsModal, CreateAccountModal, DeriveAccountModal, ImportAccountModal, ImportSeedModal, LeaderboardModal, NewSeedModal, RemindBackupSeedPhraseModal, RequestCameraAccessModal, RequestCreatePasswordModal } from '@subwallet/extension-koni-ui/components';
import { LeaderboardModalProps } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardModal';
import { CustomizeModal } from '@subwallet/extension-koni-ui/components/Modal/Customize/CustomizeModal';
import { EARNING_INSTRUCTION_MODAL, LEADERBOARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useGetConfig, useSetSessionLatest } from '@subwallet/extension-koni-ui/hooks';
import Confirmations from '@subwallet/extension-koni-ui/Popup/Confirmations';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ModalContext, SwModal, useExcludeModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';

import { UnlockModal } from '../components/Modal/UnlockModal';

interface Props {
  children: React.ReactNode;
}

export const PREDEFINED_MODAL_NAMES = ['debugger', 'transaction', 'confirmations'];
type PredefinedModalName = typeof PREDEFINED_MODAL_NAMES[number];

export interface WalletModalContextType {
  openLeaderboardModal: (props: LeaderboardModalProps) => void
  closeLeaderboardModal: VoidFunction
}

export const WalletModalContext = React.createContext<WalletModalContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openLeaderboardModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeLeaderboardModal: () => {}
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
  const { getConfig } = useGetConfig();
  const { onHandleSessionLatest, setTimeBackUp } = useSetSessionLatest();
  const [leaderboardModalProps, setLeaderboardModalProps] = useState<LeaderboardModalProps | undefined>();

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
    closeLeaderboardModal
  }), [closeLeaderboardModal, openLeaderboardModal]);

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
