// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { useSelectModalInputHelper } from '@subwallet/extension-koni-ui/hooks/form/useSelectModalInputHelper';
import { ChainItemType, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, InputRef, Logo, NetworkItem, SelectModal } from '@subwallet/react-ui';
import { CheckCircle } from 'phosphor-react';
import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';

import { GeneralEmptyList } from '../EmptyList';

interface Props extends ThemeProps, BasicInputWrapper {
  items: ChainItemType[];
  loading?: boolean
}

const renderEmpty = () => <GeneralEmptyList />;

function Component (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> {
  const { className = '', disabled, id = 'address-input', items, label, loading, placeholder, statusHelp, title, tooltip, value } = props;
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const renderChainSelected = useCallback((item: ChainItemType) => {
    if (loading) {
      return (
        <div className={'__loading-text'}>{t('Loading ...')}</div>
      );
    }

    return (
      <div className={'__selected-item'}>{item.name}</div>
    );
  }, [loading, t]);

  const searchFunction = useCallback((item: ChainItemType, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      item.name.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  const chainLogo = useMemo(() => {
    return (
      <Logo
        className='chain-logo'
        network={value}
        shape='circle'
        size={token.controlHeightSM}
      />
    );
  }, [value, token.controlHeightSM]);

  const renderItem = useCallback((item: ChainItemType, selected: boolean) => {
    return (
      <NetworkItem
        name={item.name}
        networkKey={item.slug}
        networkMainLogoShape='squircle'
        networkMainLogoSize={24}
        rightItem={selected && (<div className={'__check-icon'}>
          <Icon
            customSize={'20px'}
            iconColor={token.colorSuccess}
            phosphorIcon={CheckCircle}
            type='phosphor'
            weight='fill'
          />
        </div>)}
      />
    );
  }, [token]);

  return (
    <SelectModal
      className={`${className} chain-selector-modal`}
      disabled={disabled}
      id={id}
      inputClassName={`${className} chain-selector-input`}
      itemKey={'slug'}
      items={items}
      label={label}
      loading={loading}
      onSelect={onSelect}
      placeholder={placeholder || t('Select chain')}
      prefix={value !== '' && chainLogo}
      renderItem={renderItem}
      renderSelected={renderChainSelected}
      renderWhenEmpty={renderEmpty}
      searchFunction={searchFunction}
      searchMinCharactersCount={2}
      searchPlaceholder={t<string>('Network name')}
      selected={value || ''}
      statusHelp={statusHelp}
      title={title || label || placeholder || t('Select network')}
      tooltip={tooltip}
    />
  );
}

export const ChainSelector = styled(forwardRef(Component))<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '&.chain-selector-modal': {
      '.ant-sw-list-search-input.ant-sw-list-search-input': {
        paddingLeft: token.paddingXS,
        paddingRight: token.paddingXS
      },

      '.ant-sw-list': {
        borderRadius: 20,
        backgroundColor: extendToken.colorBgSecondary1,
        padding: token.paddingXS
      },

      '.ant-network-item.ant-network-item .ant-web3-block': {
        paddingRight: 0
      },

      '.ant-network-item.ant-network-item .ant-web3-block-left-item': {
        paddingRight: token.paddingSM
      },

      '.ant-network-item.ant-network-item .ant-web3-block .ant-web3-block-right-item': {
        marginRight: 0
      },

      '.ant-sw-list-wrapper.ant-sw-list-wrapper': {
        paddingLeft: token.paddingXS,
        paddingRight: token.paddingXS
      },

      '.ant-select-modal-item.ant-select-modal-item': {
        marginBottom: 0
      },

      '.ant-select-modal-item + .ant-select-modal-item': {
        marginTop: token.marginXXS
      }
    },

    '&.chain-selector-input': {
      '.__selected-item, .__loading-text': {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      '.__selected-item': {
        color: token.colorText
      },

      '.__loading-text': {
        color: token.colorTextLight4
      }
    },

    '.chain-logo': {
      margin: '-1px 0'
    },

    '.ant-network-item .__check-icon': {
      display: 'flex',
      width: 40,
      justifyContent: 'center'
    }
  });
});
