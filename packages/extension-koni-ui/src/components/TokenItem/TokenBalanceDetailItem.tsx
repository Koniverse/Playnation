// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { ActivityIndicator, BalanceItem, BalanceItemProps, Icon, Number } from '@subwallet/react-ui';
import classNames from 'classnames';
import { CaretRight } from 'phosphor-react';
import React from 'react';
import styled from 'styled-components';

type Props = TokenBalanceItemType & ThemeProps & {
  onClick?: BalanceItemProps['onPressItem'],
};

function Component (
  { chain,
    chainDisplayName = '',
    className = '',
    currency,
    isReady,
    logoKey,
    onClick,
    priceValue,
    slug,
    symbol,
    total }: Props) {
  // todo: Create new Web3block item in react-ui lib
  // - loading
  // - auto detect logo, only use logoKey
  const { isShowBalance } = useSelector((state: RootState) => state.settings);

  return (
    <div className={classNames('token-balance-detail-item', className)}>
      <BalanceItem
        balanceValue={total.value}
        convertedBalanceValue={total.convertedValue}
        decimal={0}
        displayToken={symbol}
        isShowSubLogo={true}
        middleItem={
          (
            <>
              <div className={'ant-balance-item-name'}>{symbol}</div>
              <div className={'__chain-name'}>
                {chainDisplayName?.replace(' Relay Chain', '')}
              </div>
            </>
          )
        }
        name={symbol}
        networkMainLogoShape={'squircle'}
        onPressItem={onClick}
        prefix={(currency?.isPrefix && currency.symbol) || ''}
        price={priceValue}
        rightItem={
          (
            <>
              <div className={'ant-balance-item-balance-info-wrapper'}>
                <Number
                  className={'__value'}
                  decimal={0}
                  decimalOpacity={0.45}
                  hide={!isShowBalance}
                  intOpacity={0.85}
                  value={total.value}
                />
                <Number
                  className={'__converted-value'}
                  decimal={0}
                  decimalOpacity={0.45}
                  hide={!isShowBalance}
                  intOpacity={0.45}
                  prefix={(currency?.isPrefix && currency.symbol) || ''}
                  size={12}
                  suffix={(!currency?.isPrefix && currency?.symbol) || ''}
                  unitOpacity={0.45}
                  value={total.convertedValue}
                />
              </div>

              <div
                className={'__icon-wrapper'}
              >
                {isReady
                  ? (
                    <Icon
                      phosphorIcon={CaretRight}
                      size='sm'
                      type='phosphor'
                    />
                  )
                  : (
                    <ActivityIndicator
                      prefixCls={'ant'} // todo: add className to ActivityIndicator
                      size={20}
                    />
                  )}
              </div>
            </>
          )
        }
        subNetworkKey={chain}
        suffix={(!currency?.isPrefix && currency?.symbol) || ''}
        symbol={logoKey}
      />
    </div>
  );
}

export const TokenBalanceDetailItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.ant-balance-item': {
      backgroundColor: extendToken.colorBgSecondary1,

      '.ant-balance-item-name': {
        color: token.colorTextDark2
      }
    },

    '.ant-balance-item:hover': {
      backgroundColor: token.colorBgSecondary
    },

    '.ant-web3-block': {
      padding: token.paddingSM,
      paddingRight: token.paddingXS
    },

    '.ant-number .ant-typography': {
      fontSize: 'inherit !important',
      color: 'inherit !important',
      fontWeight: 'inherit !important',
      lineHeight: 'inherit'
    },

    '.__value': {
      lineHeight: token.lineHeightLG,
      fontSize: token.fontSizeLG,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1
    },

    '.__converted-value': {
      lineHeight: token.lineHeightSM,
      fontSize: token.fontSizeSM,
      color: token.colorTextDark1
    },

    '.ant-web3-block-middle-item': {
      overflow: 'hidden'
    },

    '.__chain-name': {
      color: token.colorTextDark4,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    '.ant-loading-icon': {
      color: 'inherit !important'
    },

    '.ant-image-img': {
      height: 'auto !important'
    },

    '.__icon-wrapper': {
      width: 40,
      height: 40,
      marginLeft: token.marginXXS,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: token.colorTextDark2
    }
  });
});
