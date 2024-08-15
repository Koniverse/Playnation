// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType, ThemeNames } from '@subwallet/extension-base/background/KoniTypes';
import { ENABLE_LANGUAGES, languageOptions } from '@subwallet/extension-base/constants/i18n';
import { saveLanguage, saveTheme } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { BackgroundIcon, Icon, SelectModal, SettingItem, SwIconProps } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretRight, CheckCircle, GlobeHemisphereEast, ShieldStar, Swatches } from 'phosphor-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

type SelectionItemType = {
  key: string,
  leftIcon: SwIconProps['phosphorIcon'],
  leftIconBgColor: string,
  title: string,
  disabled?: boolean,
};

function renderSelectionItem (item: SelectionItemType, _selected: boolean) {
  return (
    <SettingItem
      className={CN('__selection-item', { 'item-disabled': item.disabled })}
      key={item.key}
      leftItemIcon={
        (
          <div
            className={'__left-icon'}
            style={{ background: item.leftIconBgColor }}
          >
            <Icon
              customSize={'16px'}
              phosphorIcon={item.leftIcon}
              type='phosphor'
              weight='fill'
            />
          </div>
        )
      }
      name={item.title}
      rightItem={
        _selected
          ? (
            <Icon
              className='__right-icon'
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              type='phosphor'
              weight='fill'
            />
          )
          : null
      }
    />
  );
}

function renderModalTrigger (item: SelectionItemType) {
  return (
    <SettingItem
      className={'__trigger-item setting-group-item'}
      key={item.key}
      leftItemIcon={
        <BackgroundIcon
          backgroundColor={item.leftIconBgColor}
          phosphorIcon={item.leftIcon}
          size='sm'
          type='phosphor'
          weight='fill'
        />
      }
      name={item.title}
      rightItem={
        <Icon
          className='__right-icon'
          customSize={'20px'}
          phosphorIcon={CaretRight}
          type='phosphor'
        />
      }
    />
  );
}

type LoadingMap = {
  language: boolean;
  browserConfirmationType: boolean;
};

function Component ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const theme = useSelector((state: RootState) => state.settings.theme);
  const _language = useSelector((state: RootState) => state.settings.language);
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({
    browserConfirmationType: false,
    language: false
  });

  const { token } = useTheme() as Theme;

  const themeItems = useMemo<SelectionItemType[]>(() => {
    return [
      {
        key: ThemeNames.DEFAULT,
        leftIcon: Swatches,
        leftIconBgColor: '#CBF147',
        title: t('Default')
      },
      {
        key: ThemeNames.SKY,
        leftIcon: Swatches,
        leftIconBgColor: '#C7F0FF',
        title: t('Sky')
      },
      {
        key: ThemeNames.MORNING_SUNNY,
        leftIcon: Swatches,
        leftIconBgColor: '#FFF8C4',
        title: t('Morning sunny')
      },
      {
        key: ThemeNames.SPRING,
        leftIcon: Swatches,
        leftIconBgColor: '#7EEC79',
        title: t('Spring')
      },
      {
        key: ThemeNames.LAVENDER,
        leftIcon: Swatches,
        leftIconBgColor: '#BB9EFF',
        title: t('Lavender')
      },
      {
        key: ThemeNames.SUNNY,
        leftIcon: Swatches,
        leftIconBgColor: '#FBCE01',
        title: t('Sunny')
      },
      {
        key: ThemeNames.BEGIE,
        leftIcon: Swatches,
        leftIconBgColor: '#EBD7C9',
        title: t('Begie')
      },
      {
        key: ThemeNames.CLOVE,
        leftIcon: Swatches,
        leftIconBgColor: 'linear-gradient(117deg, #A2F6C1 9.05%, #CBF147 91.43%)',
        title: t('Clove')
      },
      {
        key: ThemeNames.AURORA,
        leftIcon: Swatches,
        leftIconBgColor: 'linear-gradient(117deg, #A2F6C1 9.05%, #9FE3FF 91.43%)',
        title: t('Aurora')
      }
    ];
  }, [t]);

  const languageItems = useMemo<SelectionItemType[]>(() => {
    return languageOptions.map((item) => ({
      key: item.value,
      leftIcon: GlobeHemisphereEast,
      leftIconBgColor: token.colorPrimary,
      title: item.text,
      disabled: !ENABLE_LANGUAGES.includes(item.value)
    }));
  }, [token]);

  const onSelectLanguage = useCallback((value: string) => {
    setLoadingMap((prev) => ({
      ...prev,
      language: true
    }));
    saveLanguage(value as LanguageType)
      .finally(() => {
        setLoadingMap((prev) => ({
          ...prev,
          language: false
        }));
      });
  }, []);

  const onSelectTheme = useCallback((value: string) => {
    saveTheme(value as ThemeNames).finally(noop);
  }, []);

  const onNavigateToSecurity = useCallback(() => {
    navigate('/settings/security', { state: true });
  }, [navigate]);

  return (
    <div className={CN('setting-group-container general-setting', className)}>
      <SelectModal
        background={'default'}
        className={CN(`__modal ${className}`, '-secondary-theme')}
        customInput={renderModalTrigger({
          key: 'languages-trigger',
          leftIcon: GlobeHemisphereEast,
          leftIconBgColor: token['green-6'],
          title: t('Language')
        })}
        disabled={loadingMap.language}
        id='languages-select-modal'
        inputWidth={'100%'}
        itemKey='key'
        items={languageItems}
        onSelect={onSelectLanguage}
        renderItem={renderSelectionItem}
        selected={_language}
        shape='round'
        size='small'
        title={t('Language')}
      />

      <SelectModal
        background={'default'}
        className={CN(`__modal ${className}`, '-secondary-theme')}
        customInput={renderModalTrigger({
          key: 'wallet-theme-trigger',
          leftIcon: Swatches,
          leftIconBgColor: token.colorPrimary,
          title: t('Wallet theme')
        })}
        id='wallet-theme-select-modal'
        inputWidth={'100%'}
        itemKey='key'
        items={themeItems}
        onSelect={onSelectTheme}
        renderItem={renderSelectionItem}
        selected={theme}
        shape='round'
        title={t('Wallet theme')}
      />

      {false && <SettingItem
        className={'__setting-item setting-group-item'}
        leftItemIcon={(
          <BackgroundIcon
            phosphorIcon={ShieldStar}
            size='sm'
            weight='fill'
          />
        )}
        name={t('Password setting')}
        onPressItem={onNavigateToSecurity}
        rightItem={
          <Icon
            className='__right-icon'
            customSize={'20px'}
            phosphorIcon={CaretRight}
            type='phosphor'
          />
        }
      />}
    </div>
  );
}

export const GeneralSetting = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.item-disabled': {
      '.ant-setting-item-content': {
        cursor: 'not-allowed'
      }
    },

    '&.general-setting': {
      '.ant-select-modal-input-custom + .ant-select-modal-input-custom': {
        marginTop: token.marginXS
      },

      '.ant-select-modal-input-custom': {
        width: 'unset'
      },

      '.__trigger-item .ant-web3-block-right-item': {
        color: token.colorTextLight4
      },

      '.__trigger-item:hover .ant-web3-block-right-item': {
        color: token.colorTextLight2
      }
    },

    '&.__modal': {
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

export default GeneralSetting;
