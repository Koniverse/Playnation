// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LevelOptions, PositionOptions, PowerOptions, ProgramOptions, RarityOptions, TeamOptions } from '@subwallet/extension-koni-ui/constants/myth';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { FilterOptionsSelected, ToolFiltersModal } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters/ToolFiltersModal';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import _ from 'lodash';
import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>;
};

export interface FilterItems {
  label: string;
  subLabel?: string;
  id: string;
}

export enum FilterOption {
  POSITION_OPTION = 'position',
  TEAM_OPTION = 'team',
  PROGRAM_OPTION = 'program',
  RARITY_OPTION = 'rarity',
  POWER_OPTION = 'power',
  LEVEL_OPTION = 'level'
}

export const FilterOptions: Record<FilterOption, FilterItems[]> = {
  [FilterOption.POSITION_OPTION]: PositionOptions,
  [FilterOption.TEAM_OPTION]: TeamOptions,
  [FilterOption.PROGRAM_OPTION]: ProgramOptions,
  [FilterOption.RARITY_OPTION]: RarityOptions,
  [FilterOption.POWER_OPTION]: PowerOptions,
  [FilterOption.LEVEL_OPTION]: LevelOptions
};

const DEFAULT_FILTER_OPTIONS_SELECTED: FilterOptionsSelected = {
  team: [],
  rarity: [],
  program: [],
  power: [],
  level: [],
  position: []
};

const modalId = 'filter-modal-id';

const Component = ({ className, setConditionProcess }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const [numberOptionsSelected, setNumberOptionsSelected] = useState<number>(0);
  const [tmpItemsSelected, setTmpItemsSelected] = useState<FilterOptionsSelected>(_.cloneDeep(DEFAULT_FILTER_OPTIONS_SELECTED));

  const [itemsSelected, setItemsSelected] = useState<FilterOptionsSelected>(DEFAULT_FILTER_OPTIONS_SELECTED);

  const handleConfirmSelection = useCallback(() => {
    setItemsSelected((prev) => ({
      ...prev,
      position: [...tmpItemsSelected.position],
      rarity: [...tmpItemsSelected.rarity],
      level: [...tmpItemsSelected.level],
      power: [...tmpItemsSelected.power],
      program: [...tmpItemsSelected.program],
      team: [...tmpItemsSelected.team]
    }));
  }, [tmpItemsSelected, setItemsSelected]);

  const handleCancel = useCallback(() => {
    setTmpItemsSelected((prev) => ({
      ...prev,
      position: [...itemsSelected.position],
      rarity: [...itemsSelected.rarity],
      level: [...itemsSelected.level],
      power: [...itemsSelected.power],
      program: [...itemsSelected.program],
      team: [...itemsSelected.team]
    }));
  }, [itemsSelected]);

  const handleReset = useCallback(() => {
    setItemsSelected(DEFAULT_FILTER_OPTIONS_SELECTED);
  }, [setItemsSelected]);

  const onClick = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  return (
    <>
      <div
        className={className}
        onClick={onClick}
        style={{
          backgroundImage: numberOptionsSelected > 0 ? 'url("/images/mythical/tool-filter-active-background.png")' : 'url("/images/mythical/tool-filter-background.png")'
        }}
      >
        <div className={'__button-label'}>
          {t('Filters')}

          {
            numberOptionsSelected > 0 && (
              <span>&nbsp;({numberOptionsSelected})</span>
            )
          }
        </div>
      </div>

      <ToolFiltersModal
        filterItems={FilterOptions}
        handleCancel={handleCancel}
        handleReset={handleReset}
        onConfirm={handleConfirmSelection}
        setConditionProcess={setConditionProcess}
        setNumberOptionsSelected={setNumberOptionsSelected}
        setTmpItemsSelected={setTmpItemsSelected}
        tmpItemsSelected={tmpItemsSelected}
      />
    </>

  );
};

export const ToolFilters = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    cursor: 'pointer',
    minWidth: 86,
    paddingLeft: token.marginXXS,
    paddingRight: token.marginXXS,
    height: 42,
    backgroundSize: '100% 42px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',

    '.__button-label': {
      marginTop: -2,
      textTransform: 'uppercase',
      fontSize: token.fontSizeHeading5,
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: -0.16,
      color: '#fff',
      fontFamily: extendToken.fontDruk,

      span: {
        color: extendToken.mythColorGray1
      }
    }
  };
});
