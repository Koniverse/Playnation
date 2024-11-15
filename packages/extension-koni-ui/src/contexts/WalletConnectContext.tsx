// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { ConnectWalletSuccessModal, DisconnectWalletConnectModalContent, RequireConnectWalletModalContent, WalletConnectWaitingSigningModal } from '@subwallet/extension-koni-ui/components';
import { CONNECT_WALLET_SUCCESS_MODAL, DISCONNECT_WALLET_CONNECT_MODAL, REQUIRE_CONNECT_WALLET_MODAL, WALLET_CONNECT_WAITING_SIGNING_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useConfirmModal } from '@subwallet/extension-koni-ui/hooks';
import { disconnectWalletConnectConnection, wcCancelSessionPromise, wcGetSessionPromise, wcSessionCreate } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { Icon, ModalContext, SwModalFuncProps } from '@subwallet/react-ui';
import { WalletConnectModal } from '@walletconnect/modal';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

interface Props {
  children: React.ReactNode;
}

interface ModalCtrlState {
  open: boolean;
}

type SuccessCallback = (address: string) => void;

export interface WalletConnectContextType {
  connectWC: () => Promise<string>;
  disconnectWC: (wcAccount: AccountJson) => (() => Promise<void>);
  requireWC: () => Promise<void>;
  waitingSigningModal: {
    open: () => void;
    close: () => void;
  };
}

export const WalletConnectContext = React.createContext<WalletConnectContextType>({
  connectWC: () => Promise.resolve(''),
  disconnectWC: () => () => Promise.resolve(),
  requireWC: () => Promise.resolve(),
  waitingSigningModal: {
    close: noop,
    open: noop
  }
});

const waitingModal = WALLET_CONNECT_WAITING_SIGNING_MODAL;
const connectSuccessModal = CONNECT_WALLET_SUCCESS_MODAL;
const requireModal = REQUIRE_CONNECT_WALLET_MODAL;
const disconnectModal = DISCONNECT_WALLET_CONNECT_MODAL;

export const WalletConnectContextProvider = ({ children }: Props) => {
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const { t } = useTranslation();

  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const { projectId } = useSelector((state: RootState) => state.walletConnect);

  const [wcModal, setWcModal] = useState<WalletConnectModal>();
  const [onSuccessCb, setOnSuccessCb] = useState<SuccessCallback>(noop);

  const disconnectModalProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: disconnectModal,
    className: CN('confirm-modal-rework', 'modal-resize-content', 'modal-revert-header'),
    title: t('Disconnect'),
    cancelText: t('Cancel'),
    content: (
      <DisconnectWalletConnectModalContent
        address={wcAccount?.address || ''}
      />
    ),
    okText: t('Disconnect'),
    closable: true,
    maskClosable: true,
    okCancel: true,
    cancelButtonProps: {
      icon: (
        <Icon
          phosphorIcon={XCircle}
          size='sm'
          weight='fill'
        />
      ),
      schema: 'secondary',
      shape: 'round',
      size: 'sm'
    },
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={CheckCircle}
          size='sm'
          weight='fill'
        />
      ),
      shape: 'round',
      size: 'sm'
    }
  }), [t, wcAccount?.address]);

  const requireAccountModalProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: requireModal,
    className: CN('confirm-modal-rework', 'modal-resize-content', 'modal-revert-header'),
    title: t('Connect your wallet'),
    cancelText: t('Cancel'),
    content: <RequireConnectWalletModalContent />,
    okText: t('Connect'),
    closable: true,
    maskClosable: true,
    okCancel: true,
    cancelButtonProps: {
      icon: (
        <Icon
          phosphorIcon={XCircle}
          size='sm'
          weight='fill'
        />
      ),
      schema: 'secondary',
      shape: 'round',
      size: 'sm'
    },
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={CheckCircle}
          size='sm'
          weight='fill'
        />
      ),
      shape: 'round',
      size: 'sm'
    }
  }), [t]);

  const { handleSimpleConfirmModal: handleDisconnectModal } = useConfirmModal(disconnectModalProps);
  const { handleSimpleConfirmModal: handleRequireModal } = useConfirmModal(requireAccountModalProps);

  const connectWC = useCallback(async (): Promise<string> => {
    if (!wcModal) {
      setOnSuccessCb(() => {
        return noop;
      });

      return Promise.reject(new Error('WalletConnectModal is not initialized'));
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
    return new Promise<string>(async (resolve, reject) => {
      try {
        setOnSuccessCb(() => {
          return (address: string) => {
            resolve(address);
          };
        });

        const { id, uri } = await wcSessionCreate();

        await wcModal.openModal({ uri });

        let done = false;

        const unsubscribe = wcModal.subscribeModal((newState: ModalCtrlState) => {
          if (!newState.open) {
            done = true;
            unsubscribe();
            wcCancelSessionPromise(id).catch(console.error);
            resolve('');
          }
        });

        try {
          const data = await wcGetSessionPromise(id);

          if (done) {
            return;
          }

          unsubscribe();

          if (data.approveAddress) {
            // Connected with wallet
            console.log('Connected with wallet', data.approveAddress);
            wcModal.closeModal();
            activeModal(connectSuccessModal);
          } else {
            // Wallet connect failed
            console.error('Wallet connect failed', data.errorMessage);
            wcModal.closeModal();
            reject(new Error(data.errorMessage));
          }
        } catch (e) {
          if (done) {
            return;
          }

          const error = e as Error;

          // Wallet connect failed
          unsubscribe();
          console.error('Wallet connect failed', error.message);
          reject(error);
        }
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }, [activeModal, wcModal]);

  const disconnectWC = useCallback((wcAccount: AccountJson) => {
    return () => {
      const topic = wcAccount.wcTopic;

      if (topic) {
        return new Promise<void>((resolve) => {
          handleDisconnectModal()
            .then(() => {
              disconnectWalletConnectConnection(topic)
                .finally(resolve);
            })
            .catch(resolve);
        });
      }

      return Promise.resolve();
    };
  }, [handleDisconnectModal]);

  const requireWC = useCallback(() => {
    return handleRequireModal();
  }, [handleRequireModal]);

  const openWaiting = useCallback(() => {
    activeModal(waitingModal);
  }, [activeModal]);

  const closeWaiting = useCallback(() => {
    inactiveModal(waitingModal);
  }, [inactiveModal]);

  const contextValue = useMemo((): WalletConnectContextType => ({
    connectWC,
    disconnectWC,
    requireWC,
    waitingSigningModal: {
      close: closeWaiting,
      open: openWaiting
    }
  }), [closeWaiting, connectWC, disconnectWC, openWaiting, requireWC]);

  useEffect(() => {
    if (projectId) {
      const wcModal = new WalletConnectModal({
        themeVariables: {
          '--wcm-z-index': '600'
        },
        themeMode: 'light',
        projectId,
        explorerRecommendedWalletIds: ['9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a', 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', '9a4cddbdbc19005be790f37cc9176dd24eae51aa2a49fa3edeb3b6a8b089b7be']
      });

      setWcModal(wcModal);
    }
  }, [projectId]);

  // todo: will remove ClaimDappStakingRewardsModal after Astar upgrade to v3

  return (
    <WalletConnectContext.Provider value={contextValue}>
      {children}
      <ConnectWalletSuccessModal
        address={wcAccount?.address || ''}
        callback={onSuccessCb}
      />
      <WalletConnectWaitingSigningModal />
    </WalletConnectContext.Provider>
  );
};
