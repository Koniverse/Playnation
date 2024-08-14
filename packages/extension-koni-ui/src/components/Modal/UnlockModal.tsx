// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useBiometric } from '@subwallet/extension-koni-ui/hooks/biometric';
import { keyringUnlock } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Button, Form, Icon, Input, ModalContext, SwIconProps, SwModal } from '@subwallet/react-ui';
import { FingerprintSimple } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { focusInput } from '../../hooks/form/useFocusById';

export type ActionItemType = {
  key: string,
  icon: SwIconProps['phosphorIcon'],
  iconBackgroundColor: string,
  title: string,
  onClick?: () => void
};

type Props = ThemeProps

export const UNLOCK_MODAL_ID = 'unlock-modal';

const passwordInputId = 'login-password';

enum FormFieldName {
  PASSWORD = 'password'
}

interface LoginFormState {
  [FormFieldName.PASSWORD]: string;
}

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { checkActive, inactiveModal } = useContext(ModalContext);
  const isLocked = useSelector((state: RootState) => state.accountState.isLocked);
  const [form] = Form.useForm<LoginFormState>();
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const { getToken, onUnlockSuccess, reportWrongBiometric, requireSyncPassword , isTokenUpdateToDate, usingBiometric } = useBiometric();

  const closeModal = useCallback(
    () => {
      form.resetFields();
      inactiveModal(UNLOCK_MODAL_ID);
    },
    [form, inactiveModal]
  );

  // Auto close modal if unlocked
  useEffect(() => {
    if (!isLocked && !requireSyncPassword && checkActive(UNLOCK_MODAL_ID)) {
      inactiveModal(UNLOCK_MODAL_ID);
    }
  }, [checkActive, inactiveModal, isLocked, requireSyncPassword]);

  const onUpdate: FormCallbacks<LoginFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setIsDisable(error || empty);
  }, []);

  const onError = useCallback((error: string) => {
    form.setFields([{ name: FormFieldName.PASSWORD, errors: [error] }]);
    (document.getElementById(passwordInputId) as HTMLInputElement)?.select();
  }, [form]);

  const unlockWithPassword = useCallback((password: string, usingBio = false) => {
    keyringUnlock({
      password
    })
      .then((data) => {
        if (!data.status) {
          onError(data.errors[0]);

          if (usingBio) {
            reportWrongBiometric();
          }
        } else {
          onUnlockSuccess(password, usingBio);
        }
      })
      .catch((e: Error) => {
        onError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onError, onUnlockSuccess, reportWrongBiometric]);

  const unlockWithBiometric = useCallback(() => {
    getToken().then((token) => {
      token && unlockWithPassword(token, true);
    }).catch(console.error);
  }, [getToken, unlockWithPassword]);

  useEffect(() => {
    if (usingBiometric && isTokenUpdateToDate && isLocked && checkActive(UNLOCK_MODAL_ID)) {
      unlockWithBiometric();
    } else {
      focusInput(passwordInputId, 300);
    }
  }, [usingBiometric, isLocked, checkActive, getToken, unlockWithPassword, unlockWithBiometric, isTokenUpdateToDate]);

  const onSubmit: FormCallbacks<LoginFormState>['onFinish'] = useCallback((values: LoginFormState) => {
    unlockWithPassword(values[FormFieldName.PASSWORD]);
  }, [unlockWithPassword]);

  return (
    <SwModal
      className={className}
      id={UNLOCK_MODAL_ID}
      onCancel={closeModal}
      title={t('Enter password')}
      zIndex={9999}
    >
      <div className='body-container'>
        <Form
          form={form}
          initialValues={{ [FormFieldName.PASSWORD]: '' }}
          onFieldsChange={onUpdate}
          onFinish={onSubmit}
        >

          <div className='field-group'>
            <div className='password-label'>
              {t('Password')}
            </div>

            <Form.Item
              name={FormFieldName.PASSWORD}
              rules={[
                {
                  message: t('Password is required'),
                  required: true
                }
              ]}
            >
              <Input.Password
                containerClassName='password-input'
                id={passwordInputId}
                placeholder={t('Enter password')}
              />
            </Form.Item>
            {usingBiometric && isTokenUpdateToDate && (<Form.Item>
              <Button
                block={true}
                icon={(
                  <Icon
                    customSize={'20px'}
                    phosphorIcon={FingerprintSimple}
                  />
                )}
                onClick={unlockWithBiometric}
                shape={'round'}
                size={'sm'}
                type={'ghost'}
              >
                {t('Unlock with biometrics')}
              </Button>
            </Form.Item>)}
          </div>

          <Form.Item>
            <Button
              block={true}
              disabled={isDisable}
              htmlType='submit'
              loading={loading}
              shape={'round'}
            >
              {t('Unlock')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </SwModal>
  );
}

export const UnlockModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.__action-item + .__action-item': {
      marginTop: token.marginXS
    },

    '.field-group': {
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 20,
      paddingTop: token.padding,
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: token.paddingXXS,
      marginBottom: 24,

      '.password-label': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextDark1,
        marginBottom: token.marginXS
      },

      '.ant-input-password': {
        backgroundColor: token.colorBgSecondary,

        '.ant-input-prefix': {
          display: 'none'
        }
      },

      '.ant-form-item': {
        marginBottom: token.marginXS
      }
    }
  });
});
