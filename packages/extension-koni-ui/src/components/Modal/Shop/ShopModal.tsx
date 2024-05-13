// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ShopItem } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { GameInventoryItem, GameItem } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ShopItemInfo } from '@subwallet/extension-koni-ui/types/shop';
import { ModalContext, SwModal } from '@subwallet/react-ui';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  gameId?: number;
  gameItemMap: Record<string, GameItem[]>;
  gameInventoryItemList: GameInventoryItem[];
};

export const ShopModalId = 'ShopModalId';
const apiSDK = BookaSdk.instance;

function Component ({ className, gameId,
  gameInventoryItemList,
  gameItemMap }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [buyLoading, setBuyLoading] = useState<boolean>(false);

  const { inactiveModal } = useContext(ModalContext);

  const onClose = useCallback(() => {
    inactiveModal(ShopModalId);
  }, [inactiveModal]);

  const items = useMemo<ShopItemInfo[]>(() => {
    const result: ShopItemInfo[] = [];

    const inventoryItemMapByGameItemId: Record<number, GameInventoryItem> = {};

    gameInventoryItemList.forEach((i) => {
      inventoryItemMapByGameItemId[i.gameItemId] = i;
    });

    const getShopItem = (gi: GameItem, disabled = false): ShopItemInfo => {
      const limit = gi.maxBuy || undefined;
      const inventoryQuantity = inventoryItemMapByGameItemId[gi.id]?.quantity || undefined;

      return {
        gameItemId: gi.id,
        name: gi.name,
        gameId: gi.gameId,
        limit,
        description: gi.description,
        inventoryQuantity,
        itemGroup: gi.itemGroup,
        itemGroupLevel: gi.itemGroupLevel,
        price: gi.price,
        disabled: disabled || (!!limit && limit > 0 && limit === inventoryQuantity) || (!!gi.itemGroup && inventoryQuantity === 1)
      };
    };

    [...Object.keys(gameItemMap)].forEach((groupKey) => {
      if (groupKey !== 'NO_GROUP' && gameItemMap[groupKey][0]?.effectDuration === -1) {
        const noQuantityItems = gameItemMap[groupKey].filter((gi) => !inventoryItemMapByGameItemId[gi.id]?.quantity);

        let itemPresentForGroup: GameItem;

        if (noQuantityItems.length) {
          itemPresentForGroup = noQuantityItems.reduce((item, currentItem) => {
            return currentItem.itemGroupLevel && item.itemGroupLevel && currentItem.itemGroupLevel < item.itemGroupLevel ? currentItem : item;
          }, { itemGroupLevel: Number.POSITIVE_INFINITY } as GameItem);

          if (itemPresentForGroup.itemGroupLevel !== Number.POSITIVE_INFINITY) {
            result.push(getShopItem(itemPresentForGroup));
          }
        } else {
          itemPresentForGroup = gameItemMap[groupKey]
            .reduce((item, currentItem) => {
              return currentItem.itemGroupLevel && item.itemGroupLevel && currentItem.itemGroupLevel > item.itemGroupLevel ? currentItem : item;
            }, { itemGroupLevel: Number.NEGATIVE_INFINITY } as GameItem);

          if (itemPresentForGroup.itemGroupLevel !== Number.NEGATIVE_INFINITY) {
            result.push(getShopItem(itemPresentForGroup, true));
          }
        }

        return;
      }

      gameItemMap[groupKey].forEach((gi) => {
        if ((!gameId && !gi.gameId) || (gameId && gi.gameId === gameId)) {
          result.push(getShopItem(gi));
        }
      });
    });

    return result;
  }, [gameId, gameInventoryItemList, gameItemMap]);

  const onBuy = useCallback((gameItemId: number) => {
    setBuyLoading(true);
    apiSDK.buyItem(gameItemId).catch((e) => {
      console.log('buyItem error', e);
    }).finally(() => {
      setBuyLoading(false);
    });
  }, []);

  return (
    <SwModal
      className={className}
      id={ShopModalId}
      onCancel={onClose}
      title={t('Items')}
    >
      {
        items.map((item) => (
          <ShopItem
            className={'shop-item'}
            key={item.gameItemId}
            {...item}
            disabled={buyLoading || item.disabled}
            onBuy={onBuy}
          />
        ))
      }
    </SwModal>
  );
}

const ShopModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.shop-item + .shop-item': {
      marginTop: token.marginSM
    }
  });
});

export default ShopModal;
