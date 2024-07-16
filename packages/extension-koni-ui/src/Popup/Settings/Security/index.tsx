// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { EDIT_AUTO_LOCK_TIME_MODAL, EDIT_UNLOCK_TYPE_MODAL, settingsScreensLayoutBackgroundImages } from '@subwallet/extension-koni-ui/constants';
import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants/router';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isNoAccount } from '@subwallet/extension-koni-ui/utils/account/account';
import { BackgroundIcon, Icon, ModalContext, SettingItem, Switch } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight, FingerprintSimple, Key } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

enum SecurityType {
  WALLET_PASSWORD = 'wallet-password',
  WEBSITE_ACCESS = 'website-access',
  CAMERA_ACCESS = 'camera-access',
  AUTO_LOCK = 'auto-lock',
  UNLOCK_TYPE = 'unlock-type',
  CHAIN_PATROL_SERVICE = 'chain-patrol-service'
}

interface SecurityItem {
  icon: PhosphorIcon;
  key: SecurityType;
  title: string;
  url: string;
  disabled: boolean;
}

const editAutoLockTimeModalId = EDIT_AUTO_LOCK_TIME_MODAL;
const editUnlockTypeModalId = EDIT_UNLOCK_TYPE_MODAL;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = !!location.state;

  const { activeModal } = useContext(ModalContext);

  const { accounts } = useSelector((state: RootState) => state.accountState);
  const [isUseBiometric, setUseBiometric] = useState<boolean>(false);
  const [loadingBiometric, setLoadingBiometric] = useState(false);

  const noAccount = useMemo(() => isNoAccount(accounts), [accounts]);

  const items = useMemo((): SecurityItem[] => [
    {
      icon: Key,
      key: SecurityType.WALLET_PASSWORD,
      title: t('Change wallet password'),
      url: '/keyring/change-password',
      disabled: noAccount
    }
  ], [noAccount, t]);

  const onBack = useCallback(() => {
    if (canGoBack) {
      goBack();
    } else {
      if (noAccount) {
        navigate(DEFAULT_ROUTER_PATH);
      } else {
        navigate('/settings/list');
      }
    }
  }, [canGoBack, goBack, navigate, noAccount]);

  const updateBiometricState = useCallback(() => {
    setLoadingBiometric(true);
    setUseBiometric((prev) => !prev);
    setLoadingBiometric(false);
  }, []);

  const onOpenAutoLockTimeModal = useCallback(() => {
    activeModal(editAutoLockTimeModalId);
  }, [activeModal]);

  const onOpenUnlockTypeModal = useCallback(() => {
    activeModal(editUnlockTypeModalId);
  }, [activeModal]);

  const onClickItem = useCallback((item: SecurityItem) => {
    return () => {
      switch (item.key) {
        case SecurityType.AUTO_LOCK:
          onOpenAutoLockTimeModal();
          break;
        case SecurityType.UNLOCK_TYPE:
          onOpenUnlockTypeModal();
          break;
        default:
          navigate(item.url);
      }
    };
  }, [navigate, onOpenAutoLockTimeModal, onOpenUnlockTypeModal]);

  const onRenderItem = useCallback((item: SecurityItem) => {
    return (
      <SettingItem
        className={CN(
          'setting-group-item',
          {
            disabled: item.disabled
          }
        )}
        key={item.key}
        leftItemIcon={(
          <BackgroundIcon
            backgroundColor={'var(--icon-bg-color)'}
            phosphorIcon={item.icon}
            size='sm'
            type='phosphor'
            weight='fill'
          />
        )}
        name={item.title}
        onPressItem={item.disabled ? undefined : onClickItem(item)}
        rightItem={(
          <Icon
            className='__right-icon'
            phosphorIcon={CaretRight}
            size='sm'
            type='phosphor'
          />
        )}
      />
    );
  }, [onClickItem]);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        backgroundImages={settingsScreensLayoutBackgroundImages}
        backgroundStyle={'secondary'}
        onBack={onBack}
        title={t('Password setting')}
      >
        <div className='body-container'>
          <div className='setting-group-container'>
            {items.map(onRenderItem)}

            <SettingItem
              className={CN('setting-group-item')}
              leftItemIcon={(
                <BackgroundIcon
                  backgroundColor={'var(--icon-bg-color)'}
                  phosphorIcon={FingerprintSimple}
                  size='sm'
                  type='phosphor'
                  weight='fill'
                />
              )}
              name={t('Use Biometric')}
              rightItem={(
                <Switch
                  checked={isUseBiometric}
                  loading={loadingBiometric}
                  onClick={updateBiometricState}
                />
              )}
            />
          </div>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const SecurityList = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      paddingTop: token.paddingXXS,
      paddingRight: token.padding,
      paddingLeft: token.padding,
      paddingBottom: token.paddingLG
    }
  };
});

export default SecurityList;
