// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConditionProcessState } from '@subwallet/extension-koni-ui/Popup/Home/Cards';
import { ToolSortModal } from '@subwallet/extension-koni-ui/Popup/Home/Cards/ToolSort/ToolSortModal';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { Dispatch, SetStateAction, useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  setConditionProcess: Dispatch<SetStateAction<ConditionProcessState>>,
};

const modalId = 'sort-modal';

const Component = ({ className, setConditionProcess }: Props): React.ReactElement => {
  const { activeModal } = useContext(ModalContext);
  const [sortedType, setSortedType] = useState<number>(0);

  const onClick = useCallback(() => {
    activeModal(modalId);
  }, [activeModal]);

  const onCancelSort = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (sortedType > 0) {
      event.stopPropagation();
      setConditionProcess((pre) => {
        return {
          ...pre,
          sort: (prev) => prev
        };
      });
      setSortedType(0);
    }
  }, [setConditionProcess, sortedType]);

  const sortItems = useMemo(() => [
    {
      label: 'None',
      subLabel: '',
      onClick: () => {
        setConditionProcess((pre) => {
          return {
            ...pre,
            sort: (prev) => prev
          };
        });
        setSortedType(0);
      }
    },
    {
      label: 'Last name',
      subLabel: 'descending',
      onClick: () => {
        setConditionProcess((pre) => {
          return {
            ...pre,
            sort: (prev) => prev.sort((a, b) => a.lastName.localeCompare(b.lastName)).reverse()
          };
        });
        setSortedType(1);
      }
    },
    {
      label: 'Last name',
      subLabel: 'ascending',
      onClick: () => {
        setConditionProcess((pre) => {
          return {
            ...pre,
            sort: (prev) => prev.sort((a, b) => a.lastName.localeCompare(b.lastName))
          };
        });
        setSortedType(2);
      }
    },
    {
      label: 'First name',
      subLabel: 'descending',
      onClick: () => {
        setConditionProcess((pre) => {
          return {
            ...pre,
            sort: (prev) => prev.sort((a, b) => a.firstName.localeCompare(b.firstName)).reverse()
          };
        });
        setSortedType(3);
      }
    },
    {
      label: 'First name',
      subLabel: 'ascending',
      onClick: () => {
        setConditionProcess((pre) => {
          return {
            ...pre,
            sort: (prev) => prev.sort((a, b) => a.firstName.localeCompare(b.firstName))
          };
        });
        setSortedType(4);
      }
    }
  ], [setConditionProcess]);

  return (
    <div className={className}>
      <div
        className={CN('__sort-button', {
          '-active': sortedType > 0
        })}
        onClick={onClick}
        style={{
          backgroundImage: sortedType > 0 ? 'url("/images/mythical/tool-sort-active-background.png")' : 'url("/images/mythical/tool-sort-background.png")'
        }}
      >
        <div className='__sort-button-label'>
          {sortedType > 0
            ? (
              <>
                {sortItems[sortedType].label}<span>&nbsp;{sortItems[sortedType].subLabel}</span>
              </>
            )
            : 'Sort by'}
        </div>
        <svg
          className='__sort-button-icon'
          fill='none'
          height='20'
          onClick={onCancelSort}
          viewBox='0 0 20 20'
          width='21'
          xmlns='http://www.w3.org/2000/svg'
        >
          {
            sortedType > 0
              ? (
                <path
                  d='M9.99898 8.82208L14.1238 4.69727L15.3023 5.87577L11.1775 10.0006L15.3023 14.1253L14.1238 15.3038L9.99898 11.1791L5.8742 15.3038L4.69568 14.1253L8.82048 10.0006L4.69568 5.87577L5.8742 4.69727L9.99898 8.82208Z'
                  fill='#BEBEBE'
                />
              )
              : (
                <path
                  d='M10.5005 10.9762L14.6254 6.85144L15.8039 8.02995L10.5005 13.3333L5.19727 8.02995L6.37577 6.85144L10.5005 10.9762Z'
                  fill='#BEBEBE'
                />
              )
          }
        </svg>
      </div>
      <ToolSortModal
        sortItems={sortItems}
        sortedType={sortedType}
      />
    </div>
  );
};

export const ToolSort = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    justifyContent: 'flex-end',
    overflow: 'hidden',

    '.__sort-button': {
      cursor: 'pointer',
      paddingLeft: token.paddingSM + 3,
      paddingRight: token.paddingSM,
      minWidth: 98,
      height: 36,
      backgroundSize: '100% 36px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'top left',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      overflow: 'hidden',

      '&.-active': {
        flex: 1
      }
    },

    '.__sort-button-label': {
      marginTop: -2,
      textTransform: 'uppercase',
      fontSize: token.fontSizeLG,
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: -0.16,
      color: '#fff',
      marginRight: 2,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      'white-space': 'nowrap',
      fontFamily: extendToken.fontDruk,

      span: {
        color: extendToken.mythColorGray1
      }
    }
  };
});
