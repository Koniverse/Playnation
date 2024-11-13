// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction, CardDetailModal, CardItem, EmptyListContent, MainScreenHeader } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
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

const tmpData =
[
  {
    cardId: '1cstroud7te1_1',
    defId: '1cstroud7te1',
    firstName: 'C.J.',
    lastName: 'Stroud',
    team: 'texans',
    position: 'QB',
    rarity: 'epic',
    program: 'default',
    stars: 3,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1cstroud7te1.png',
    isDefault: true,
    level: 1,
    power: 81,
    strength: 52,
    quickness: 64,
    acceleration: 53,
    presence: 83,
    endurance: 80,
    jump: 54,
    carry: 51
  },
  {
    cardId: '1baiyuk11ft1_1',
    defId: '1baiyuk11ft1',
    firstName: 'Brandon',
    lastName: 'Aiyuk',
    team: 'fourty_niners',
    position: 'WR',
    rarity: 'epic',
    program: 'default',
    stars: 3,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1baiyuk11ft1.png',
    isDefault: true,
    level: 1,
    power: 80,
    strength: 54,
    quickness: 101,
    acceleration: 91,
    presence: 54,
    endurance: 59,
    jump: 113,
    carry: 69
  },
  {
    cardId: '1jelliott4ea1_1',
    defId: '1jelliott4ea1',
    firstName: 'Jake',
    lastName: 'Elliott',
    team: 'eagles',
    position: 'K',
    rarity: 'rare',
    program: 'default',
    stars: 2,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1jelliott4ea1.png',
    isDefault: true,
    level: 1,
    power: 80,
    strength: 27,
    quickness: 42,
    acceleration: 60,
    presence: 26,
    endurance: 54,
    jump: 38,
    carry: 29
  },
  {
    cardId: '1jferguson65cw1_1',
    defId: '1jferguson65cw1',
    firstName: 'Jake',
    lastName: 'Ferguson',
    team: 'cowboys',
    position: 'TE',
    rarity: 'common',
    program: 'default',
    stars: 1,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1jferguson65cw1.png',
    isDefault: true,
    level: 1,
    power: 68,
    strength: 56,
    quickness: 61,
    acceleration: 52,
    presence: 65,
    endurance: 87,
    jump: 65,
    carry: 65
  },
  {
    cardId: '1qwilliams56je1_1',
    defId: '1qwilliams56je1',
    firstName: 'Quincy',
    lastName: 'Williams',
    team: 'jets',
    position: 'LB',
    rarity: 'common',
    program: 'default',
    stars: 1,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1qwilliams56je1.png',
    isDefault: true,
    level: 1,
    power: 68,
    strength: 56,
    quickness: 65,
    acceleration: 75,
    presence: 49,
    endurance: 61,
    jump: 84,
    carry: 40
  },
  {
    cardId: '1xmckinney29gi1_1',
    defId: '1xmckinney29gi1',
    firstName: 'Xavier',
    lastName: 'McKinney',
    team: 'packers',
    position: 'FS',
    rarity: 'rare',
    program: 'default',
    stars: 2,
    image: 'https://nfl-rival-static.playnation.app/assets/images/cards/1xmckinney29gi1.png',
    isDefault: true,
    level: 1,
    power: 71,
    strength: 58,
    quickness: 84,
    acceleration: 75,
    presence: 57,
    endurance: 80,
    jump: 85,
    carry: 57
  }
];

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
  const initCardItems = useRef<NFLRivalCard[]>([]);

  useEffect(() => {
    const unsubscribe = bookaSDK.subscribeNFLRivalCardList().subscribe((cardList) => {
      cardList = tmpData;
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
          subtitle={t('Visit the Football Rivals marketplace')}
          title={t('Want to get more cards?')}
        />

        <ToolArea
          listCard={cardItems}
          setConditionProcess={setConditionProcess}
        />

        {cardItems.length
          ? (
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
            </div>
          )
          : (
            <EmptyListContent
              className={'empty-list-content'}
              content={t('Change your filter and try again')}
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
    backgroundColor: '#000',
    backgroundImage: 'url("/images/mythical/your-card-background.png")',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    height: '100%',

    '.__card-list-container': {
      overflow: 'auto',
      display: 'flex',
      flexWrap: 'wrap',
      paddingRight: token.padding,
      paddingLeft: token.padding,
      flex: 1
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
