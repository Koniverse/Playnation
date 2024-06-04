// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { GameEnergyBar } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { EnergyConfig } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useGetEnergyInfo, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { reloadCron, saveShowBalance } from '@subwallet/extension-koni-ui/messaging';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Number, SwNumberProps, Tag } from '@subwallet/react-ui';
import { ArrowsClockwise, CopySimple, Eye, EyeSlash, Lightning, PaperPlaneTilt, ShoppingCartSimple } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  totalValue: SwNumberProps['value'];
  totalChangeValue: SwNumberProps['value'];
  totalChangePercent: SwNumberProps['value'];
  isPriceDecrease: boolean;
  isShrink: boolean;
  onOpenSendFund: () => void;
  onOpenBuyTokens: () => void;
  onOpenReceive: () => void;
  onOpenSwap: () => void;
};

const apiSDK = BookaSdk.instance;

function Component (
  { className = '',
    isPriceDecrease,
    isShrink,
    onOpenBuyTokens,
    onOpenReceive,
    onOpenSendFund,
    totalChangePercent,
    totalChangeValue,
    totalValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isShowBalance } = useSelector((state) => state.settings);
  const [reloading, setReloading] = useState(false);
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

  const reloadBalance = useCallback(() => {
    setReloading(true);
    reloadCron({ data: 'balance' })
      .catch(console.error)
      .finally(() => {
        setReloading(false);
      });
  }, []);

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
      <img
        alt='game_background_image'
        className={'__background-image'}
        src={DefaultLogosMap.game_background_image}
      />

      <div className='__top-part'>
        <div className={'__total-balance-label-wrapper'}>
          <div className='__total-balance-label'>
            {t('Total balance')}
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

        {
          isShrink && (
            <div className='__energy-info'>
              <span className='__current-energy-value'>
                <Icon
                  customSize={'12px'}
                  phosphorIcon={Lightning}
                  weight={'fill'}
                />

                <span>{formatIntegerShort(currentEnergy || 0)}</span>
              </span>
              <span className='__max-energy-value'>
              /{formatIntegerShort(energyConfig?.maxEnergy || 0)}
              </span>
            </div>
          )
        }
      </div>

      <div className='__total-balance-value-container'>
        <div
          className='__total-balance-value-content'
          onClick={isShrink ? onChangeShowBalance : undefined}
        >
          <Number
            className={'__total-balance-value'}
            decimal={0}
            decimalOpacity={0.45}
            hide={!isShowBalance}
            prefix='$'
            subFloatNumber
            value={totalValue}
          />
        </div>
      </div>

      {!isShrink && (
        <>
          <div className={'__balance-change-container'}>
            <Number
              className={'__balance-change-value'}
              decimal={0}
              decimalOpacity={1}
              hide={!isShowBalance}
              prefix={isPriceDecrease ? '- $' : '+ $'}
              value={totalChangeValue}
            />
            <Tag
              className={`__balance-change-percent ${isPriceDecrease ? '-decrease' : ''}`}
              shape={'round'}
            >
              <Number
                decimal={0}
                decimalOpacity={1}
                prefix={isPriceDecrease ? '-' : '+'}
                suffix={'%'}
                value={totalChangePercent}
                weight={700}
              />
            </Tag>
            <Button
              className='button-change-show-balance'
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={ArrowsClockwise}
                />
              )}
              loading={reloading}
              onClick={reloadBalance}
              size='xs'
              tooltip={t('Refresh balance')}
              type='ghost'
            />
          </div>

          <div className={'__game-energy-bar-wrapper'}>
            <div className='__energy-info'>
              <span className='__current-energy-value'>
                <Icon
                  customSize={'12px'}
                  phosphorIcon={Lightning}
                  weight={'fill'}
                />

                <span>{formatIntegerShort(currentEnergy || 0)}</span>
              </span>
              <span className='__max-energy-value'>
              /{formatIntegerShort(energyConfig?.maxEnergy || 0)}
              </span>
            </div>

            <GameEnergyBar
              className={'__game-energy-bar'}
              currentEnergy={currentEnergy}
              maxEnergy={energyConfig?.maxEnergy}
            />
          </div>
        </>
      )}

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

export const UpperBlock = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    background: extendToken.colorBgGradient || token.colorPrimary,
    padding: '8px 16px 24px 16px',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',

    '& > div': {
      position: 'relative',
      zIndex: 5
    },

    '.__background-image': {
      position: 'absolute',
      width: 138,
      height: 'auto',
      right: -18,
      top: 12,
      zIndex: 0
    },

    '.__top-part': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },

    '.__total-balance-label-wrapper': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS
    },

    '.__total-balance-label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__total-balance-value': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontWeight: token.headingFontWeight,

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

    '.__balance-change-container': {
      display: 'flex',
      alignItems: 'center',
      gap: token.sizeXS,
      marginTop: 3,
      marginBottom: 3,

      '.button-change-show-balance': {
        color: token.colorTextBase,

        '&:hover': {
          color: token.colorTextSecondary
        }
      },

      '.ant-typography': {
        lineHeight: 'inherit',
        // todo: may update number component to clear this !important
        color: 'inherit !important',
        fontSize: 'inherit !important'
      }
    },

    '.__balance-change-value': {
      lineHeight: token.lineHeight
    },

    '.__balance-change-percent': {
      backgroundColor: token.colorWhite,
      color: token.colorSuccess,
      marginInlineEnd: 0,
      display: 'flex',

      '&.-decrease': {
        color: token.colorSuccess
      },

      '.ant-number': {
        fontSize: token.fontSizeXS
      }
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

    '.__game-energy-bar-wrapper': {
      marginBottom: 24,

      '.__energy-info': {
        textAlign: 'right',
        marginBottom: 6
      }
    },

    '.__game-energy-bar': {
      '.ant-progress-inner': {
        backgroundColor: token.colorWhite
      }
    },

    '.__action-button-container': {
      display: 'flex',
      gap: token.sizeSM
    },

    '.__button-space': {
      width: token.size
    },

    '&.-shrink': {
      paddingBottom: 20,

      '.__background-image': {
        opacity: 0
      },

      '.__total-balance-value-container': {
        marginBottom: token.margin
      }
    }
  });
});
