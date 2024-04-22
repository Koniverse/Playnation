// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CloseIcon, Layout, PageWrapper } from '@subwallet/extension-koni-ui/components';
import AccountAvatar from '@subwallet/extension-koni-ui/components/Account/AccountAvatar';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import useGetAccountByAddress from '@subwallet/extension-koni-ui/hooks/account/useGetAccountByAddress';
import useGetAccountSignModeByAddress from '@subwallet/extension-koni-ui/hooks/account/useGetAccountSignModeByAddress';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useDefaultNavigate from '@subwallet/extension-koni-ui/hooks/router/useDefaultNavigate';
import { editAccount } from '@subwallet/extension-koni-ui/messaging';
import { PhosphorIcon, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { AccountSignMode } from '@subwallet/extension-koni-ui/types/account';
import { FormCallbacks, FormFieldData } from '@subwallet/extension-koni-ui/types/form';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils/common/dom';
import { convertFieldToObject } from '@subwallet/extension-koni-ui/utils/form/form';
import { BackgroundIcon, Button, Field, Form, Icon, Input } from '@subwallet/react-ui';
import CN from 'classnames';
import { CircleNotch, CopySimple, Export, Eye, FloppyDiskBack, QrCode, Swatches, User, Wallet } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

enum FormFieldName {
  NAME = 'name'
}

enum ActionType {
  EXPORT = 'export',
  DERIVE = 'derive',
  DELETE = 'delete'
}

interface DetailFormState {
  [FormFieldName.NAME]: string;
}

interface MantaPayState {
  shouldShowConfirmation: boolean,
  loading: boolean,
  error?: string
}

const DEFAULT_MANTA_PAY_STATE: MantaPayState = {
  shouldShowConfirmation: true,
  loading: false
};

export enum MantaPayReducerActionType {
  INIT = 'INIT',
  SET_SHOULD_SHOW_CONFIRMATION = 'SET_SHOULD_SHOW_CONFIRMATION',
  CONFIRM_ENABLE = 'CONFIRM_ENABLE',
  REJECT_ENABLE = 'REJECT_ENABLE',
  SYNC_FAIL = 'SYNC_FAIL',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
}

interface MantaPayReducerAction {
  type: MantaPayReducerActionType,
  payload: unknown
}

export const mantaPayReducer = (state: MantaPayState, action: MantaPayReducerAction): MantaPayState => {
  const { payload, type } = action;

  switch (type) {
    case MantaPayReducerActionType.INIT:
      return DEFAULT_MANTA_PAY_STATE;
    case MantaPayReducerActionType.SET_SHOULD_SHOW_CONFIRMATION:
      return {
        ...state,
        shouldShowConfirmation: payload as boolean
      };
    case MantaPayReducerActionType.CONFIRM_ENABLE:
      return {
        ...state,
        shouldShowConfirmation: false,
        loading: false
      };
    case MantaPayReducerActionType.REJECT_ENABLE:
      return {
        ...state,
        shouldShowConfirmation: false
      };
    case MantaPayReducerActionType.SYNC_FAIL:
      return {
        ...state,
        shouldShowConfirmation: false
      };
    case MantaPayReducerActionType.SET_LOADING:
      return {
        ...state,
        loading: payload as boolean
      };
    case MantaPayReducerActionType.SET_ERROR_MESSAGE:
      return {
        ...state,
        error: payload as string,
        loading: false
      };
    default:
      throw new Error("Can't handle action");
  }
};

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const notify = useNotification();
  const { token } = useTheme() as Theme;
  const { accountAddress } = useParams();
  const dataContext = useContext(DataContext);

  const [form] = Form.useForm<DetailFormState>();

  const account = useGetAccountByAddress(accountAddress);

  const saveTimeOutRef = useRef<NodeJS.Timer>();

  const [saving, setSaving] = useState(false);

  const signMode = useGetAccountSignModeByAddress(accountAddress);

  const walletNamePrefixIcon = useMemo((): PhosphorIcon => {
    switch (signMode) {
      case AccountSignMode.LEDGER:
        return Swatches;
      case AccountSignMode.QR:
        return QrCode;
      case AccountSignMode.READ_ONLY:
        return Eye;
      case AccountSignMode.INJECTED:
        return Wallet;
      default:
        return User;
    }
  }, [signMode]);

  const onExport = useCallback(() => {
    if (account?.address) {
      navigate(`/accounts/export/${account.address}`);
    }
  }, [account?.address, navigate]);

  const onCopyAddress = useCallback(() => {
    copyToClipboard(account?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [account?.address, notify, t]);

  const onUpdate: FormCallbacks<DetailFormState>['onFieldsChange'] = useCallback((changedFields: FormFieldData[], allFields: FormFieldData[]) => {
    const changeMap = convertFieldToObject<DetailFormState>(changedFields);

    if (changeMap[FormFieldName.NAME]) {
      clearTimeout(saveTimeOutRef.current);
      setSaving(true);
      saveTimeOutRef.current = setTimeout(() => {
        form.submit();
      }, 1000);
    }
  }, [form]);

  const onSubmit: FormCallbacks<DetailFormState>['onFinish'] = useCallback((values: DetailFormState) => {
    clearTimeout(saveTimeOutRef.current);
    const name = values[FormFieldName.NAME];

    if (!account || name === account.name) {
      setSaving(false);

      return;
    }

    const address = account.address;

    if (!address) {
      setSaving(false);

      return;
    }

    editAccount(account.address, name.trim())
      .catch(console.error)
      .finally(() => {
        setSaving(false);
      });
  }, [account]);

  useEffect(() => {
    if (!account) {
      goHome();
    }
  }, [account, goHome, navigate]);

  if (!account) {
    return null;
  }

  return (
    <PageWrapper
      className={CN(className)}
      resolve={dataContext.awaitStores(['mantaPay'])}
    >
      <Layout.WithSubHeaderOnly
        subHeaderIcons={[
          {
            icon: <CloseIcon />,
            onClick: goHome
          }
        ]}
        title={t('Account details')}
      >
        <div className='body-container'>
          {/* <div className='account-qr'> */}
          {/*   <SwQRCode */}
          {/*     errorLevel='M' */}
          {/*     icon='' */}
          {/*     // iconSize={token.sizeLG * 1.5} */}
          {/*     size={token.sizeXL * 3.5} */}
          {/*     value={account.address} */}
          {/*   /> */}
          {/* </div> */}
          <Form
            className={'account-detail-form'}
            form={form}
            initialValues={{
              [FormFieldName.NAME]: account.name || ''
            }}
            name='account-detail-form'
            onFieldsChange={onUpdate}
            onFinish={onSubmit}
          >
            <Form.Item
              className={CN('account-field')}
              name={FormFieldName.NAME}
              rules={[
                {
                  message: t('Account name is required'),
                  transform: (value: string) => value.trim(),
                  required: true
                }
              ]}
              statusHelpAsTooltip={true}
            >
              <Input
                className='account-name-input'
                disabled={account.isInjected}
                label={t('Account name')}
                onBlur={form.submit}
                placeholder={t('Account name')}
                prefix={(
                  <BackgroundIcon
                    backgroundColor='var(--wallet-name-icon-bg-color)'
                    className={'user-name-icon'}
                    iconColor='var(--wallet-name-icon-color)'
                    phosphorIcon={walletNamePrefixIcon}
                  />
                )}
                suffix={(
                  <Icon
                    className={CN({ loading: saving })}
                    phosphorIcon={saving ? CircleNotch : FloppyDiskBack}
                    size='sm'
                  />
                )}
              />
            </Form.Item>
          </Form>
          <div className={CN('account-field')}>
            <Field
              content={toShort(account.address, 11, 13)}
              label={t('Wallet address')}
              placeholder={t('Wallet address')}
              prefix={(
                <AccountAvatar
                  size={token.sizeMD}
                  value={account.address}
                />
              )}
              suffix={(
                <Button
                  icon={(
                    <Icon
                      phosphorIcon={CopySimple}
                      size='sm'
                    />
                  )}
                  onClick={onCopyAddress}
                  size='xs'
                  type='ghost'
                />
              )}
            />
          </div>
        </div>

        <div className={CN('account-detail___action-footer')}>
          <Button
            className={CN('account-button')}
            disabled={account.isInjected}
            icon={(
              <Icon
                phosphorIcon={Export}
                weight='fill'
              />
            )}
            onClick={onExport}
            schema='primary'
          >
            {t('Export')}
          </Button>
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const AccountDetail = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.account-detail-form': {
      marginTop: token.margin
    },

    '.ant-sw-screen-layout-body': {
      display: 'flex',
      flexDirection: 'column'
    },

    '.zk-mask': {
      width: '100%',
      height: '100%',
      zIndex: 3,
      position: 'absolute',
      backgroundColor: token.colorBgMask
    },

    '.body-container': {
      overflow: 'scroll',
      flex: 1,
      padding: `0 ${token.padding}px`,
      '--wallet-name-icon-bg-color': token['geekblue-6'],
      '--wallet-name-icon-color': token.colorWhite,

      '.ant-background-icon': {
        width: token.sizeMD,
        height: token.sizeMD,

        '.user-name-icon': {
          span: {
            height: token.sizeSM,
            width: token.sizeSM
          }
        }
      },

      '.account-qr': {
        marginTop: token.margin,
        marginBottom: token.marginLG,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
      },

      '.account-field': {
        marginBottom: token.marginXS,

        '.single-icon-only': {
          color: token['gray-4']
        },

        '.ant-input-label': {
          marginBottom: token.marginXS - 2
        },

        '.ant-input-suffix': {
          marginRight: 0,
          marginLeft: token.marginXS
        },

        '.ant-btn': {
          height: 'auto',
          marginRight: -(token.marginSM - 2)
        }
      },

      '.mb-lg': {
        marginBottom: token.marginLG
      },

      '.account-button': {
        marginBottom: token.marginXS,
        gap: token.sizeXS,
        color: token.colorTextLight1,

        '&:disabled': {
          color: token.colorTextLight1,
          opacity: 0.4
        }
      },

      [`.action-type-${ActionType.DERIVE}`]: {
        '--icon-bg-color': token['magenta-7']
      },

      [`.action-type-${ActionType.EXPORT}`]: {
        '--icon-bg-color': token['green-6']
      },

      [`.action-type-${ActionType.DELETE}`]: {
        '--icon-bg-color': token['colorError-6'],
        color: token['colorError-6'],

        '.ant-background-icon': {
          color: token.colorTextLight1
        },

        '&:disabled': {
          color: token['colorError-6'],

          '.ant-background-icon': {
            color: token.colorTextLight1
          }
        }
      }
    },

    '.account-name-input': {
      '.loading': {
        color: token['gray-5'],
        animation: 'spinner-loading 1s infinite linear'
      }
    },

    '.footer__button': {
      flexGrow: 1
    },

    '.account-detail___action-footer': {
      backgroundColor: token.colorBgDefault,
      position: 'sticky',
      bottom: 0,
      left: 0,
      width: '100%',
      display: 'flex',
      gap: token.marginSM,
      padding: token.padding,
      paddingBottom: '33px',

      button: {
        flex: 2
      },

      'button:nth-child(1)': {
        flex: 1
      }
    }
  };
});

export default AccountDetail;
