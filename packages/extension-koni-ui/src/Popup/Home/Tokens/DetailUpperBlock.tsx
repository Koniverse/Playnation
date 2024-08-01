// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { EnergyConfig } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useGetEnergyInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { saveShowBalance } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Number } from '@subwallet/react-ui';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import { CopySimple, Eye, EyeSlash, Lightning, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = ThemeProps & {
  balanceValue: SwNumberProps['value'];
  symbol: string;
  isSupportBuyTokens: boolean;
  isShrink: boolean;
  onOpenSendFund: () => void;
  onOpenBuyTokens: () => void;
  onOpenReceive: () => void;
  onOpenSwap: () => void;
};

const apiSDK = BookaSdk.instance;

function Component (
  { balanceValue,
    className = '',
    isShrink,
    isSupportBuyTokens,
    onOpenBuyTokens,
    onOpenReceive,
    onOpenSendFund,
    symbol }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isShowBalance } = useSelector((state: RootState) => state.settings);
  const [account, setAccount] = useState(apiSDK.account);
  const [energyConfig, setEnergyConfig] = useState<EnergyConfig | undefined>(apiSDK.energyConfig);

  const { currentEnergy } = useGetEnergyInfo({
    startTime: account?.attributes.lastEnergyUpdated,
    energy: account?.attributes.energy,
    maxEnergy: energyConfig?.maxEnergy
  });

  const onChangeShowBalance = useCallback(() => {
    saveShowBalance(!isShowBalance).catch(console.error);
  }, [isShowBalance]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const energyConfigSub = apiSDK.subscribeEnergyConfig().subscribe((data) => {
      setEnergyConfig(data);
    });

    return () => {
      accountSub.unsubscribe();
      energyConfigSub.unsubscribe();
    };
  }, []);

  return (
    <div className={`tokens-upper-block ${className} ${isShrink ? '-shrink' : ''}`}>
      <div className='__top-part'>
        <div className={'__balance-label-wrapper'}>
          <div className='__balance-label'>
            {symbol} {t('balance')}
          </div>

          <Button
            className='button-change-show-balance'
            icon={(
              <Icon
                customSize={'20px'}
                phosphorIcon={!isShowBalance ? Eye : EyeSlash}
              />
            )}
            onClick={onChangeShowBalance}
            size='xs'
            tooltip={isShowBalance ? t('Hide balance') : t('Show balance')}
            type='ghost'
          />
        </div>

        <div className='__energy-info'>
          <span className='__current-energy-value'>
            <Icon
              customSize={'12px'}
              phosphorIcon={Lightning}
              weight={'fill'}
            />

            <span>{toDisplayNumber(currentEnergy || 0)}</span>
          </span>
          <span className='__max-energy-value'>
              /{toDisplayNumber(energyConfig?.maxEnergy || 0)}
          </span>
        </div>
      </div>

      <div className='__balance-value-container'>
        <div
          className='__balance-value-wrapper'
          onClick={isShrink ? onChangeShowBalance : undefined}
        >
          <Number
            className={'__balance-value'}
            decimal={0}
            decimalOpacity={0.45}
            hide={!isShowBalance}
            prefix='$'
            subFloatNumber
            value={balanceValue}
          />
        </div>
      </div>

      <div className={'__action-button-container'}>
        <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={CopySimple}
              weight={'fill'}
            />
          )}
          onClick={onOpenReceive}
          shape='round'
          size={'xs'}
        >
          {t('Receive')}
        </Button>

        <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={PaperPlaneTilt}
              weight={'fill'}
            />
          )}
          onClick={onOpenSendFund}
          schema={'secondary'}
          shape='round'
          size={'xs'}
        >
          {t('Send')}
        </Button>

        <Button
          block={true}
          disabled={!isSupportBuyTokens}
          icon={
            <Icon
              customSize={'20px'}
              phosphorIcon={ShoppingCartSimple}
              weight={'fill'}
            />
          }
          onClick={onOpenBuyTokens}
          schema={'secondary'}
          shape='round'
          size={'xs'}
        >
          {t('Buy')}
        </Button>
      </div>
    </div>
  );
}

export const DetailUpperBlock = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    background: extendToken.colorBgGradient || token.colorPrimary,
    padding: '8px 16px 20px 16px',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',

    '.__top-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    '.__balance-label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.__balance-label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__energy-info': {
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM
    },

    '.__current-energy-value': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__max-energy-value': {
      color: token.colorTextDark3
    },

    '.__balance-value': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontWeight: token.headingFontWeight,
      marginBottom: token.margin,

      '.ant-typography': {
        fontWeight: 'inherit !important'
      },

      '.ant-number-prefix, .ant-number-integer, .ant-number-hide-content': {
        fontSize: '32px !important',
        lineHeight: '1.3125 !important',
        color: `${token.colorTextDark1} !important`
      },

      '.ant-number-decimal': {
        fontSize: `${token.fontSizeHeading3}px !important`,
        lineHeight: `${token.lineHeightHeading3} !important`,
        color: `${token.colorTextDark3} !important`
      }
    },

    '.__action-button-container': {
      display: 'flex',
      gap: token.sizeSM
    }
  });
});
