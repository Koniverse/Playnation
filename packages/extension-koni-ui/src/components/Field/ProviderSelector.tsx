// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainInfo } from '@subwallet/chain-list/types';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks/form/useSelectModalInputHelper';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { BackgroundIcon, Button, Icon, InputRef, ModalContext, SelectModal, SettingItem } from '@subwallet/react-ui';
import { CheckCircle, PlusCircle, ShareNetwork } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps, BasicInputWrapper {
  chainInfo: _ChainInfo
}

interface ProviderItemType {
  value: string,
  label: string
}

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { chainInfo, className = '', disabled, id = 'provider-selector', label, placeholder, statusHelp, value } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const navigate = useNavigate();
  const modalContext = useContext(ModalContext);
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const providerValueList = useCallback(() => {
    return Object.entries(chainInfo.providers).map(([key, provider]) => {
      return {
        value: key,
        label: provider
      } as ProviderItemType;
    });
  }, [chainInfo.providers]);

  const renderItem = useCallback((item: ProviderItemType, selected: boolean) => {
    return (
      <SettingItem
        leftItemIcon={(
          <BackgroundIcon
            backgroundColor={token.colorPrimary}
            iconColor={token.colorTextDark1}
            phosphorIcon={ShareNetwork}
            size={'sm'}
            type={'phosphor'}
          />
        )}
        name={item.label}
        rightItem={(
          <Icon
            customSize={'20px'}
            iconColor={selected ? token.colorSuccess : token.colorTransparent }
            phosphorIcon={CheckCircle}
            type='phosphor'
            weight={'fill'}
          />
        )}
      />
    );
  }, [token]);

  const renderSelectedProvider = useCallback((item: ProviderItemType) => {
    return (
      <div className={'provider_selector__selected_label'}>{item.label}</div>
    );
  }, []);

  const handleAddProvider = useCallback(() => {
    modalContext.inactiveModal(id);
    navigate('/settings/chains/add-provider', { state: chainInfo.slug });
  }, [chainInfo.slug, id, modalContext, navigate]);

  const footerButton = useCallback(() => {
    return (
      <Button
        block={true}
        icon={(
          <Icon
            customSize={'28px'}
            phosphorIcon={PlusCircle}
            type={'phosphor'}
            weight={'fill'}
          />
        )}
        onClick={handleAddProvider}
        shape={'round'}
      >
        {t('Add new provider')}
      </Button>
    );
  }, [handleAddProvider, t]);

  return (
    <SelectModal
      className={`${className} provider_selector__modal`}
      disabled={disabled}
      footer={footerButton()}
      id={id}
      inputClassName={`${className} provider_selector__input`}
      itemKey={'value'}
      items={providerValueList()}
      label={label}
      onSelect={onSelect}
      placeholder={placeholder || t('Select provider')}
      prefix={(
        <Icon
          customSize={'24px'}
          iconColor={token['gray-4']}
          phosphorIcon={ShareNetwork}
          type={'phosphor'}
          weight={'bold'}
        />
      )}
      renderItem={renderItem}
      renderSelected={renderSelectedProvider}
      selected={value || ''}
      statusHelp={statusHelp}
      title={label || placeholder || t('Select provider')}
    />
  );
};

export const ProviderSelector = styled(forwardRef(Component))<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.provider_selector__selected_label': {
      color: token.colorTextDark2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },

    '.ant-web3-block .ant-web3-block-right-item': {
      marginRight: 0,
      marginLeft: token.marginSM * 2 - 2
    },

    '.ant-sw-modal-footer': {
      borderTop: 0,
      paddingTop: 0
    },

    '&.provider_selector__modal': {
      '.ant-setting-item .ant-setting-item-name': {
        whiteSpace: 'nowrap'
      },

      '.__selection-item .ant-web3-block-right-item': {
        color: token.colorSuccess
      },

      '.ant-sw-list-section .ant-sw-list-wrapper': {
        flexBasis: 'auto',
        paddingRight: token.paddingXS,
        paddingLeft: token.paddingXS
      },

      '.ant-select-modal-item': {
        marginBottom: token.marginXXS
      },

      '.ant-sw-list': {
        borderRadius: 20,
        backgroundColor: extendToken.colorBgSecondary1,
        padding: token.paddingXS
      },

      '.ant-setting-item': {
        overflow: 'hidden',
        backgroundColor: extendToken.colorBgSecondary1,
        borderRadius: 40,

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
  });
});
