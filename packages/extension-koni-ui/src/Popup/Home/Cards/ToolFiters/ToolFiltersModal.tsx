// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { MaxLevelOptionId, MaxPowerOptionId } from '@subwallet/extension-koni-ui/constants';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { FilterItems, FilterOption } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters/index';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Checkbox, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import _ from 'lodash';
import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  filterItems: Record<FilterOption, FilterItems[]>;
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>;
  setNumberOptionsSelected: Dispatch<SetStateAction<number>>;
  tmpItemsSelected: FilterOptionsSelected;
  setTmpItemsSelected: Dispatch<SetStateAction<FilterOptionsSelected>>;
  onConfirm: () => void;
  handleCancel: () => void;
  handleReset: () => void;
}

export interface FilterOptionsSelected {
  [FilterOption.POSITION_OPTION]: string[],
  [FilterOption.PROGRAM_OPTION]: string[],
  [FilterOption.RARITY_OPTION]: string[],
  [FilterOption.TEAM_OPTION]: string[],
  [FilterOption.LEVEL_OPTION]: string[],
  [FilterOption.POWER_OPTION]: string[],
}

const DEFAULT_FILTER_OPTIONS_SELECTED: FilterOptionsSelected = {
  team: [],
  rarity: [],
  program: [],
  power: [],
  level: [],
  position: []
};

const modalId = 'filter-modal-id';

