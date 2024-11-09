// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, CardDetailModal, CardItem, MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ToolArea } from './ToolArea';

type Props = ThemeProps;
export type ConditionProcess = (prevState: NFLRivalCard[]) => NFLRivalCard[];
export interface ConditionProcessState {
  sort: ConditionProcess;
  search: ConditionProcess;
  filter: ConditionProcess;
}

const ConditionProcessDefault: ConditionProcessState = {
  sort: (prevState: NFLRivalCard[]) => prevState,
  search: (prevState: NFLRivalCard[]) => prevState,
  filter: (prevState: NFLRivalCard[]) => prevState
};

const cardDetailModalId = 'cardDetailModalId';
const bookaSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  const { setContainerClass } = useContext(HomeContext);
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [selectedCard, setSelectedCard] = useState<NFLRivalCard | undefined>(undefined);
  const [cardItems, setCardItems] = useState<NFLRivalCard[]>([]);
  const [conditionProcess, setConditionProcess] = useState<ConditionProcessState>(ConditionProcessDefault);
  const initCardItems = useRef<NFLRivalCard[]>([]);

  useEffect(() => {
    const unsubscribe = bookaSDK.subscribeNFLRivalCardList().subscribe((cardList) => {
      setCardItems(cardList);
      initCardItems.current = [...cardList];
    });

    return () => {
      unsubscribe.unsubscribe();
    };
  }, []);

  const handleProcessCardItems = useCallback((conditionProcess: ConditionProcessState) => {
    setCardItems(() => {
      let listCard: NFLRivalCard[] = initCardItems.current;

      Object.values(conditionProcess).forEach((func: ConditionProcess) => {
        listCard = func([...listCard]);
      });

      return listCard;
    });
  }, []);

  useEffect(() => {
    handleProcessCardItems(conditionProcess);
  }, [conditionProcess, handleProcessCardItems]);

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
        <MainScreenHeader
          className={'__main-screen-header'}
          title={t('Your cards')}
        />

        <CallToAction
          buttonLabel={t('Get more players')}
          className={'__call-to-action'}
          subtitle={t('Visit the NFL Rivals marketplace')}
          title={t('Want to get more cards?')}
        />

        <ToolArea
          listCard={cardItems}
          setConditionProcess={setConditionProcess}
        />

        <div className='__card-list-container'>
          {
            cardItems.map((item) => (
              <CardItem
                card={item}
                className={'__card-item'}
                key={item.defId}
                onClick={onClickCard(item)}
              />
            ))
          }
          <div className={'__card-item'}></div>
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
    backgroundImage: 'url("/images/mythical/your-card-background.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',

    '.__card-list-container': {
      overflow: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: token.padding,
      paddingLeft: token.padding
    },

    '.__call-to-action': {
      marginBottom: token.marginMD
    },

    '.__card-item': {
      flex: '1 1 45%'
    }
  };
});

export default Cards;
