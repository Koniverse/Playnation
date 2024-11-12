// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { Dispatch, SetStateAction, useState } from 'react';
import styled from 'styled-components';

import { ToolFilters } from './ToolFiters';
import { ToolSearch } from './ToolSearch';
import { ToolSort } from './ToolSort';

type Props = ThemeProps & {
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>,
  listCard: NFLRivalCard[]
};

const Component = ({ className, setConditionProcess }: Props): React.ReactElement => {
  const [isSearchAction, setIsSearchAction] = useState(false);

  return (
    <div className={className}>
      <ToolSearch
        className={'__tool-search'}
        isSearchAction={isSearchAction}
        setConditionProcess={setConditionProcess}
        setIsSearchAction={setIsSearchAction}
      />

      {!isSearchAction &&
        <>
          <ToolSort
            className={'__tool-sort'}
            setConditionProcess={setConditionProcess}
          />
          <ToolFilters
            setConditionProcess={setConditionProcess}
          />
        </>
      }
    </div>
  );
};

export const ToolArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    paddingLeft: 20,
    paddingRight: 20,
    display: 'flex',

    '.__tool-sort': {
      flex: 1,
      marginRight: 8
    }
  };
});
