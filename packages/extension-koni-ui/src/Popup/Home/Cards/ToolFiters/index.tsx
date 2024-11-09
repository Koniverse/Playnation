// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FilterOptions } from '@subwallet/extension-koni-ui/constants';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { ToolFiltersModal } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters/ToolFiltersModal';
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

const modalId = 'filter-modal-id';

const Component = ({ className, setConditionProcess }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const [numberOptionsSelected, setNumberOptionsSelected] = useState<number>(0);

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
        setConditionProcess={setConditionProcess}
        setNumberOptionsSelected={setNumberOptionsSelected}
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
    height: 36,
    backgroundSize: '100% 36px',
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
