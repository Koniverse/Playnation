// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { RequestChangeMasterPassword } from '@subwallet/extension-base/background/KoniTypes';
import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { DEFAULT_HOMEPAGE, DEFAULT_PASSWORD, simpleSettingsScreensLayoutBackgroundImages, SUBSTRATE_ACCOUNT_TYPE } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { useBiometric } from '@subwallet/extension-koni-ui/hooks/biometric';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useFocusFormItem from '@subwallet/extension-koni-ui/hooks/form/useFocusFormItem';
import { createAccountSuriV2, createSeedV2, keyringChangeMasterPassword } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { simpleCheckForm } from '@subwallet/extension-koni-ui/utils/form/form';
import { renderBaseConfirmPasswordRules, renderBasePasswordRules } from '@subwallet/extension-koni-ui/utils/form/validators/password';
import { Checkbox, Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import { Callbacks, FieldData } from 'rc-field-form/lib/interface';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password',
  CONFIRM_PASSWORD = 'confirm_password',
  ENABLE_BIOMETRIC = 'enable_biometric'
}

interface CreatePasswordFormState {
  [FormFieldName.PASSWORD]: string;
  [FormFieldName.CONFIRM_PASSWORD]: string;
  [FormFieldName.ENABLE_BIOMETRIC]: boolean;
}

const FooterIcon = (
  <Icon
    customSize={'20px'}
    phosphorIcon={CheckCircle}
    weight='fill'
  />
);

