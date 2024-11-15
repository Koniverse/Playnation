// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { FilterOptionsSelected, ToolFiltersModal } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters/ToolFiltersModal';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { Dispatch, SetStateAction, useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>;
};

export interface FilterItems {
  label: string;
  subLabel?: string;
  type: string;
}

export enum FilterOption {
  CATEGORY_OPTION = 'category',
  POSITION_OPTION = 'position'
}

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

const modalId = 'filter-modal-id';

const Component = ({ className, setConditionProcess }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const [numberOptionsSelected, setNumberOptionsSelected] = useState<number>(0);
  const [tmpItemsSelected, setTmpItemsSelected] = useState<FilterOptionsSelected>({
    category: [],
    position: []
  });

  const [itemsSelected, setItemsSelected] = useState<FilterOptionsSelected>({
    category: [],
    position: []
  });

  const handleConfirmSelection = useCallback(() => {
    setItemsSelected((prev) => ({
      ...prev,
      category: [...tmpItemsSelected.category],
      position: [...tmpItemsSelected.position]
    }));
  }, [tmpItemsSelected, setItemsSelected]);

  const handleCancel = useCallback(() => {
    setTmpItemsSelected((prev) => ({
      ...prev,
      category: [...itemsSelected.category],
      position: [...itemsSelected.position]
    }));
  }, [itemsSelected.category, itemsSelected.position]);

  const handleReset = useCallback(() => {
    setItemsSelected({
      category: [],
      position: [],
    });
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
        onConfirm={handleConfirmSelection}
        handleReset={handleReset}
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
