// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ButtonProps, Icon, ModalContext } from '@subwallet/react-ui';
import { FadersHorizontal, MagnifyingGlass, UserCirclePlus } from 'phosphor-react';
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
  backgroundStyle?: LayoutBaseProps['backgroundStyle'];
  onTabSelected?: LayoutBaseProps['onTabSelected'];
};

const Home = ({ backgroundStyle, children, onClickFilterIcon, onClickSearchIcon, onTabSelected, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar }: Props) => {
  const navigate = useNavigate();
  // @ts-ignore
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  // @ts-ignore
  const notify = useNotification();

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenInvite = useCallback(() => {
    navigate('/home/invite');
  }, [navigate]);

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
            phosphorIcon={UserCirclePlus}
            size='md'
            weight={'fill'}
          />
        ),
        onClick: onOpenInvite
      });
    }

    return icons;
  }, [onClickFilterIcon, onOpenInvite, onClickSearchIcon, onOpenCustomizeModal, showFilterIcon, showGiftIcon, showSearchIcon]);

  const onClickListIcon = useCallback(() => {
    navigate('/settings/list');
  }, [navigate]);

  return (
    <Layout.Base
      backgroundStyle={backgroundStyle}
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

export { Home };
