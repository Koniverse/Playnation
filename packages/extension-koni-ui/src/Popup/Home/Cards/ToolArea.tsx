// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ToolFilters } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFilters';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

import { ToolSearch } from './ToolSearch';
import { ToolSort } from './ToolSort';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <ToolSearch className={'__tool-search'} />
      <ToolSort className={'__tool-sort'} />
      <ToolFilters />
    </div>
  );
};

export const ToolArea = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    maxWidth: 384,
    paddingLeft: 20,
    paddingRight: 20,
    display: 'flex',

    '.__tool-search': {
      marginRight: 13
    },

    '.__tool-sort': {
      flex: 1,
      marginRight: 8
    }
  };
});
