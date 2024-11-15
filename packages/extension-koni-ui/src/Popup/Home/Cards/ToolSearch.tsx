// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards/index';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Input } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { ChangeEventHandler, Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  setIsSearchAction: Dispatch<SetStateAction<boolean>>,
  isSearchAction: boolean,
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>,
};

const Component = ({ className, isSearchAction, setConditionProcess, setIsSearchAction }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const value = e?.target?.value;
    const textGenerate = value.toLowerCase().replace(/\s+/g, '');

    setConditionProcess((prevState) => ({
      ...prevState,
      search: (cards) => cards.filter((card) => {
        const nameGenerate = (card.firstName + card.lastName).toLowerCase().replace(/\s+/g, '');

        return nameGenerate.includes(textGenerate);
      })
    }));
    setSearchValue(value);
  },
  [setConditionProcess]);

  const handleSearchAction = useCallback((isSearch: boolean) => {
    return () => {
      setIsSearchAction(isSearch);

      if (!isSearch) {
        setSearchValue('');
        setConditionProcess((prevState) => ({
          ...prevState,
          search: (cards) => cards
        }));
      }
    };
  }, [setConditionProcess, setIsSearchAction]);

  return (
    <div className={CN(className, '__tool-search-container')}>
      {
        !isSearchAction
          ? <div
            className={'__tool-search-button'}
            onClick={handleSearchAction(true)}
          />
          : <div className={'__tool-search-wrapper'}>
            <Input.Search
              className='__tool-search-input'
              onChange={handleInputChange}
              placeholder={t('Search your cards...')}
              size='md'
              value={searchValue}
            />
            <MythButton
              className={'__tool-search-input-cancel'}
              onClick={handleSearchAction(false)}
            >
              {t('Cancel')}
            </MythButton>
          </div>
      }
    </div>

  );
};

export const ToolSearch = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flex: 1,

    '.__tool-search-button': {
      cursor: 'pointer',
      backgroundImage: 'url("/images/mythical/tool-search.png")',
      minWidth: 51,
      height: 42,
      backgroundSize: '51px 42px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left'
    },

    '.ant-input-affix-wrapper': {
      backgroundSize: '100% 100%',
      backgroundPosition: 'center center',
      backgroundImage: 'url(/images/mythical/search-area-img.png)',
      filter: 'drop-shadow(1.251px 1.251px 0px #000)'
    },

    '.ant-input-container.ant-input-container': {
      backgroundColor: token.colorTextDark1,
      flex: 1
    },

    '& .ant-input-container.ant-input-container.ant-input-container:hover:before': {
      borderColor: 'transparent'
    },

    '.ant-input-container.ant-input-container.ant-input-container:before': {
      display: 'none'
    },

    '.__tool-search-wrapper': {
      flex: 1,
      display: 'flex',
      justifyContent: 'space-between'
    },

    '.ant-input-container': {
      color: token.colorTextLight1
    },
    '.ant-input-wrapper': {
      maxHeight: 42
    },

    '.ant-input': {
      maxHeight: 42,
      '::placeholder': {
        color: token.colorTextLight1,
        opacity: 1,
        fontWeight: 400,
        fontSize: 14,
        lineHeight: '16px'
      }
    },

    '.ant-input-wrapper .ant-input-affix-wrapper .ant-input-prefix': {
      color: extendToken.mythColorGray1
    },
    '.ant-input-wrapper .ant-input-suffix .__input-action': {
      color: extendToken.mythColorGray1
    },

    '.__tool-search-input .ant-input-suffix': {
      height: 42,
      width: 42
    },

    '.__tool-search-input-cancel': {
      minWidth: 68,
      height: 42,
      backgroundImage: 'url(/images/mythical/tool-search-cancel-button-background.png)',
      filter: 'drop-shadow(1.251px 1.251px 0px #000)',

      '.__button-content': {
        color: token.colorTextLight1,
        fontStyle: 'normal',
        fontSize: 16,
        lineHeight: '18px'
      }
    }

  };
});
