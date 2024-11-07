// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardDetailModal, CardItem } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { ToolArea } from './ToolArea';

type Props = ThemeProps;

const cardDetailModalId = 'cardDetailModalId';
const bookaSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  const { setContainerClass } = useContext(HomeContext);
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [selectedCard, setSelectedCard] = useState<NFLRivalCard | undefined>(undefined);
  const [cardItems, setCardItems] = useState<NFLRivalCard[]>([]);

  useEffect(() => {
    const unsubscribe = bookaSDK.subscribeNFLRivalCardList().subscribe((cardList) => {
      setCardItems(cardList);
    });

    return () => {
      unsubscribe.unsubscribe();
    };
  }, []);

  const onClickCard = useCallback((cardSrc: NFLRivalCard) => {
    return () => {
      setSelectedCard(cardSrc);
      activeModal(cardDetailModalId);
    };
  }, [activeModal]);

  const onCloseDetailModal = useCallback(() => {
    inactiveModal(cardDetailModalId);
    setSelectedCard(undefined);
  }, [inactiveModal]);

  useEffect(() => {
    setContainerClass('cards-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <>
      <div className={className}>
        <ToolArea />

        <div className='card-list-container'>
          {
            cardItems.map((item) => (
              <CardItem
                card={item}
                className={'card-item'}
                key={item.defId}
                onClick={onClickCard(item)}
              />
            ))
          }
          <div className={'card-item'}></div>
        </div>
      </div>

      {
        !!selectedCard && (
          <CardDetailModal
            card={selectedCard}
            id={cardDetailModalId}
            onCancel={onCloseDetailModal}
          />
        )
      }
    </>
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
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: 16,
      paddingLeft: 16
    },

    '.card-item': {
      flex: '1 1 45%'
    }
  };
});

export default Cards;
