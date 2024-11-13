// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { VISIT_INVITATION_SCREEN_FLAG } from '@subwallet/extension-koni-ui/constants';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useNotification, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { ButtonProps, Icon, ModalContext, Tooltip } from '@subwallet/react-ui';
import { Export, FadersHorizontal, MagnifyingGlass, Wallet } from 'phosphor-react';
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
  const { connectWC, disconnectWC } = useContext(WalletConnectContext);

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
        notify({
          type: 'error',
          message: e.message
        });
      })
      .finally(() => {
        console.debug('connectWC finally');
        setConnectLoading(false);
      });
  }, [connectWC, notify]);

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
            iconColor={wcAccount ? '#bf1616' : undefined}
            phosphorIcon={Wallet}
            size='md'
            weight='fill'
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
    </Layout.Base>
  );
};

export const Home = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({

}));
