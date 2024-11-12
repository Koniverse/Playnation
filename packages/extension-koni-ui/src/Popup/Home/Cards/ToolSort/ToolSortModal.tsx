// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext, Radio, SwModal} from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface SortItem {
  label: string;
  subLabel?: string;
  onClick: VoidFunction;
}

interface Props extends ThemeProps {
  sortItems: SortItem[];
  sortedType: number;
}

const modalId = 'sort-modal';

const Component = ({ className, sortItems, sortedType }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const [itemSelected, setItemSelected] = useState(0);
  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const handleSelectItem = useCallback((indexItem: number, cb: VoidFunction) => {
    return () => {
      inactiveModal(modalId);
      setItemSelected(indexItem);
      cb();
    };
  }, [inactiveModal]);

  useEffect(() => {
    setItemSelected(sortedType);
  }, [sortedType]);

  return (
    <SwModal
      className={className}
      id={modalId}
      onCancel={onCancel}
      title= {t('Sort by')}
    >
      <div className='__sort-list'>
        {
          sortItems.map(({ label, onClick, subLabel }, index) => (
            <Radio
              checked={itemSelected === index}
              className='__sort-item'
              key={index}
              onClick={handleSelectItem(index, onClick)}
            >
              <div className='__sort-item-label'>
                {label }
                {!!subLabel && <div className={'__sort-item-sub-label'}>
                  {subLabel}
                </div>}
              </div>
            </Radio>
          ))
        }
      </div>
    </SwModal>
  );
};

export const ToolSortModal = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-modal-content': {
      backgroundImage: 'url("/images/mythical/sort-background-modal.png")',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    },

    '.ant-sw-modal-title': {
      paddingRight: 16,
      maxHeight: 32,
      display: 'flex',
      alignItems: 'center'
    },

    '.ant-btn.ant-btn': {
      width: 30,
      height: 32,
      minWidth: 'auto'
    },

    '.ant-sw-header-container': {
      flex: 1
    },

    '.ant-sw-header-container-center .ant-sw-header-center-part .ant-sw-sub-header-title.ant-sw-sub-header-title': {
      minHeight: 32,
      display: 'flex',
      alignItems: 'center'
    },

    '.ant-sw-sub-header-title .ant-sw-sub-header-title-content.ant-sw-sub-header-title-content': {
      fontSize: 16,
      lineHeight: '20px'
    },

    '.ant-sw-header-container .ant-sw-header-right-part.ant-sw-header-right-part-no-content': {
      minHeight: 32
    },

    '.ant-sw-header-center-part': {
      maxHeight: 32
    },

    '.ant-sw-modal-header.ant-sw-modal-header.ant-sw-modal-header': {
      paddingTop: 32,
      paddingBottom: 12
    },


    '.ant-radio-inner.ant-radio-inner': {
      backgroundSize: '100% 100%',
      backgroundPosition: 'center center',
      backgroundImage: 'url(/images/mythical/radio-not-selected.png)',
      backgroundColor: 'transparent',
      height: 24,
      width: 24,
      border: 'none'
    },

    '.ant-radio-wrapper span.ant-radio+*': {
      paddingInlineStart: 12,
      paddingInlineEnd: 12
    },

    '.ant-radio-checked .ant-radio-inner.ant-radio-inner': {
      backgroundSize: '100% 100%',
      backgroundPosition: 'center center',
      backgroundImage: 'url(/images/mythical/radio.png)',
      backgroundColor: 'transparent',
      height: 24,
      width: 24,
      border: 'none'
    },

    '.ant-radio-checked .ant-radio-inner': {
      borderColor: token.colorTextLight1
    },

    '.ant-radio-wrapper .ant-radio-checked .ant-radio-inner::after': {
      visibility: 'hidden'
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

    '.ant-sw-header-container-center': {
      flexDirection: 'row-reverse'
    },

    '.ant-sw-modal-header.ant-sw-modal-header': {
      paddingBottom: 12,
      paddingTop: 12
    },

    '& .ant-sw-header-container-center .ant-sw-header-center-part ': {
      '.ant-sw-sub-header-title': {
        justifyContent: 'flex-start'
      },
      marginLeft: token.paddingXL
    },

    '.ant-sw-header-left-part .ant-btn': {
      backgroundImage: 'url("/images/mythical/close-button.png")',
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
      marginBottom: token.paddingXL,

      '&:before': {
        content: '""',
        display: 'block',
        paddingTop: '110%'
      }
    },

    '.__stat-item-list': {
      overflow: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: 8,
      paddingLeft: 8,
      rowGap: 8,
      columnGap: 12
    },

    '.__sort-list': {
      marginLeft: '32px',
      display: 'flex',
      gap: token.sizeSM,
      flexDirection: 'column',

      '.__sort-item-label': {
        color: token.colorWhite,
        fontFamily: extendToken.fontBarlowCondensed,
        fontSize: '14px',
        lineHeight: '16px',
        fontStyle: 'normal',
        display: 'flex',
        gap: 4,
        fontWeight: 500,

        '.__sort-item-sub-label': {
          color: '#7e7e7e'
        }
      }
    },

    '.ant-checkbox-wrapper': {
      marginInlineStart: 8,
      alignItems: 'center'
    },

    '.__stat-item': {
      flex: '1 1 35%'
    }
  };
});
