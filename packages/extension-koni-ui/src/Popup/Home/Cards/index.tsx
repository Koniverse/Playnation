// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, CardDetailModal, CardItem, EmptyListContent, MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { sendEventGA } from '@subwallet/extension-koni-ui/utils/googleAnalytics';
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
const NFL_RIVALS_MARKET_LINK = 'https://mythical.market/game/nfl-rivals';

const Component = ({ className }: Props): React.ReactElement => {
  const { setContainerClass } = useContext(HomeContext);
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const [selectedCard, setSelectedCard] = useState<NFLRivalCard | undefined>(undefined);
  const [cardItems, setCardItems] = useState<NFLRivalCard[]>([]);
  const [conditionProcess, setConditionProcess] = useState<ConditionProcessState>(ConditionProcessDefault);
  const [isSearchAction, setIsSearchAction] = useState(false);
  const initCardItems = useRef<NFLRivalCard[]>([]);

  useEffect(() => {
    const unsubscribe = bookaSDK.subscribeNFLRivalCardList().subscribe((cardList) => {
      setCardItems(cardList);
      initCardItems.current = [...cardList];
    });

    bookaSDK.fetchNFLRivalCardList().catch(console.error);

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

  const handleOpenMarket = useCallback(() => {
    sendEventGA('mythical-marketplace-link-click');
    openInNewTab(NFL_RIVALS_MARKET_LINK)();
  }, []);

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
          onAction={handleOpenMarket}
          subtitle={t('Visit the NFL Rivals marketplace')}
          title={t('Want to get more cards?')}
        />

        <ToolArea
          isSearchAction={isSearchAction}
          listCard={cardItems}
          setConditionProcess={setConditionProcess}
          setIsSearchAction={setIsSearchAction}
        />

        {cardItems.length
          ? (
            <div className='__card-list-wrapper'>
              <div className='__card-list-container'>
                {
                  cardItems.map((item) => (
                    <CardItem
                      card={item}
                      className={'__card-item'}
                      key={`${item.defId}-${item.cardId}`}
                      onClick={onClickCard(item)}
                    />
                  ))
                }
              </div>
            </div>
          )
          : (
            <EmptyListContent
              className={'empty-list-content'}
              content={isSearchAction ? t('Change your search and try again') : t('Change your filter and try again')}
              title={t('oops! no cards found')}
            />
          )
        }
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
    height: '100%',

    '.__card-list-container': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      marginBottom: 20,
      paddingTop: 16
    },
    '.__card-list-wrapper': {
      flex: 1,
      overflow: 'auto'
    },

    '.empty-list-content': {
      paddingTop: 134
    },

    '.__call-to-action': {
      marginBottom: token.marginMD,
      '.__button-content': {
        letterSpacing: '-0.6px'
      },
      '.__right-part': {
        minWidth: 143
      },
      '.__action-button': {
        paddingLeft: 10
      },
      '.__button-background': {
        minWidth: 143
      }
    },

    '.__card-item': {
      flex: '1 1 45%'
    }
  };
});

export default Cards;
