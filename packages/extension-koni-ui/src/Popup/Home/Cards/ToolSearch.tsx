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
          : <>
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
          </>
      }
    </div>

  );
};

export const ToolSearch = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',

    '.__tool-search-button': {
      cursor: 'pointer',
      backgroundImage: 'url("/images/mythical/tool-search.png")',
      minWidth: 68,
      height: 42,
      backgroundSize: '43px 36px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left'
    },

    '.__tool-search-input-cancel': {
      minWidth: 68,
      height: 42,

      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/tool-search-cancel-button-background.png)',
        backgroundColor: '#2c2b2b',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    }

  };
});
