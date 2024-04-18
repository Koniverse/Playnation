// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { GameLogo } from '@subwallet/extension-koni-ui/components/Games/Logo';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ButtonProps, Icon, ModalContext } from '@subwallet/react-ui';
import { FadersHorizontal, Gift, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
  showGiftIcon?: boolean;
  showFilterIcon?: boolean;
  showSearchIcon?: boolean;
  onClickFilterIcon?: () => void;
  onClickSearchIcon?: () => void;
  showTabBar?: boolean
};

const Home = ({ children, onClickFilterIcon, onClickSearchIcon, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const notify = useNotification();

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenGift = useCallback(() => {
    notify({
      key: 'gift',
      message: t('The airdrop for the first project will be snapshot within the next few weeks, based on your NPS number.'),
      type: 'info',
      duration: 12
    });
  }, [notify, t]);

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
          <Icon
            iconColor={'#ED4062'}
            phosphorIcon={Gift}
            size='md'
          />
        ),
        onClick: onOpenGift
      });
    }

    return icons;
  }, [onClickFilterIcon, onOpenGift, onClickSearchIcon, onOpenCustomizeModal, showFilterIcon, showGiftIcon, showSearchIcon]);

  const onClickListIcon = useCallback(() => {
    navigate('/settings/list');
  }, [navigate]);

  return (
    <Layout.Base
      headerCenter={false}
      headerIcons={headerIcons}
      headerLeft={<GameLogo />}
      headerOnClickLeft={onClickListIcon}
      headerPaddingVertical={true}
      showHeader={true}
      showLeftButton={true}
      showTabBar={showTabBar ?? true}
    >
      {children}
    </Layout.Base>
  );
};

export { Home };
