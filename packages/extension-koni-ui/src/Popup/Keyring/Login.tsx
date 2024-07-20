// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, PageWrapper, ResetWalletModal } from '@subwallet/extension-koni-ui/components';
import { useBiometric } from '@subwallet/extension-koni-ui/hooks/biometric';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useUILock from '@subwallet/extension-koni-ui/hooks/common/useUILock';
import useFocusById from '@subwallet/extension-koni-ui/hooks/form/useFocusById';
import { keyringUnlock } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils/form/form';
import { Button, Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { FingerprintSimple } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password'
}

interface LoginFormState {
  [FormFieldName.PASSWORD]: string;
}

const passwordInputId = 'login-password';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();

  const [form] = Form.useForm<LoginFormState>();

  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const { getToken, usingBiometric } = useBiometric();
  const { unlock } = useUILock();

  const onUpdate: FormCallbacks<LoginFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setIsDisable(error || empty);
  }, []);

  const onError = useCallback((error: string) => {
    form.setFields([{ name: FormFieldName.PASSWORD, errors: [error] }]);
    (document.getElementById(passwordInputId) as HTMLInputElement)?.select();
  }, [form]);

  const unlockWithPassword = useCallback((password: string) => {
    setLoading(true);
    keyringUnlock({
      password
    })
      .then((data) => {
        if (!data.status) {
          onError(t(data.errors[0]));
        } else {
          unlock();
        }
      })
      .catch((e: Error) => {
        onError(e.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [onError, t, unlock]);

  const unlockWithBioMetric = useCallback(() => {
    getToken().then((token) => {
      token && unlockWithPassword(token);
    }).catch(console.error);
  }, [getToken, unlockWithPassword]);

  // Auto unlock with biometric
  useEffect(() => {
    if (usingBiometric) {
      unlockWithBioMetric();
    }
  }, [usingBiometric, getToken, unlockWithBioMetric]);

  const onSubmit: FormCallbacks<LoginFormState>['onFinish'] = useCallback((values: LoginFormState) => {
    unlockWithPassword(values[FormFieldName.PASSWORD]);
  }, [unlockWithPassword]);

  useFocusById(passwordInputId);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.Base>
        <div className='background-image' />
        <div className='body-container'>
          <div className='title'>
            {t('Welcome back to Playnation')}
          </div>

          <Form
            className={'form-container'}
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
                  placeholder={t('Enter password to login')}
                />
              </Form.Item>
              {usingBiometric && (<Form.Item>
                <Button
                  block={true}
                  icon={(
                    <Icon
                      customSize={'20px'}
                      phosphorIcon={FingerprintSimple}
                    />
                  )}
                  shape={'round'}
                  size={'sm'}
                  type={'ghost'}
                >
                  {t('Login with biometric')}
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
                {t('Login')}
              </Button>
            </Form.Item>
          </Form>
          <ResetWalletModal />
        </div>
      </Layout.Base>
    </PageWrapper>
  );
};

const Login = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    position: 'relative',

    '.ant-sw-screen-layout-body': {
      background: extendToken.colorBgGradient || token.colorPrimary
    },

    '.background-image': {
      pointerEvents: 'none',
      backgroundImage: 'url("/images/games/login-background.png")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center -74px',
      backgroundSize: '506px auto',
      height: '100%',
      position: 'absolute',
      width: '100%',
      left: 0,
      top: 0
    },

    '.title': {
      paddingTop: 270,
      marginBottom: 50,
      maxWidth: 342,
      textAlign: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: 32,
      lineHeight: '42px',
      fontWeight: 700,
      color: token.colorTextDark1
    },

    '.body-container': {
      position: 'relative',
      paddingBottom: 24
    },

    '.form-container': {
      paddingLeft: token.padding,
      paddingRight: token.padding
    },

    '.ant-form-item': {
      marginBottom: token.marginXS
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
  };
});

export default Login;
