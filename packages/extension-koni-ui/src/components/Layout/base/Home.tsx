// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { VISIT_INVITATION_SCREEN_FLAG } from '@subwallet/extension-koni-ui/constants';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ButtonProps, Icon, ModalContext, Tooltip } from '@subwallet/react-ui';
import { FadersHorizontal, MagnifyingGlass, UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = {
  children?: React.ReactNode;
  showGiftIcon?: boolean;
  showFilterIcon?: boolean;
  showSearchIcon?: boolean;
  onClickFilterIcon?: () => void;
  onClickSearchIcon?: () => void;
  showTabBar?: boolean
  backgroundStyle?: LayoutBaseProps['backgroundStyle'];
  backgroundImages?: LayoutBaseProps['backgroundImages'];
  onTabSelected?: LayoutBaseProps['onTabSelected'];
  className?: string;
};

const Component = ({ backgroundImages, backgroundStyle, children, className, onClickFilterIcon, onClickSearchIcon, onTabSelected, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar }: Props) => {
  const navigate = useNavigate();
  const [isVisitedInvitationScreen, setIsVisitedInvitationScreen] = useLocalStorage(VISIT_INVITATION_SCREEN_FLAG, false);
  // @ts-ignore
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  // @ts-ignore
  const notify = useNotification();

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenInvite = useCallback(() => {
    navigate('/invite');
    setIsVisitedInvitationScreen(true);
  }, [navigate, setIsVisitedInvitationScreen]);

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
              phosphorIcon={UserCirclePlus}
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

    return icons;
  }, [showFilterIcon, showSearchIcon, showGiftIcon, onClickFilterIcon, onOpenCustomizeModal, onClickSearchIcon, isVisitedInvitationScreen, t, onOpenInvite]);

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
  '.invite-button': {
    position: 'relative'
  },

  '.invite-tooltip': {
    position: 'absolute',
    right: 0
  }
}));
