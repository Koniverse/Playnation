// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { simpleSettingsScreensLayoutBackgroundImages } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useFocusFormItem, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { keyringChangeMasterPassword } from '@subwallet/extension-koni-ui/messaging';
import { FormCallbacks, FormFieldData, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { renderBaseConfirmPasswordRules, renderBasePasswordRules, simpleCheckForm } from '@subwallet/extension-koni-ui/utils';
import { Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, XCircle } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps

enum FormFieldName {
  PASSWORD = 'password',
  OLD_PASSWORD = 'old_password',
  CONFIRM_PASSWORD = 'confirm_password',
  CONFIRM_CHECKBOX = 'confirm_checkbox'
}

interface ChangePasswordFormState {
  [FormFieldName.PASSWORD]: string;
  [FormFieldName.OLD_PASSWORD]: string;
  [FormFieldName.CONFIRM_PASSWORD]: string;
  [FormFieldName.CONFIRM_CHECKBOX]: boolean;
}

const formName = 'change-password-form';

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();

  const [form] = Form.useForm<ChangePasswordFormState>();
  const [isDisabled, setIsDisable] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const [loading, setLoading] = useState(false);

  const newPasswordRules = useMemo(() => renderBasePasswordRules(t('New password'), t), [t]);
  const confirmPasswordRules = useMemo(() => renderBaseConfirmPasswordRules(FormFieldName.PASSWORD, t), [t]);

  const goBack = useCallback(() => {
    navigate('/settings/security');
  }, [navigate]);

  const onSubmit: FormCallbacks<ChangePasswordFormState>['onFinish'] = useCallback((values: ChangePasswordFormState) => {
    const password = values[FormFieldName.PASSWORD];
    const oldPassword = values[FormFieldName.OLD_PASSWORD];

    if (password && oldPassword) {
      setLoading(true);
      setTimeout(() => {
        keyringChangeMasterPassword({
          createNew: false,
          newPassword: password,
          oldPassword: oldPassword
        }).then((res) => {
          if (!res.status) {
            form.setFields([{ name: FormFieldName.OLD_PASSWORD, errors: res.errors }]);
          } else {
            goHome();
          }
        }).catch((e: Error) => {
          form.setFields([{ name: FormFieldName.OLD_PASSWORD, errors: [e.message] }]);
        }).finally(() => {
          setLoading(false);
        });
      }, 300);
    }
  }, [form, goHome]);

  const onUpdate: FormCallbacks<ChangePasswordFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const { empty, error } = simpleCheckForm(allFields);

    setSubmitError('');
    setIsDisable(error || empty);
  }, []);

  const onChangePassword = useCallback(() => {
    form.resetFields([FormFieldName.CONFIRM_PASSWORD]);
  }, [form]);

  useFocusFormItem(form, FormFieldName.OLD_PASSWORD);

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        backgroundImages={simpleSettingsScreensLayoutBackgroundImages}
        backgroundStyle={'secondary'}
        leftFooterButton={{
          children: t('Cancel'),
          onClick: goBack,
          schema: 'secondary',
          disabled: loading,
          shape: 'round',
          icon: (
            <Icon
              customSize={'20px'}
              phosphorIcon={XCircle}
              weight='fill'
            />
          )
        }}
        onBack={goBack}
        rightFooterButton={{
          children: t('Submit'),
          onClick: form.submit,
          loading: loading,
          disabled: isDisabled,
          shape: 'round',
          icon: (
            <Icon
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )
        }}
        title={t('Change password')}
      >
        <div className='body-container'>
          <Form
            className={'form-container'}
            form={form}
            initialValues={{
              [FormFieldName.OLD_PASSWORD]: '',
              [FormFieldName.PASSWORD]: '',
              [FormFieldName.CONFIRM_PASSWORD]: ''
            }}
            name={formName}
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <Form.Item
              name={FormFieldName.OLD_PASSWORD}
              rules={[
                {
                  message: t('Password is required'),
                  required: true
                }
              ]}
            >
              <Input.Password
                disabled={loading}
                label={t('Your old password')}
                placeholder={t('Enter your old password')}
                type='password'
              />
            </Form.Item>
            <div className={'field-separator'}></div>
            <Form.Item
              name={FormFieldName.PASSWORD}
              rules={newPasswordRules}
            >
              <Input.Password
                disabled={loading}
                label={t('New password')}
                onChange={onChangePassword}
                placeholder={t('Enter new password')}
                type='password'
              />
            </Form.Item>
            <div className={'field-separator'}></div>
            <Form.Item
              name={FormFieldName.CONFIRM_PASSWORD}
              rules={confirmPasswordRules}
            >
              <Input.Password
                disabled={loading}
                label={t('Confirm new password')}
                placeholder={t('Enter your new password again')}
                type='password'
              />
            </Form.Item>
            <Form.Item
              help={submitError}
              validateStatus={submitError && 'error'}
            />
          </Form>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const ChangePassword = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.body-container': {
      paddingTop: token.paddingXXS,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
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

    '.form-container': {
      backgroundColor: token.colorBgInput,
      borderRadius: 20,
      paddingLeft: token.paddingXXS,
      paddingRight: token.paddingXXS,
      paddingBottom: token.padding
    },

    '.ant-form-item-explain': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      paddingBottom: 0
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

export default ChangePassword;
