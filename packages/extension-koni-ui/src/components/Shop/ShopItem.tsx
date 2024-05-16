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
    icon,
    inventoryQuantity,
    limit,
    name, onBuy, onUse, price, usable } = props;

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
        src={icon || DefaultLogosMap.subwallet}
        width={40}
      />

      <div className={'__middle-part'}>
        <div className={'__website-name h5-text'}>{name}</div>
        <div className={'__website-domain cdescription'}> {description !== null && 'Description: ' + description}</div>
        {
          !!limit && (
            <div>Limit: {limit}</div>
          )
        }

        <div className={'__website-domain description'}>Price: <strong> {price}</strong></div>

        {
          !!inventoryQuantity && (
            <div className={'__website-domain description'}>Quantity: <strong> {inventoryQuantity}</strong></div>
          )
        }

      </div>

      {
        usable && (
          <Button
            onClick={_onUse}
            size={'xs'}
          >
            Use
          </Button>
        )
      }

      <Button
        disabled={disabled}
        onClick={_onBuy}
        size={'xs'}
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
