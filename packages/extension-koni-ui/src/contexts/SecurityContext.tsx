// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';
import { PASSWORD_UPDATE_TIME_BIO_LOCAL, PASSWORD_UPDATE_TIME_CLOUD, REMIND_BIOMETRIC_TIME, REMIND_PASSWORD_TIME } from '@subwallet/extension-base/constants';
import { SWStorage } from '@subwallet/extension-base/storage';
import { AlertModal } from '@subwallet/extension-koni-ui/components';
import { UNLOCK_MODAL_ID } from '@subwallet/extension-koni-ui/components/Modal/UnlockModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BiometricHandler } from '@subwallet/extension-koni-ui/connector/telegram/BiometricHandler';
import { useAlert, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ModalContext } from '@subwallet/react-ui';
import { CheckCircle, ShieldStar, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

interface SecurityContextProviderProps {
  children?: React.ReactElement;
}

export interface SecurityContextProps {
  supportBiometric: boolean;
  usingBiometric: boolean;
  isTokenUpdateToDate: boolean;
  requireSyncPassword: boolean;
  setupBiometric: () => void;
  setToken: (token: string) => Promise<void>;
  getToken: () => Promise<string|undefined>;
  removeToken: () => Promise<void>;
  onUnlockSuccess: (token: string, onUnlockSuccess: boolean) => void;
  reportWrongBiometric: () => void;
}

export const SecurityContext = React.createContext<SecurityContextProps>({} as SecurityContextProps);

const bookaSdk = BookaSdk.instance;
const biometricHandler = BiometricHandler.instance;
const cloudStorage = SWStorage.instance;

const checkTokenUpToDate = async () => {
  const localRs = localStorage.getItem(PASSWORD_UPDATE_TIME_BIO_LOCAL) || '';
  const cloudRs = await cloudStorage.getItem(PASSWORD_UPDATE_TIME_CLOUD) || '';

  return localRs === cloudRs;
};

const updateLocalTokenFlag = async () => {
  const cloudRs = await cloudStorage.getItem(PASSWORD_UPDATE_TIME_CLOUD);

  if (cloudRs) {
    localStorage.setItem(PASSWORD_UPDATE_TIME_BIO_LOCAL, cloudRs);
  }
};

const PASSPARD_ALERT_MODAL_ID = 'password_alert_modal_id';
const createPasswordUrl = '/keyring/create-password';

export function SecurityContextProvider ({ children }: SecurityContextProviderProps): React.ReactElement {
  const { hasMasterPassword, useCustomPassword } = useSelector((state: RootState) => state.accountState);
  const [supportBiometric, setSupportBiometric] = useState(false);
  const [usingBiometric, setUsingBiometric] = useState(false);
  const [isTokenUpdateToDate, setIsTokenUpdateToDate] = useState(true);
  const [requireSyncPassword, setRequireSyncPassword] = useState(false);
  const [remindBiometricLastTime, setRemindBiometricLastTime] = useState(localStorage.getItem(REMIND_BIOMETRIC_TIME));
  const { activeModal, checkActive } = useContext(ModalContext);

  const { alertProps, closeAlert, openAlert } = useAlert(PASSPARD_ALERT_MODAL_ID);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([biometricHandler.isSupportBiometric(), biometricHandler.checkUsingBiometric(), checkTokenUpToDate()])
      .then(([isBiometricAvailable, usingBiometric, tokenUpToDate]) => {
        setSupportBiometric(isBiometricAvailable);
        setUsingBiometric(usingBiometric);
        setIsTokenUpdateToDate(tokenUpToDate);
      }).catch(console.error);
  }, []);

  const setupBiometric = useCallback(() => {
    setRequireSyncPassword(true);

    if (!checkActive(UNLOCK_MODAL_ID)) {
      activeModal(UNLOCK_MODAL_ID);
    }
  }, [activeModal, checkActive]);

  const reportWrongBiometric = useCallback(() => {
    setRequireSyncPassword(true);
    setIsTokenUpdateToDate(false);
  }, []);

  const setToken = useCallback(async (token: string) => {
    await biometricHandler.setBiometricToken(token);
    await updateLocalTokenFlag();
    setUsingBiometric(true);
    setRequireSyncPassword(false);
    localStorage.removeItem(REMIND_BIOMETRIC_TIME);
  }, []);

  const removeToken = useCallback(async () => {
    await biometricHandler.setBiometricToken('');
    setUsingBiometric(false);
  }, []);

  // Unlock success handler
  const onUnlockSuccess = useCallback((token: string, usingBio: boolean) => {
    if (usingBio) {
      return;
    }

    if (requireSyncPassword || !isTokenUpdateToDate) {
      setToken(token).catch(console.error);
    } else if (useCustomPassword && supportBiometric && !usingBiometric && !remindBiometricLastTime) {
      // Ask user to enable biometric login
      openAlert({
        title: t('Biometric login'),
        type: NotificationType.INFO,
        contentTitle: 'Enable biometric login',
        content: t('Would you like to enable biometrics for your next login?'),
        iconProps: {
          phosphorIcon: ShieldStar,
          weight: 'fill'
        },
        cancelButton: {
          text: t('Maybe later'),
          schema: 'secondary',
          icon: XCircle,
          iconWeight: 'fill',
          onClick: () => {
            const remindBiometricLastTime = Date.now().toString();

            closeAlert();
            setRemindBiometricLastTime(remindBiometricLastTime);
            localStorage.setItem(REMIND_BIOMETRIC_TIME, remindBiometricLastTime);
          }
        },
        okButton: {
          text: t('Enable now'),
          icon: CheckCircle,
          iconWeight: 'fill',
          onClick: () => {
            setToken(token).catch(console.error);
            closeAlert();
          }
        }
      });
    }
  }, [closeAlert, isTokenUpdateToDate, openAlert, remindBiometricLastTime, requireSyncPassword, setToken, supportBiometric, t, useCustomPassword, usingBiometric]);

  // Create password modal reminder
  useEffect(() => {
    let shouldCheck = hasMasterPassword && !useCustomPassword;

    // Check if already remind
    cloudStorage.getItem(REMIND_PASSWORD_TIME).then((rs) => {
      if (rs) {
        shouldCheck = false;
      }
    }).catch(console.error);

    bookaSdk.waitForSync
      .then(() => {
        setTimeout(() => {
          if (shouldCheck) {
            openAlert({
              title: t('Protect your account'),
              type: NotificationType.INFO,
              contentTitle: 'Create a password to protect your account',
              content: t('A strong password keeps your Playnation account safe. After creating your password, you can enable biometric login.'),
              iconProps: {
                phosphorIcon: ShieldStar,
                weight: 'fill'
              },
              cancelButton: {
                text: t('Maybe later'),
                schema: 'secondary',
                icon: XCircle,
                iconWeight: 'fill',
                onClick: () => {
                  closeAlert();
                  cloudStorage.setItem(REMIND_PASSWORD_TIME, Date.now().toString()).catch(console.error);
                }
              },
              okButton: {
                text: t('Create now'),
                icon: CheckCircle,
                iconWeight: 'fill',
                onClick: () => {
                  navigate(createPasswordUrl);
                  closeAlert();
                }
              }
            });
          }
        }, 3000);
      }).catch(console.error);

    return () => {
      shouldCheck = false;
    };
  }, [useCustomPassword, activeModal, openAlert, t, closeAlert, navigate, hasMasterPassword]);

  return (<SecurityContext.Provider value={{
    supportBiometric,
    usingBiometric,
    isTokenUpdateToDate,
    requireSyncPassword,
    setupBiometric,
    reportWrongBiometric,
    onUnlockSuccess,
    setToken,
    getToken: biometricHandler.getBiometricToken.bind(biometricHandler),
    removeToken
  }}
  >
    {children}
    {!!alertProps && <AlertModal
      modalId={PASSPARD_ALERT_MODAL_ID}
      {...alertProps}
    />}
  </SecurityContext.Provider>);
}
