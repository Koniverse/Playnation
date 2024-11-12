// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { ConnectWalletSuccessModal, Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { CONNECT_WALLET_SUCCESS_MODAL, VISIT_INVITATION_SCREEN_FLAG } from '@subwallet/extension-koni-ui/constants';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletModalContext } from '@subwallet/extension-koni-ui/contexts/WalletModalContextProvider';
import { useConfirmModal, useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { disconnectWalletConnectConnection, wcCancelSessionPromise, wcGetSessionPromise, wcSessionCreate } from '@subwallet/extension-koni-ui/messaging';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { ButtonProps, Icon, Input, ModalContext, SwModalFuncProps, Tooltip } from '@subwallet/react-ui';
import CN from 'classnames';
import { Export, FadersHorizontal, MagnifyingGlass, Wallet, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
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

const Component = (props: Props) => {
  const { backgroundImages, backgroundStyle, children, className, onClickFilterIcon, onClickSearchIcon, onTabSelected, showConnectIcon = true, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar } = props;

  const navigate = useNavigate();
  // @ts-ignore
  const [isVisitedInvitationScreen, setIsVisitedInvitationScreen] = useLocalStorage(VISIT_INVITATION_SCREEN_FLAG, false);
  // @ts-ignore
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { closeWCConnectModal, openWCConnectModal, subscribeWCConnectModal } = useContext(WalletModalContext);

  const { wcAccount } = useSelector((state) => state.accountState);

  const notify = useNotification();

  const disconnectModalProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'disconnect-wc',
    className: CN('disconnect-wc-modal', className),
    title: t('Disconnect'),
    cancelText: t('Cancel'),
    content: (
      <div>
        <div>{t('Are you sure to disconnect wallet?')}</div>
        <Input
          disabled={true}
          value={wcAccount?.address || ''}
        />
      </div>
    ),
    okText: t('Disconnect'),
    closable: true,
    maskClosable: true,
    okCancel: true,
    cancelButtonProps: {
      icon: (
        <Icon
          phosphorIcon={XCircle}
          size='md'
        />
      ),
      schema: 'secondary'
    }
  }), [className, t, wcAccount?.address]);
  const { handleSimpleConfirmModal } = useConfirmModal(disconnectModalProps);

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

    wcSessionCreate()
      .then(({ id, uri }) => {
        // Open wallet connect modal
        openWCConnectModal(uri, id)
          .catch(console.error);

        const unsubscribe = subscribeWCConnectModal((newState) => {
          if (!newState.open) {
            unsubscribe();
            wcCancelSessionPromise(id).catch(console.error);
            setConnectLoading(false);
          }
        });

        // Subscribe session result
        wcGetSessionPromise(id)
          .then((data) => {
            unsubscribe();

            if (data.approveAddress) {
              // Connected with wallet
              console.log('Connected with wallet', data.approveAddress);
              closeWCConnectModal();
              activeModal(CONNECT_WALLET_SUCCESS_MODAL);
            } else {
              // Wallet connect failed
              console.error('Wallet connect failed', data.errorMessage);
              closeWCConnectModal();
              notify({
                type: 'error',
                message: data.errorMessage
              });
            }
          })
          .catch((e: Error) => {
            // Wallet connect failed
            unsubscribe();
            console.error('Wallet connect failed', e.message);
            notify({
              type: 'error',
              message: t('Failed to connect with wallet')
            });
          })
          .finally(() => {
            setConnectLoading(false);
          });
      })
      .catch((e) => {
        console.error(e);
        notify({
          message: t('Failed to create wallet connect session')
        });

        setConnectLoading(false);
      });
  }, [openWCConnectModal, subscribeWCConnectModal, closeWCConnectModal, activeModal, notify, t]);

  const disconnectWc = useCallback((wcAccount: AccountJson) => {
    return () => {
      const topic = wcAccount.wcTopic;

      if (topic) {
        handleSimpleConfirmModal()
          .then(() => {
            setConnectLoading(true);
            disconnectWalletConnectConnection(topic)
              .finally(() => {
                setConnectLoading(false);
              });
          })
          .catch(noop);
      }
    };
  }, [handleSimpleConfirmModal]);

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
            iconColor={wcAccount ? '#bf1616' : undefined}
            phosphorIcon={Wallet}
            size='md'
            weight='fill'
          />
        ),
        onClick: wcAccount ? disconnectWc(wcAccount) : onConnectWallet,
        loading: connectLoading
      });
    }

    return icons;
  }, [showFilterIcon, showSearchIcon, showGiftIcon, showConnectIcon, onClickFilterIcon, onOpenCustomizeModal, onClickSearchIcon, t, onOpenInvite, wcAccount, disconnectWc, onConnectWallet, connectLoading]);

  const onClickListIcon = useCallback(() => {
    navigate('/settings/list');
  }, [navigate]);

  return (
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
      <ConnectWalletSuccessModal address={wcAccount?.address || ''} />
    </Layout.Base>
  );
};

export const Home = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({
  '&.disconnect-wc-modal': {
    '.ant-sw-modal-confirm-btns': {
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    }
  }
}));
