// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AccountRankLevel, GameAccountAvatar, GameEnergyBar, Layout } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { AccountRankType, BookaAccount, EnergyConfig, RankInfo } from '@subwallet/extension-koni-ui/connector/booka/types';
import { accountRankList, detailScreensLayoutBackgroundImages, rankNameMap, smallRankIconMap } from '@subwallet/extension-koni-ui/constants';
import { useGetAccountByAddress, useGetEnergyInfo, useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, formatInteger, formatIntegerShort, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Progress } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, Lightning } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

type RankPosition = {
  prev?: AccountRankType,
  current: AccountRankType,
  next?: AccountRankType,
}

function getRankPosition (currentRank: AccountRankType = 'iron'): RankPosition {
  const currentRankIndex = accountRankList.findIndex((r) => r === currentRank);

  return {
    prev: accountRankList[currentRankIndex - 1] || 'unknown',
    current: currentRank,
    next: accountRankList[currentRankIndex + 1] || 'unknown'
  };
}

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const { accountAddress } = useParams();
  const accountJson = useGetAccountByAddress(accountAddress);
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const [rankInfoMap, setRankInfoMap] = useState<Record<AccountRankType, RankInfo> | undefined>(apiSDK.rankInfoMap);
  const [energyConfig, setEnergyConfig] = useState<EnergyConfig | undefined>(apiSDK.energyConfig);
  const notify = useNotification();
  const { t } = useTranslation();

  const onCopyAddress = useCallback(() => {
    copyToClipboard(accountJson?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [accountJson?.address, notify, t]);

  const accountRankPosition = useMemo(() => {
    return getRankPosition(account?.attributes.rank);
  }, [account?.attributes.rank]);

  const { currentEnergy } = useGetEnergyInfo({
    startTime: account?.attributes.lastEnergyUpdated,
    energy: account?.attributes.energy,
    maxEnergy: energyConfig?.maxEnergy
  });

  const currentRank = account?.attributes.rank || 'iron';
  const currentPoint = account?.attributes.accumulatePoint || 0;

  const pointPercent = useMemo(() => {
    const currentRankInfo = rankInfoMap?.[currentRank];

    if (currentRankInfo && currentPoint > 0) {
      return (currentPoint - currentRankInfo.minPoint) * 100 / (currentRankInfo.maxPoint - currentRankInfo.minPoint);
    }

    return 0;
  }, [currentPoint, currentRank, rankInfoMap]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    const rankInfoSub = apiSDK.subscribeRankInfoMap().subscribe((data) => {
      setRankInfoMap(data);
    });

    const energyConfigSub = apiSDK.subscribeEnergyConfig().subscribe((data) => {
      setEnergyConfig(data);
    });

    return () => {
      accountSub.unsubscribe();
      rankInfoSub.unsubscribe();
      energyConfigSub.unsubscribe();
    };
  }, []);

  return (
    <Layout.WithSubHeaderOnly
      backgroundImages={detailScreensLayoutBackgroundImages}
      backgroundStyle={'primary'}
      className={CN(className)}
      title={t('Account details')}
    >
      <div className='account-info-area'>
        <GameAccountAvatar
          avatarPath={account?.info.photoUrl || undefined}
          className={'account-avatar'}
          hasBoxShadow
          size={7}
        />

        <div className='account-name'>{accountJson?.name}</div>
        <div className='account-address-wrapper'>
          <div className='account-address'>
            ({accountJson?.address ? toShort(accountJson?.address, 12, 5) : ''})
          </div>

          <div className='account-address-copy-button-wrapper'>
            <Button
              className={'account-address-copy-button'}
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={Copy}
                  weight={'fill'}
                />
              )}
              onClick={onCopyAddress}
              size={'xs'}
              type={'ghost'}
            />
          </div>
        </div>
      </div>

      <div className='process-bar-area'>
        <div className='process-bar-wrapper -energy'>
          <GameEnergyBar
            className={'process-bar'}
            currentEnergy={currentEnergy}
            maxEnergy={energyConfig?.maxEnergy}
          />

          <div className='process-bar-info'>
            <div className='process-bar-info-left-part'>
              <div className='recovery-info'>
                <span className='recovery-value'>
                  <span>1</span>

                  <Icon
                    customSize={'12px'}
                    phosphorIcon={Lightning}
                    weight={'fill'}
                  />
                </span>
                <span className='recovery-suffix'>
                /{t('min')}
                </span>
              </div>
            </div>
            <div className='process-bar-info-right-part'>
              <div className='energy-info'>
                <span className='current-energy'>
                  <Icon
                    customSize={'12px'}
                    phosphorIcon={Lightning}
                    weight={'fill'}
                  />

                  <span>{formatIntegerShort(currentEnergy || 0)}</span>
                </span>
                <span className='max-energy'>
                /{formatIntegerShort(energyConfig?.maxEnergy || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='process-bar-wrapper -point'>
          <Progress
            className={'process-bar'}
            percent={pointPercent}
            showInfo={false}
            status={'active'}
            type={'line'}
          />

          <div className='process-bar-info'>
            <div className='process-bar-info-left-part'>
              <div className='rank-info'>
                <img
                  alt='rank'
                  className={'rank-info-icon'}
                  src={smallRankIconMap[currentRank]}
                />
                <span className='rank-info-label'>
                  {rankNameMap[currentRank]}
                </span>
              </div>
            </div>
            <div className='process-bar-info-right-part'>
              <div className='point-info'>
                <img
                  alt='point'
                  className={'point-icon'}
                  src={DefaultLogosMap.token_icon}
                />

                <span className='current-point'>
                  {formatInteger(currentPoint)}
                </span>

                <span className='tagret-point'>
                  /{formatInteger(rankInfoMap?.[currentRank].maxPoint || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        rankInfoMap && (
          <div className={'rank-area'}>
            <div className='rank-area-title'>
              {t('Rank level')}
            </div>

            <div className='rank-list-container'>
              <div className='rank-item-wrapper -prev-rank'>
                <AccountRankLevel
                  rank={accountRankPosition.prev || 'unknown'}
                  rankInfoMap={rankInfoMap}
                />
              </div>
              <div className='rank-item-wrapper -current-rank'>
                <AccountRankLevel
                  isCurrent
                  rank={accountRankPosition.current}
                  rankInfoMap={rankInfoMap}
                />
              </div>
              <div className='rank-item-wrapper -next-rank'>
                <AccountRankLevel
                  rank={accountRankPosition.next || 'unknown'}
                  rankInfoMap={rankInfoMap}
                />
              </div>
            </div>
          </div>
        )
      }
    </Layout.WithSubHeaderOnly>
  );
};

const AccountDetail = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    // account

    '.ant-sw-screen-layout-body-inner': {
      paddingTop: token.paddingXXS,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 24
    },

    '.account-info-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 24
    },

    '.account-avatar': {
      marginBottom: token.margin
    },

    '.account-name': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1,
      marginBottom: token.marginXXS
    },

    '.account-address-wrapper': {
      color: token.colorTextDark3,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      display: 'flex',
      gap: token.sizeXXS
    },

    '.account-address-copy-button-wrapper': {
      minWidth: 20,
      height: 20,
      position: 'relative'
    },

    '.account-address-copy-button': {
      position: 'absolute',
      left: -10,
      top: -10,
      color: token.colorTextDark3
    },

    // process info

    '.process-bar-area': {
      paddingLeft: token.padding,
      paddingRight: token.padding,
      marginBottom: 24
    },

    '.process-bar-info': {
      display: 'flex',
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark3,
      justifyContent: 'space-between',
      marginTop: 6
    },

    '.process-bar-wrapper + .process-bar-wrapper': {
      marginTop: token.margin
    },

    '.process-bar': {
      marginBottom: 0,
      marginTop: 0,
      marginRight: 0,

      '.ant-progress-inner': {
        backgroundColor: token.colorBgSecondary
      },

      '&, .ant-progress-outer, .ant-progress-inner': {
        display: 'block'
      }
    },

    '.recovery-value, .rank-info-label, .current-point, .current-energy': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.point-icon, .rank-info-icon': {
      minWidth: 16,
      height: 16,
      marginRight: 2
    },

    '.rank-info, .point-info': {
      display: 'flex',
      alignItems: 'center'
    },

    // rank

    '.rank-area': {
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 20,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingTop: 20,
      paddingBottom: 28
    },

    '.rank-area-title': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1,
      textAlign: 'center',
      marginBottom: token.margin
    },

    '.rank-list-container': {
      display: 'flex'
    },

    '.rank-item-wrapper': {
      display: 'flex',
      alignItems: 'flex-end'
    },

    '.rank-item-wrapper.-prev-rank, .rank-item-wrapper.-next-rank': {
      flex: 1
    },

    '.rank-item-wrapper.-next-rank': {
      justifyContent: 'flex-end'
    }
  };
});

export default AccountDetail;
