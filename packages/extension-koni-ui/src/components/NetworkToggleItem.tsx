// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ChainItemFooter from '@subwallet/extension-koni-ui/components/ChainItemFooter';
import { ChainInfoWithStateAndStatus } from '@subwallet/extension-koni-ui/hooks/chain/useChainInfoWithStateAndStatus';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { NetworkItem } from '@subwallet/react-ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  chainInfo: ChainInfoWithStateAndStatus;
  isShowSubLogo?: boolean;
}

const Component: React.FC<Props> = (props: Props) => {
  const { chainInfo, className, isShowSubLogo = false } = props;
  const navigate = useNavigate();
  const connectSymbol = `__${chainInfo.connectionStatus}__`;

  return (
    <NetworkItem
      className={className}
      dividerPadding={56}
      isShowSubLogo={isShowSubLogo}
      key={chainInfo.slug}
      name={chainInfo.name}
      networkKey={chainInfo.slug}
      networkMainLogoSize={24}
      rightItem={(
        <ChainItemFooter
          chainInfo={chainInfo}
          className={'__toggle-area'}
          navigate={navigate}
          showDetailNavigation={true}
        />
      )}
      subSymbol={connectSymbol}
    />
  );
};

const NetworkToggleItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    backgroundColor: 'transparent',

    '.ant-web3-block': {
      cursor: 'default',
      padding: `${token.paddingXS}px 0 ${token.paddingXS}px ${token.paddingSM}px`,

      '.ant-web3-block-right-item': {
        marginRight: 0
      }
    },

    '.ant-logo': {
      marginRight: token.marginXXS,

      '.ant-squircle, .ant-squircle .ant-image-img': {
        width: '24px !important',
        height: '24px !important'
      }
    },

    '.-sub-logo.-sub-logo': {
      bottom: 0,
      right: 0
    },

    '.-sub-logo .ant-image-img': {
      width: `${token.sizeSM}px !important`,
      height: `${token.sizeSM}px !important`
    },

    '.ant-network-item-name': {
      color: token.colorTextDark2
    },

    '.manage_tokens__right_item_container': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.ant-divider': {
      borderBlockStartColor: token.colorBgDivider
    }
  };
});

export default NetworkToggleItem;