const Component = ({ className, filterItems, handleCancel, handleReset, onConfirm, setConditionProcess, setNumberOptionsSelected, setTmpItemsSelected, tmpItemsSelected }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const onCancel = useCallback(() => {
    handleCancel();
    inactiveModal('filter-modal-id');
  }, [handleCancel, inactiveModal]);

  const onReset = useCallback(() => {
    setTmpItemsSelected(_.cloneDeep(DEFAULT_FILTER_OPTIONS_SELECTED));
    setNumberOptionsSelected(0);
    setConditionProcess((prev) => ({
      ...prev,
      filter: (prev) => prev
    }));
    handleReset();
    inactiveModal('filter-modal-id');
  }, [handleReset, inactiveModal, setConditionProcess, setNumberOptionsSelected, setTmpItemsSelected]);

  const handleSelectItem = useCallback((typeOption: FilterOption, option: string) => {
    return () => {
      setTmpItemsSelected((prev) => {
        const indexExistedOption = prev[typeOption].indexOf(option);

        if (indexExistedOption > -1) {
          prev[typeOption].splice(indexExistedOption, 1);
        } else {
          prev[typeOption].push(option);
        }

        return ({ ...prev });
      });
    };
  }, [setTmpItemsSelected]);

  const onApply = useCallback(() => {
    const numberOptionsSelected = Object.values(tmpItemsSelected).flat().length;

    setNumberOptionsSelected(numberOptionsSelected);

    const filterFunction = (prev: NFLRivalCard[]) => {
      if (numberOptionsSelected === 0) {
        return [...prev];
      } else {
        return [...prev].filter((card) => {
          const isCardPositionPassed = tmpItemsSelected[FilterOption.POSITION_OPTION].length === 0 || tmpItemsSelected[FilterOption.POSITION_OPTION].includes(card.position);
          const isCardProgramPassed = tmpItemsSelected[FilterOption.PROGRAM_OPTION].length === 0 || tmpItemsSelected[FilterOption.PROGRAM_OPTION].includes(card.program);
          const isCardRarityPassed = tmpItemsSelected[FilterOption.RARITY_OPTION].length === 0 || (tmpItemsSelected[FilterOption.RARITY_OPTION].includes(card.rarity) && card.program !== 'default');
          const isCardTeamPassed = tmpItemsSelected[FilterOption.TEAM_OPTION].length === 0 || tmpItemsSelected[FilterOption.TEAM_OPTION].includes(card.team);

          let isCardPowerPassed = tmpItemsSelected[FilterOption.POWER_OPTION].length === 0;
          let isCardLevelPassed = tmpItemsSelected[FilterOption.LEVEL_OPTION].length === 0;

          if (!isCardPowerPassed) {
            const idx = Math.min(Math.floor((card.power - 50 >= 0 ? card.power - 50 : 0) / 10), MaxPowerOptionId);

            isCardPowerPassed = tmpItemsSelected[FilterOption.POWER_OPTION].includes(idx.toString());
          }

          if (!isCardLevelPassed) {
            const idx = Math.min(Math.floor(card.level / 5), MaxLevelOptionId);

            isCardLevelPassed = tmpItemsSelected[FilterOption.LEVEL_OPTION].some((level) => idx >= Number.parseInt(level));
          }

          return isCardPositionPassed && isCardProgramPassed && isCardRarityPassed && isCardTeamPassed && isCardPowerPassed && isCardLevelPassed;
        });
      }
    };

    setConditionProcess((prev) => ({
      ...prev,
      filter: filterFunction
    }));

    onConfirm();

    inactiveModal('filter-modal-id');
  }, [inactiveModal, onConfirm, setConditionProcess, setNumberOptionsSelected, tmpItemsSelected]);

  const footerContent = useMemo(() => {
    return (
      <div className={'__footer-container'}>
        <MythButton
          className={CN('__action-button', '__footer-button-cancel')}
          onClick={onReset}
        >
          {t('Reset')}
        </MythButton>
        <MythButton
          className={CN('__action-button', '__footer-button-apply')}
          onClick={onApply}
        >
          {t('Apply')}
        </MythButton>
      </div>
    );
  }, [onApply, onReset, t]);

  const checkboxContent = useCallback((options: FilterItems, optionLabel: FilterOption, index: number) => {
    const { id, label, subLabel } = options;

    return (
      <Checkbox
        checked={tmpItemsSelected[optionLabel].includes(id)}
        className='__filter-item'
        key={index}
        onClick={handleSelectItem(optionLabel, id)}
      >
        <div className='__filter-item-label'>
          {t(label)}
          {!!subLabel && <div className={'__filter-item-sub-label'}>
            {t(subLabel)}
          </div>}
        </div>
      </Checkbox>
    );
  }, [handleSelectItem, t, tmpItemsSelected]);

  return (
    <SwModal
      className={CN(className, '-full-size')}
      footer={footerContent}
      id={modalId}
      onCancel={onCancel}
      title= {t('Filters')}
    >
      <div className='__filter-list'>
        {
          Object.entries(filterItems).map(([optionLabel, options]) => (
            <div
              className={CN('__option-group', optionLabel)}
              key={optionLabel}
            >
              <div className={CN('__option-group-label')}>{t(optionLabel)}</div>
              <div className={CN('__option-group-content', optionLabel)}>
                {
                  options.map(({ id, label, subLabel }, index) => (
                    index % 2 === 0
                      ? (
                        <div
                          className={CN('__option-group-row')}
                          key={index}
                        >
                          {checkboxContent({ id, label, subLabel }, optionLabel as FilterOption, index)}
                          {!!options[index + 1] && checkboxContent(options[index + 1], optionLabel as FilterOption, index + 1)}
                        </div>
                      )
                      : null
                  ))
                }
              </div>

            </div>
          ))
        }
      </div>
    </SwModal>
  );
};

