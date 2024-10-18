// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardStatItemType, StatItem } from '@subwallet/extension-koni-ui/components/Mythical/Modal/CardDetailModal/StatItem';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string,
  cardSrc?: string;
  onCancel?: () => void,
}

function Component ({ cardSrc, className = '', id, onCancel }: Props): React.ReactElement<Props> {
  const statItems: CardStatItemType[] = useMemo(() => {
    return [
      {
        name: 'Power',
        abb: 'POW',
        value: 75
      },
      {
        name: 'Quickness',
        abb: 'QUI',
        value: 34
      },
      {
        name: 'Endurance',
        abb: 'END',
        value: 82
      },
      {
        name: 'Acceleration',
        abb: 'ACC',
        value: 45
      },
      {
        name: 'Strength',
        abb: 'STR',
        value: 15
      },
      {
        name: 'Carry',
        abb: 'CAR',
        value: 67
      },
      {
        name: 'Presence',
        abb: 'Pow',
        value: 12
      },
      {
        name: 'Jump',
        abb: 'JMP',
        value: 65
      }
    ] as CardStatItemType[];
  }, []);

  return (
    <SwModal
      className={CN(className, '-full-size')}
      id={id}
      onCancel={onCancel}
    >
      <div
        className='__card-image'
        style={{
          backgroundImage: cardSrc ? `url("/images/mythical/cards/${cardSrc}.png")` : undefined
        }}
      ></div>

      <div className='__stat-item-list'>
        {
          statItems.map((item) => (
            <StatItem
              abb={item.abb}
              className={'__stat-item'}
              key={item.abb}
              name={item.name}
              value={item.value}
            />
          ))
        }
      </div>
    </SwModal>
  );
}

export const CardDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content.ant-sw-modal-content': {
      paddingTop: 0
    },

    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0
    },

    '.ant-sw-modal-header.ant-sw-modal-header': {
      paddingTop: 14,
      paddingBottom: 14
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

    '.__card-image': {
      backgroundSize: '135% auto',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 12%',
      cursor: 'pointer',
      maxWidth: 300,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: 32,

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

    '.__stat-item': {
      flex: '1 1 35%'
    }
  });
});
