// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WalletUnlockType } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { EDIT_AUTO_LOCK_TIME_MODAL, EDIT_UNLOCK_TYPE_MODAL, settingsScreensLayoutBackgroundImages } from '@subwallet/extension-koni-ui/constants';
import { DEFAULT_ROUTER_PATH } from '@subwallet/extension-koni-ui/constants/router';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { saveAutoLockTime, saveUnlockType } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { PhosphorIcon, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { isNoAccount } from '@subwallet/extension-koni-ui/utils/account/account';
import { BackgroundIcon, Icon, ModalContext, SettingItem, Switch, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight, CheckCircle, FingerprintSimple, Key, LockKeyOpen, LockLaminated } from 'phosphor-react';
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

interface AutoLockOption {
  label: string;
  value: number;
}

const editAutoLockTimeModalId = EDIT_AUTO_LOCK_TIME_MODAL;
const editUnlockTypeModalId = EDIT_UNLOCK_TYPE_MODAL;

const timeOptions = [5, 10, 15, 30, 60];

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const { goBack } = useDefaultNavigate();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = !!location.state;

  const { activeModal, inactiveModal } = useContext(ModalContext);

  const { accounts, useCustomPassword } = useSelector((state: RootState) => state.accountState);
  const [isUseBiometric, setUseBiometric] = useState<boolean>(false);
  const [loadingBiometric, setLoadingBiometric] = useState(false);
  const { timeAutoLock, unlockType } = useSelector((state: RootState) => state.settings);

  const noAccount = useMemo(() => isNoAccount(accounts), [accounts]);

  const autoLockOptions = useMemo((): AutoLockOption[] => timeOptions.map((value) => {
    if (value > 0) {
      return {
        value: value,
        label: t('{{time}} minutes', { replace: { time: value } })
      };
    } else if (value < 0) {
      return {
        value: value,
        label: t('Required once')
      };
    } else {
      return {
        value: value,
        label: t('Always require')
      };
    }
  }), [t]);

  const items = useMemo((): SecurityItem[] => [
    {
      icon: Key,
      key: SecurityType.WALLET_PASSWORD,
      title: t('Change wallet password'),
      url: '/keyring/change-password',
      disabled: noAccount
    },
    {
      icon: LockLaminated,
      key: SecurityType.AUTO_LOCK,
      title: t('Auto lock'),
      url: '',
      disabled: false
    },
    {
      icon: LockKeyOpen,
      key: SecurityType.UNLOCK_TYPE,
      title: t('Authenticate with password'),
      url: '',
      disabled: false
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

  const onCloseAutoLockTimeModal = useCallback(() => {
    inactiveModal(editAutoLockTimeModalId);
  }, [inactiveModal]);

  const onCloseUnlockTypeModal = useCallback(() => {
    inactiveModal(editUnlockTypeModalId);
  }, [inactiveModal]);

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

  const onSelectTime = useCallback((item: AutoLockOption) => {
    return () => {
      inactiveModal(editAutoLockTimeModalId);
      saveAutoLockTime(item.value).finally(noop);
    };
  }, [inactiveModal]);

  const onSetUnlockType = useCallback((value: WalletUnlockType) => {
    return () => {
      inactiveModal(editAutoLockTimeModalId);
      saveUnlockType(value).finally(noop);
    };
  }, [inactiveModal]);

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
    <PageWrapper className={CN(className, '-screen')}>
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
        <SwModal
          className={CN(className, '-auto-lock-modal', '-modal')}
          id={editAutoLockTimeModalId}
          onCancel={onCloseAutoLockTimeModal}
          title={t('Auto lock')}
        >
          <div className='modal-body-container'>
            {
              autoLockOptions.map((item) => {
                const _selected = timeAutoLock === item.value;

                return (
                  <SettingItem
                    className={CN('__selection-item')}
                    key={item.value}
                    name={item.label}
                    onPressItem={onSelectTime(item)}
                    rightItem={
                      _selected
                        ? (
                          <Icon
                            className='__right-icon'
                            iconColor='var(--icon-color)'
                            phosphorIcon={CheckCircle}
                            size='sm'
                            type='phosphor'
                            weight='fill'
                          />
                        )
                        : null
                    }
                  />
                );
              })
            }
          </div>
        </SwModal>
        <SwModal
          className={CN(className, '-authenticate-type-modal', '-modal')}
          id={editUnlockTypeModalId}
          onCancel={onCloseUnlockTypeModal}
          title={t('Authenticate with password')}
        >
          <div className='modal-body-container'>
            <SettingItem
              className={CN('__selection-item')}
              key={WalletUnlockType.ALWAYS_REQUIRED}
              name={t('Always required')}
              onPressItem={onSetUnlockType(WalletUnlockType.ALWAYS_REQUIRED)}
              rightItem={
                unlockType === WalletUnlockType.ALWAYS_REQUIRED
                  ? (
                    <Icon
                      className='__right-icon'
                      iconColor='var(--icon-color)'
                      phosphorIcon={CheckCircle}
                      size='sm'
                      type='phosphor'
                      weight='fill'
                    />
                  )
                  : null
              }
            />
            <SettingItem
              className={CN('__selection-item')}
              key={WalletUnlockType.WHEN_NEEDED}
              name={t('When needed')}
              onPressItem={onSetUnlockType(WalletUnlockType.WHEN_NEEDED)}
              rightItem={
                unlockType === WalletUnlockType.WHEN_NEEDED
                  ? (
                    <Icon
                      className='__right-icon'
                      iconColor='var(--icon-color)'
                      phosphorIcon={CheckCircle}
                      size='sm'
                      type='phosphor'
                      weight='fill'
                    />
                  )
                  : null
              }
            />
          </div>
        </SwModal>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const SecurityList = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '&.-screen': {
      '.body-container': {
        paddingTop: token.paddingXXS,
        paddingRight: token.padding,
        paddingLeft: token.padding,
        paddingBottom: token.paddingLG
      }
    },

    '&.-modal': {
      '.ant-sw-modal-body': {
        paddingLeft: token.paddingXS,
        paddingRight: token.paddingXS
      },

      '.modal-body-container': {
        borderRadius: 20,
        backgroundColor: extendToken.colorBgSecondary1,
        padding: token.paddingXS
      },

      '.ant-setting-item': {
        overflow: 'hidden',
        backgroundColor: extendToken.colorBgSecondary1,
        borderRadius: 40,

        '.ant-web3-block-right-item': {
          color: token.colorSuccess
        },

        '.ant-web3-block.ant-web3-block:hover': {
          backgroundColor: token.colorBgSecondary
        },

        '.__left-icon': {
          minWidth: 24,
          height: 24,
          borderRadius: 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        },

        '.ant-web3-block-left-item': {
          paddingRight: token.paddingSM
        },

        '.ant-setting-item-name': {
          color: token.colorTextDark2
        },

        '.ant-setting-item-content': {
          paddingRight: token.paddingXS
        },

        '.__right-icon': {
          minWidth: 40,
          justifyContent: 'center'
        }
      }
    }
  };
});

export default SecurityList;