export const ToolFiltersModal = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-modal-content': {
      backgroundImage: 'url("/images/mythical/filter-background-modal.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper.ant-checkbox-wrapper .ant-checkbox-checked.ant-checkbox-checked:after': {
      borderColor: 'transparent'
    },

    '.__filter-item': {
      display: 'flex',
      alignItems: 'center',
      flex: '1 1 calc(50% - 16px)'
    },
    '.__filter-list': {
      paddingTop: token.paddingMD,
      gap: token.size,
      flexDirection: 'column',
      display: 'flex'
    },

    '.ant-checkbox-checked.ant-checkbox-checked': {
      backgroundImage: 'url("/images/mythical/check-selected.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 24px'
      // filter: 'drop-shadow(0.97px 0.97px 0px #000)'
    },

    '.ant-checkbox-wrapper .ant-checkbox .ant-checkbox-checked .ant-checkbox-inner.ant-checkbox-inner': {
      backgroundColor: 'transparent'
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper .ant-checkbox-checked:after': {
      borderColor: 'transparent'
    },

    '.ant-checkbox-inner': {
      visibility: 'hidden',
      width: 24,
      height: 24
    },

    '.ant-checkbox': {
      backgroundImage: 'url("/images/mythical/check-unselected.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 24px'
    },

    '& .ant-sw-modal-content.ant-sw-modal-content': {
      borderRadius: 0
    },

    '.ant-sw-modal-content.ant-sw-modal-content': {
      paddingTop: 0
    },

    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0
    },

    '.ant-sw-modal-header.ant-sw-modal-header': {
      padding: `${token.padding + 2}px ${token.paddingMD}px`
    },

    '& .ant-sw-header-container-center .ant-sw-header-center-part ': {
      '.ant-sw-sub-header-title': {
        justifyContent: 'flex-start',
        display: 'flex',
        alignItems: 'center'
      }
    },

    '.ant-sw-header-center-part, .ant-sw-sub-header-title': {
      maxHeight: 32
    },

    '.ant-sw-header-container-center .ant-sw-header-center-part': {
      marginLeft: 46
    },

    '.ant-sw-header-left-part .ant-btn': {
      backgroundImage: 'url("/images/mythical/back-button.png")',
      backgroundSize: '30px 32px',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      maxHeight: 32,
      minWidth: 30,
      maxWidth: 30,
      span: {
        opacity: 0
      }
    },

    '.ant-sw-header-container .ant-sw-header-left-part': {
      marginLeft: 0
    },

    '.ant-sw-header-container': {
      minHeight: 32
    },
    '.ant-sw-header-right-part': {
      display: 'none'
    },

    '.ant-sw-sub-header-title .ant-sw-sub-header-title-content': {
      color: token.colorWhite,
      fontFamily: extendToken.fontPermanentMarker,
      fontSize: token.fontSizeLG,
      lineHeight: '40px',
      fontStyle: 'normal',
      fontWeight: 400,
      textTransform: 'uppercase'
    },

    '.__card-image': {
      backgroundSize: '135% auto',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 12%',
      cursor: 'pointer',
      maxWidth: 300,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: token.marginXL,

      '&:before': {
        content: '""',
        display: 'block',
        paddingTop: '110%'
      }
    },

    '.__option-group': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.size,
      margin: `0 ${token.margin}px`
    },

    '.__option-group-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM,
      flexWrap: 'wrap'
    },

    '.__option-group-row': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%'
    },

    '.__filter-item-label': {
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      lineHeight: '16px',
      fontStyle: 'normal',
      display: 'flex',
      fontWeight: 500,
      width: '100%',
      letterSpacing: '0.28px'
    },

    '.ant-checkbox-wrapper-checked .__filter-item-label.__filter-item-label': {
      fontWeight: 700,
      lineHeight: '18px'
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end'
    },

    '.__option-group-label': {
      color: '#BEBEBE',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      lineHeight: '16px',
      fontWeight: 400,
      marginBottom: token.marginXXS
    },

    '.ant-checkbox-wrapper': {
      marginInlineStart: 0
    },

    '.__footer-container': {
      display: 'flex',
      gap: '8px',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      paddingBottom: token.paddingXL + 2
    },

    '.__action-button': {
      flex: 1,
      height: 52,
      // filter: 'drop-shadow(2px 3px 0px #000)',

      '.__button-content': {
        color: extendToken.mythColorDark,
        fontSize: 22,
        fontStyle: 'italic',
        lineHeight: '24px',
        letterSpacing: '-0.88px'
      },

      '.__button-background': {
        // filter: 'drop-shadow(2px 3px 0px #000)'
      },

      '.__button-background:before': {
        maskImage: 'url(/images/mythical/call-to-action-button.png)',
        maskSize: '100% 100%',
        maskPosition: 'top left'
      }
    },

    '.__footer-button-apply .__button-background:before': {
      backgroundColor: token.colorPrimary
    },

    '.__footer-button-cancel .__button-background:before': {
      backgroundColor: token.colorWhite
    }
  };
});
