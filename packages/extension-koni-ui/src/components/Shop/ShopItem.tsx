// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ShopItemInfo } from '@subwallet/extension-koni-ui/types/shop';
import { Button, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & ShopItemInfo & {
  onBuy: (gameItemId: string, quantity?: number) => void
  onUse: (gameItemId: string) => void
};

function Component (props: Props): React.ReactElement<Props> {
  const { className = '',
    description,
    disabled,
    gameItemId,
    inventoryQuantity,
    limit,
    name, onBuy, price, usable, onUse } = props;

  const _onBuy = useCallback(() => {
    onBuy(gameItemId, 1);
  }, [gameItemId, onBuy]);

  const _onUse = useCallback(() => {
    onUse(gameItemId);
  }, [gameItemId, onUse]);

  return (
    <div
      className={CN(
        className, {
          '-disabled': disabled
        }
      )}
    >
      <Image
        className={'item-icon'}
        src={DefaultLogosMap.subwallet}
        width={40}
      />

      <div className={'__middle-part'}>
        <div>{name}</div>
        <div>description: {description}</div>
        {
          !!limit && (
            <div>Limit: {limit}</div>
          )
        }

        <div>Price: {price}</div>

        {
          !!inventoryQuantity && (
            <div>Quantity: {inventoryQuantity}</div>
          )
        }

      </div>

      {
        usable && (
          <Button
            onClick={_onUse}
          >
            Use
          </Button>
        )
      }

      <Button
        disabled={disabled}
        onClick={_onBuy}
      >
        Buy
      </Button>
    </div>
  );
}

const ShopItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    display: 'flex',
    backgroundColor: token.colorBgSecondary,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    gap: token.sizeXS,

    '.__middle-part': {
      flex: 1
    }
  });
});

export default ShopItem;
