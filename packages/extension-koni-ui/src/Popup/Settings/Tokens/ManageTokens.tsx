// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _isCustomAsset } from '@subwallet/extension-base/services/chain-service/utils';
import { FilterModal, Layout, OptionType, PageWrapper, TokenEmptyList, TokenToggleItem } from '@subwallet/extension-koni-ui/components';
import { settingsScreensLayoutBackgroundImages } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { useDefaultNavigate, useFilterModal, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useChainAssets } from '@subwallet/extension-koni-ui/hooks/assets';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ButtonProps, Icon, ModalContext, SwList } from '@subwallet/react-ui';
import { FadersHorizontal, Plus } from 'phosphor-react';
import React, { SyntheticEvent, useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const FILTER_MODAL_ID = 'filterTokenModal';

enum FilterValue {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  CUSTOM = 'custom'
}

const renderEmpty = () => <TokenEmptyList />;

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const goBack = useDefaultNavigate().goBack;
  const dataContext = useContext(DataContext);
  const { activeModal } = useContext(ModalContext);

  const { assetSettingMap } = useSelector((state: RootState) => state.assetRegistry);

  const assetItems = useChainAssets({ isFungible: true }).chainAssets;
  const { filterSelectionMap, onApplyFilter, onChangeFilterOption, onCloseFilterModal, selectedFilters } = useFilterModal(FILTER_MODAL_ID);
  const filterFunction = useMemo<(item: _ChainAsset) => boolean>(() => {
    return (chainAsset) => {
      if (!selectedFilters.length) {
        return true;
      }

      for (const filter of selectedFilters) {
        if (filter === FilterValue.CUSTOM) {
          if (_isCustomAsset(chainAsset.slug)) {
            return true;
          }
        } else if (filter === FilterValue.ENABLED) {
          if (assetSettingMap[chainAsset.slug] && assetSettingMap[chainAsset.slug].visible) {
            return true;
          }
        } else if (filter === FilterValue.DISABLED) {
          if (!assetSettingMap[chainAsset.slug] || !assetSettingMap[chainAsset.slug].visible) {
            return true;
          }
        }
      }

      return false;
    };
  }, [assetSettingMap, selectedFilters]);

  const FILTER_OPTIONS = useMemo((): OptionType[] => ([
    { label: t('Enabled tokens'), value: FilterValue.ENABLED },
    { label: t('Disabled tokens'), value: FilterValue.DISABLED },
    { label: t('Custom tokens'), value: FilterValue.CUSTOM }
  ]), [t]);

  const searchToken = useCallback((token: _ChainAsset, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();

    return (
      token.name.toLowerCase().includes(searchTextLowerCase) ||
      token.symbol.toLowerCase().includes(searchTextLowerCase)
    );
  }, []);

  const renderTokenItem = useCallback((tokenInfo: _ChainAsset) => {
    return (
      <TokenToggleItem
        assetSettingMap={assetSettingMap}
        key={tokenInfo.slug}
        tokenInfo={tokenInfo}
      />
    );
  }, [assetSettingMap]);

  const subHeaderButton: ButtonProps[] = useMemo(() => {
    return [
      {
        icon: (
          <Icon
            phosphorIcon={Plus}
            size='sm'
            type='phosphor'
          />
        ),
        onClick: () => {
          navigate('/settings/tokens/import-token', { state: { isExternalRequest: false } });
        }
      }
    ];
  }, [navigate]);

  const openFilterModal = useCallback((e?: SyntheticEvent) => {
    e && e.stopPropagation();
    activeModal(FILTER_MODAL_ID);
  }, [activeModal]);

  return (
    <PageWrapper
      className={`manage_tokens ${className}`}
      resolve={dataContext.awaitStores(['assetRegistry'])}
    >
      <Layout.Base
        backgroundImages={settingsScreensLayoutBackgroundImages}
        backgroundStyle={'secondary'}
        onBack={goBack}
        showBackButton={true}
        showSubHeader={true}
        subHeaderBackground={'transparent'}
        subHeaderCenter={true}
        subHeaderIcons={subHeaderButton}
        subHeaderPaddingVertical={true}
        title={t<string>('Manage tokens')}
      >
        <SwList.Section
          actionBtnIcon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={FadersHorizontal}
              size='sm'
              type='phosphor'
              weight={'fill'}
            />
          )}
          autoFocusSearch={false}
          className={'manage_tokens__container'}
          enableSearchInput={true}
          filterBy={filterFunction}
          gridGap={'14px'}
          list={assetItems}
          minColumnWidth={'172px'}
          onClickActionBtn={openFilterModal}
          renderItem={renderTokenItem}
          renderWhenEmpty={renderEmpty}
          searchFunction={searchToken}
          searchMinCharactersCount={2}
          searchPlaceholder={t<string>('Search token')}
          showActionBtn={true}
        />

        <FilterModal
          id={FILTER_MODAL_ID}
          onApplyFilter={onApplyFilter}
          onCancel={onCloseFilterModal}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          options={FILTER_OPTIONS}
        />
      </Layout.Base>
    </PageWrapper>
  );
}

const ManageTokens = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.ant-sw-screen-layout-body-inner': {
      display: 'flex'
    },

    '.ant-sw-list-section.-boxed-mode .ant-sw-list.-ignore-scrollbar': {
      paddingRight: token.padding + 6
    },

    '.ant-sw-list-search-input': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.ant-sw-list-wrapper': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.ant-sw-list-section': {
      paddingTop: token.paddingXXS
    },

    '.ant-sw-list': {
      backgroundColor: extendToken.colorBgSecondary1,
      padding: token.paddingXS,
      borderRadius: 20
    },

    '.ant-network-item + .ant-network-item': {
      marginTop: token.marginXXS,
      position: 'relative',
      zIndex: 1,

      '&:before': {
        content: '""',
        position: 'absolute',
        left: 64,
        right: 48,
        height: 1,
        top: -token.marginXXS,
        backgroundColor: token.colorBgDivider
      }
    },

    '&__inner': {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    '.manage_tokens__container': {
      paddingTop: token.paddingXXS,
      paddingBottom: 24,
      flex: 1,

      'button + button': {
        marginLeft: token.marginXS
      }
    }
  });
});

export default ManageTokens;
