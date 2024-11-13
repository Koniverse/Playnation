// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CallToAction } from '@subwallet/extension-koni-ui/components/Mythical';
import { StatItem } from '@subwallet/extension-koni-ui/components/Mythical/Modal/CardDetailModal/StatItem';
import { NFLRivalCard } from '@subwallet/extension-koni-ui/connector/booka/types';
import { eventStat } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  id: string,
  card: NFLRivalCard;
  onCancel?: () => void,
}
const NFL_RIVALS_MARKET_LINK = 'https://mythical.market/game/nfl-rivals';

function Component ({ card, className = '', id, onCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const handleOpenMarket = useCallback(() => {
    openInNewTab(NFL_RIVALS_MARKET_LINK)();
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
          backgroundImage: `url("${card.image}")`
        }}
      ></div>

      <div className='__stat-item-list'>
        {
          Object.entries(eventStat).map(([abb, name]) => (
            <StatItem
              abb={abb}
              className={'__stat-item'}
              key={abb}
              name={name.toUpperCase()}
              value={card[name as keyof NFLRivalCard] as number}
            />
          ))
        }
      </div>
      <div className={'__footer-banner'}>
        <CallToAction
          buttonLabel={t('Get more players')}
          className={'__call-to-action'}
          onAction={handleOpenMarket}
          subtitle={t('Visit the Football Rivals marketplace')}
          title={t('Want to get more cards?')}
        />
      </div>
    </SwModal>
  );
}

export const CardDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content.ant-sw-modal-content': {
      paddingTop: 0
    },

    '.ant-sw-sub-header-title': {
      display: 'none'
    },

    '.__footer-banner': {
      paddingTop: 23,
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

    '.ant-sw-modal-body.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 38
    },

    '.ant-sw-modal-header.ant-sw-modal-header': {
      paddingTop: 14,
      paddingBottom: 0,
      marginBottom: -8
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
