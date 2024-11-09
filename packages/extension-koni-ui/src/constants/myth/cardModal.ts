// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterItems, FilterOption } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters';

const CategoryOptions: FilterItems[] = [
  {
    type: 'base_set',
    label: 'Base Set'
  },
  {
    type: 'not_tradable',
    label: 'Not Tradable'

  },
  {
    type: 'blueprints',
    label: 'Blueprints'
  },
  {
    type: 'limited_edition',
    label: 'Limited Edition'
  }
];

const PositionOptions: FilterItems[] = [
  {
    type: 'QB',
    label: 'Quarterback (QB)'
  },
  {
    type: 'SS',
    label: 'Strong Safety (SS)'
  },
  {
    type: 'WR',
    label: 'Wide receiver (WR)'
  },
  {
    type: 'TE',
    label: 'Tight end (TE)'
  },
  {
    type: 'CB',
    label: 'Corner Back (CB)'
  },
  {
    type: 'OL',
    label: 'Offensive Linemen (OL)'
  },
  {
    type: 'RB',
    label: 'Running BAck (RB)'
  },
  {
    type: 'FS',
    label: 'Free Safety (FS)'
  },
  {
    type: 'K',
    label: 'Kicker (K)'
  }
];

export const FilterOptions: Record<FilterOption, FilterItems[]> = {
  [FilterOption.CATEGORY_OPTION]: CategoryOptions,
  [FilterOption.POSITION_OPTION]: PositionOptions
};
