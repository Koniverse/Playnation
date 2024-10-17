// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useContext, useEffect, useMemo } from 'react';
import styled from 'styled-components';

import { ToolArea } from './ToolArea';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { setContainerClass } = useContext(HomeContext);

  const cardItems = useMemo(() => {
    return [
      '1dhenry22ti10',
      '1dholmes30gi17',
      '1dhopkins7bw10',
      '1dhunter99vi19',
      '1djamesjr3cg11',
      '1dlongjr51do7',
      '1dmetcalf14sh15',
      '1draftpick8_5',
      '1draftpick10_5',
      '1jjefferso18vi6',
      '1jwilliams73bn19',
      '1lsneed38cf19',
      '1msanders26ea18',
      '1pmahomes15cf13',
      '1tedmunds49br15',
      '1twatt90sl13',
      '2averatuc75je21',
      '2gs23player2week1'
    ];
  }, []);

  useEffect(() => {
    setContainerClass('cards-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div className={className}>
      <ToolArea />

      <div className='card-list-container'>
        {
          cardItems.map((item) => (
            <CardItem
              className={'card-item'}
              imageSrc={item}
              key={item}
            />
          ))
        }
        <div className={'card-item'}></div>
      </div>
    </div>
  );
};

const Cards = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000',

    '.card-list-container': {
      overflow: 'auto',
      maxWidth: 384,
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: 16,
      paddingLeft: 16,
    },

    '.card-item': {
      flex: '1 1 45%'
    }
  };
});

export default Cards;