const formName = 'create-password-form';
const telegramConnector = TelegramConnector.instance;

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goBack } = useDefaultNavigate();

  const notification = useNotification();

  const { accounts, hasMasterPassword, useCustomPassword } = useSelector((state: RootState) => state.accountState);
  const passwordRules = useMemo(() => renderBasePasswordRules(t('Password'), t), [t]);
  const confirmPasswordRules = useMemo(() => renderBaseConfirmPasswordRules(FormFieldName.PASSWORD, t), [t]);
  // const checkBoxValidator = useCallback((rule: RuleObject, value: boolean): Promise<void> => {
  //   if (!value) {
  //     return Promise.reject(new Error(t('CheckBox is required')));
  //   }
  //
  //   return Promise.resolve();
  // }, [t]);
  const [form] = Form.useForm<CreatePasswordFormState>();
  const [isDisabled, setIsDisable] = useState(true);
  const { setToken, supportBiometric } = useBiometric();

  const [loading, setLoading] = useState(false);

  const onComplete = useCallback(() => {
    // Auto create account if no account
    accounts.length === 0 && (async () => {
      // Create default account
      const seedPhrase = await createSeedV2(undefined, undefined, [SUBSTRATE_ACCOUNT_TYPE]);
      const accountName = telegramConnector.userInfo?.username || 'Account 1';

      await createAccountSuriV2({
        name: accountName,
        suri: seedPhrase.seed,
        types: [SUBSTRATE_ACCOUNT_TYPE],
        isAllowed: true
      });

      navigate(DEFAULT_HOMEPAGE);
    })().catch(console.error);
  }, [accounts.length, navigate]);

  useEffect(() => {
    form.setFieldsValue({
      [FormFieldName.ENABLE_BIOMETRIC]: supportBiometric
    });
  }, [form, supportBiometric]);

  const onSubmit: Callbacks<CreatePasswordFormState>['onFinish'] = useCallback(async (values: CreatePasswordFormState) => {
    const password = values[FormFieldName.PASSWORD];
    const enableBiometric = values[FormFieldName.ENABLE_BIOMETRIC];

    if (password) {
      setLoading(true);

      // Handle enable biometric
      if (supportBiometric && enableBiometric) {
        await setToken(password);
      }

      let params: RequestChangeMasterPassword = {
        createNew: true,
        newPassword: password
      };

      if (hasMasterPassword && !useCustomPassword) {
        params = {
          createNew: false,
          newPassword: password,
          oldPassword: DEFAULT_PASSWORD
        };
      }

      keyringChangeMasterPassword(params).then((res) => {
        if (!res.status) {
          notification({
            message: res.errors[0],
            type: 'error'
          });
        } else {
          onComplete();
        }
      }).catch((e: Error) => {
        notification({
          message: e.message,
          type: 'error'
        });
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [supportBiometric, hasMasterPassword, useCustomPassword, setToken, notification, onComplete]);

  // Trigger in the first time
  useEffect(() => {
    if (!hasMasterPassword && accounts.length === 0) {
      onSubmit({
        [FormFieldName.PASSWORD]: DEFAULT_PASSWORD,
        [FormFieldName.CONFIRM_PASSWORD]: DEFAULT_PASSWORD,
        [FormFieldName.ENABLE_BIOMETRIC]: false
      });
    }
  }, [accounts.length, hasMasterPassword, onSubmit]);

  const onUpdate: Callbacks<CreatePasswordFormState>['onFieldsChange'] = useCallback((changedFields: FieldData[], allFields: FieldData[]) => {
    // @ts-ignore
    const checkFields = allFields.filter(({ name }) => name[0] !== FormFieldName.ENABLE_BIOMETRIC);

    if (checkFields.length > 0) {
      const { empty, error } = simpleCheckForm(checkFields);

      setIsDisable(error || empty);
    }
  }, []);

  const onChangePassword = useCallback(() => {
    form.resetFields([FormFieldName.CONFIRM_PASSWORD]);
  }, [form]);

  useFocusFormItem(form, FormFieldName.PASSWORD, true);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        backgroundImages={simpleSettingsScreensLayoutBackgroundImages}
        backgroundStyle={'secondary'}
        onBack={goBack}
        rightFooterButton={{
          children: t('Finish'),
          onClick: form.submit,
          loading: loading,
          disabled: isDisabled,
          shape: 'round',
          icon: FooterIcon
        }}
        title={t('Create password')}
      >
        <div className='body-container'>
          <Form
            form={form}
            initialValues={{
              [FormFieldName.PASSWORD]: '',
              [FormFieldName.CONFIRM_PASSWORD]: '',
              [FormFieldName.ENABLE_BIOMETRIC]: supportBiometric
            }}
            name={formName}
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <div className='field-group'>
              <Form.Item
                name={FormFieldName.PASSWORD}
                rules={passwordRules}
              >
                <Input.Password
                  label={t('Your password')}
                  onChange={onChangePassword}
                  placeholder={t('Enter password')}
                  type='password'
                />
              </Form.Item>

              <div className={'field-separator'}></div>

              <Form.Item
                name={FormFieldName.CONFIRM_PASSWORD}
                rules={confirmPasswordRules}
              >
                <Input.Password
                  label={t('Confirm password')}
                  placeholder={t('Enter your password again')}
                  type='password'
                />
              </Form.Item>
            </div>

            {supportBiometric && (<Form.Item
              className={'form-checkbox'}
              name={FormFieldName.ENABLE_BIOMETRIC}
              statusHelpAsTooltip={true}
              valuePropName={'checked'}
            >
              <Checkbox
                className={'checkbox'}
              >
                {t('Enable biometric login')}
              </Checkbox>
            </Form.Item>)}
          </Form>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const CreatePassword = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      paddingTop: token.paddingXXS,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.ant-form-item-explain': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: 0
    },

    '.ant-form-item': {
      marginBottom: 0
    },

    '.ant-input-password': {
      '&:before': {
        display: 'none'
      },

      '.ant-input-prefix': {
        display: 'none'
      }
    },

    '.field-group': {
      backgroundColor: token.colorBgInput,
      borderRadius: 20,
      paddingLeft: token.paddingXXS,
      paddingRight: token.paddingXXS,
      paddingBottom: token.padding
    },

    '.form-checkbox.form-checkbox': {
      paddingTop: token.paddingSM,
      paddingLeft: token.padding,
      paddingRight: token.padding,

      '.checkbox': {
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center'
      }
    },

    '.field-separator': {
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: token.padding,

      '&:before': {
        content: '""',
        display: 'block',
        height: 1,
        backgroundColor: token.colorBgDivider
      }
    }
  };
});

export default CreatePassword;
