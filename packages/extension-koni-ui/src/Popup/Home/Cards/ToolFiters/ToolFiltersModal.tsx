// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { FilterItems, FilterOption } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolFiters/index';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Checkbox, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  filterItems: Record<FilterOption, FilterItems[]>;
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>;
  setNumberOptionsSelected: Dispatch<SetStateAction<number>>
}

interface FilterOptionsSelected {
  [FilterOption.CATEGORY_OPTION]: string[],
  [FilterOption.POSITION_OPTION]: string[]
}

const modalId = 'filter-modal-id';

const Component = ({ className, filterItems, setConditionProcess, setNumberOptionsSelected }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const [itemsSelected, setItemsSelected] = useState<FilterOptionsSelected>({
    category: [],
    position: []
  });
  const onCancel = useCallback(() => {
    inactiveModal('filter-modal-id');
  }, [inactiveModal]);

  const onReset = useCallback(() => {
    setItemsSelected({
      category: [],
      position: []
    });
    setNumberOptionsSelected(0);
    setConditionProcess((prev) => ({
      ...prev,
      filter: (prev) => prev
    }));
    onCancel();
  }, [onCancel, setConditionProcess, setNumberOptionsSelected]);

  const handleSelectItem = useCallback((typeOption: FilterOption, option: string) => {
    return () => {
      setItemsSelected((prev) => {
        const indexExistedOption = prev[typeOption].indexOf(option);

        if (indexExistedOption > -1) {
          prev[typeOption].splice(indexExistedOption, 1);
        } else {
          prev[typeOption].push(option);
        }

        return ({ ...prev });
      });
    };
  }, []);

  const onApply = useCallback(() => {
    const numberOptionsSelected = Object.values(itemsSelected).flat().length;

    setNumberOptionsSelected(numberOptionsSelected);

    const filterfunction = (prev: NFLRivalCard[]) => {
      if (numberOptionsSelected === 0) {
        return [...prev];
      } else {
        return [...prev].filter((card) => {
          let isCardPositionPasses = itemsSelected[FilterOption.POSITION_OPTION].length === 0;
          let isCardCategoryPasses = itemsSelected[FilterOption.CATEGORY_OPTION].length === 0;

          console.log(isCardPositionPasses, isCardPositionPasses, card.position);

          if (!isCardPositionPasses) {
            isCardPositionPasses = itemsSelected[FilterOption.POSITION_OPTION].includes(card.position);
          }

          if (!isCardCategoryPasses) {
            isCardCategoryPasses = true;
          }

          return isCardPositionPasses && isCardCategoryPasses;
        });
      }
    };

    setConditionProcess((prev) => ({
      ...prev,
      filter: filterfunction
    }));

    onCancel();
  }, [itemsSelected, onCancel, setConditionProcess, setNumberOptionsSelected]);

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
                  options.map(({ label, subLabel, type }, index) => (
                    <Checkbox
                      checked={itemsSelected[optionLabel as FilterOption].includes(type)}
                      className='__filter-item'
                      key={index}
                      onClick={handleSelectItem(optionLabel as FilterOption, type)}
                    >
                      <div className='__filter-item-label'>
                        {t(label)}
                        {!!subLabel && <div className={'__filter-item-sub-label'}>
                          {t(subLabel)}
                        </div>}
                      </div>
                    </Checkbox>
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

    '.__filter-item': {
      display: 'flex',
      alignItems: 'center'
    },
    '.__filter-list': {
      paddingTop: 20,
      gap: 12,
      flexDirection: 'column',
      display: 'flex'
    },

    '.ant-checkbox-checked.ant-checkbox-checked': {
      backgroundImage: 'url("/images/mythical/check-selected.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      filter: 'drop-shadow(0.97px 0.97px 0px #000)'
    },

    '.ant-checkbox-wrapper .ant-checkbox .ant-checkbox-checked .ant-checkbox-inner.ant-checkbox-inner': {
      backgroundColor: 'transparent'
    },

    '.ant-checkbox-wrapper.ant-checkbox-wrapper .ant-checkbox-checked:after': {
      borderColor: 'transparent'
    },

    '.ant-checkbox-inner': {
      visibility: 'hidden',
    },

    '.ant-checkbox': {
      backgroundImage: 'url("/images/mythical/check-unselected.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
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
      paddingTop: token.paddingSM + 2,
      paddingBottom: token.paddingSM + 2
    },

    '& .ant-sw-header-container-center .ant-sw-header-center-part ': {
      '.ant-sw-sub-header-title': {
        justifyContent: 'flex-start'
      }
    },

    '.ant-sw-header-left-part .ant-btn': {
      backgroundImage: 'url("/images/mythical/back-button.png")',
      backgroundSize: '30px 32px',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      span: {
        opacity: 0
      }
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
      gap: token.sizeSM,
      margin: `0 ${token.padding}px`
    },

    '.__option-group-content': {
      display: 'flex',
      flexDirection: 'column',
      gap: token.sizeSM,
      flexWrap: 'wrap',
      maxHeight: 200
    },

    '.__filter-item-label': {
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      lineHeight: '16px',
      fontStyle: 'normal',
      display: 'flex',
      fontWeight: 500,
      width: '100%'
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      flex: 1
    },

    '.__option-group-label': {
      color: '#BEBEBE',
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '14px',
      lineHeight: '16px',
      fontWeight: 400,
      marginBottom: '4px'
    },

    '.ant-checkbox-wrapper': {
      marginInlineStart: 0
    },

    '.__footer-container': {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: token.paddingXL + 2
    },

    '.__action-button': {
      minWidth: 167.5,
      height: 52,

      '.__button-content': {
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        filter: 'drop-shadow(2px 3px 0px #000)'
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
