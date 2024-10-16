// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PageWrapper from '@subwallet/extension-koni-ui/components/Layout/PageWrapper';
import { AccountSelectorModal } from '@subwallet/extension-koni-ui/components/Modal/AccountSelectorModal';
import ReceiveQrModal from '@subwallet/extension-koni-ui/components/Modal/ReceiveModal/ReceiveQrModal';
import { TokensSelectorModal } from '@subwallet/extension-koni-ui/components/Modal/ReceiveModal/TokensSelectorModal';
import { TokenBalanceDetailItem } from '@subwallet/extension-koni-ui/components/TokenItem/TokenBalanceDetailItem';
import { CUSTOMIZE_MODAL, DEFAULT_TRANSFER_PARAMS, TRANSFER_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useNavigateOnChangeAccount, useNotification, useReceiveQR, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { DetailModal } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/DetailModal';
import { DetailUpperBlock } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/DetailUpperBlock';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { BuyTokenInfo, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { getAccountType, isAccountAll, openInNewTab, sortTokenByValue } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { SwNumberProps } from '@subwallet/react-ui/es/number';
import classNames from 'classnames';
import { CaretLeft, FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

type CurrentSelectToken = {
  symbol: string;
  slug: string;
}

function WrapperComponent ({ className = '' }: ThemeProps): React.ReactElement<Props> {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={`tokens ${className}`}
      resolve={dataContext.awaitStores(['price', 'chainStore', 'assetRegistry', 'balance'])}
    >
      <Component />
    </PageWrapper>
  );
}

const GlobalSearchTokenModalId = 'globalSearchToken';
const TokenDetailModalId = 'tokenDetailModalId';

function Component (): React.ReactElement {
  const { slug: tokenGroupSlug } = useParams();

  const notify = useNotification();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { activeModal, inactiveModal } = useContext(ModalContext);
  const { setContainerClass } = useContext(HomeContext);
  const { accountBalance: { tokenBalanceMap, tokenGroupBalanceMap }, tokenGroupStructure: { tokenGroupMap } } = useContext(HomeContext);

  const assetRegistryMap = useSelector((root: RootState) => root.assetRegistry.assetRegistry);
  const multiChainAssetMap = useSelector((state: RootState) => state.assetRegistry.multiChainAssetMap);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const { tokens } = useSelector((state: RootState) => state.buyService);
  const [, setStorage] = useLocalStorage(TRANSFER_TRANSACTION, DEFAULT_TRANSFER_PARAMS);

  const containerRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);

  const { accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    selectedAccount,
    selectedNetwork,
    tokenSelectorItems } = useReceiveQR(tokenGroupSlug);

  useNavigateOnChangeAccount('/home/events');

  const symbol = useMemo<string>(() => {
    if (tokenGroupSlug) {
      if (multiChainAssetMap[tokenGroupSlug]) {
        return multiChainAssetMap[tokenGroupSlug].symbol;
      }

      if (assetRegistryMap[tokenGroupSlug]) {
        return assetRegistryMap[tokenGroupSlug].symbol;
      }
    }

    return '';
  }, [tokenGroupSlug, assetRegistryMap, multiChainAssetMap]);

  const buyInfos = useMemo(() => {
    const slug = tokenGroupSlug || '';
    const slugs = tokenGroupMap[slug] ? tokenGroupMap[slug] : [slug];
    const result: BuyTokenInfo[] = [];

    for (const [slug, buyInfo] of Object.entries(tokens)) {
      if (slugs.includes(slug)) {
        const supportType = buyInfo.support;

        if (isAccountAll(currentAccount?.address || '')) {
          const support = accounts.some((account) => supportType === getAccountType(account.address));

          if (support) {
            result.push(buyInfo);
          }
        } else {
          if (currentAccount?.address && (supportType === getAccountType(currentAccount?.address))) {
            result.push(buyInfo);
          }
        }
      }
    }

    return result;
  }, [accounts, currentAccount?.address, tokenGroupMap, tokenGroupSlug, tokens]);

  const tokenBalanceValue = useMemo<SwNumberProps['value']>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        return tokenGroupBalanceMap[tokenGroupSlug].total.convertedValue;
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return tokenBalanceMap[tokenGroupSlug].total.convertedValue;
      }
    }

    return '0';
  }, [tokenGroupSlug, tokenBalanceMap, tokenGroupBalanceMap]);

  const tokenBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    if (tokenGroupSlug) {
      if (tokenGroupMap[tokenGroupSlug]) {
        const items: TokenBalanceItemType[] = [];

        tokenGroupMap[tokenGroupSlug].forEach((tokenSlug) => {
          if (tokenBalanceMap[tokenSlug]) {
            items.push(tokenBalanceMap[tokenSlug]);
          }
        });

        return items.sort(sortTokenByValue);
      }

      if (tokenBalanceMap[tokenGroupSlug]) {
        return [tokenBalanceMap[tokenGroupSlug]];
      }
    }

    return [] as TokenBalanceItemType[];
  }, [tokenGroupSlug, tokenGroupMap, tokenBalanceMap]);

  const [currentTokenInfo, setCurrentTokenInfo] = useState<CurrentSelectToken| undefined>(undefined);
  const [isShrink, setIsShrink] = useState<boolean>(false);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const topPosition = event.currentTarget.scrollTop;

    if (topPosition > 60) {
      setIsShrink((value) => {
        if (!value && topBlockRef.current && containerRef.current) {
          const containerProps = containerRef.current.getBoundingClientRect();

          topBlockRef.current.style.position = 'fixed';
          topBlockRef.current.style.opacity = '0';
          topBlockRef.current.style.paddingTop = '0';
          topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
          topBlockRef.current.style.left = `${containerProps.left}px`;
          topBlockRef.current.style.right = `${containerProps.right}px`;
          topBlockRef.current.style.width = `${containerProps.width}px`;

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.opacity = '1';
            }
          }, 50);
        }

        return true;
      });
    } else {
      setIsShrink((value) => {
        if (value && topBlockRef.current) {
          topBlockRef.current.style.position = 'absolute';
          topBlockRef.current.style.top = '0';
          topBlockRef.current.style.left = '0';
          topBlockRef.current.style.right = '0';
          topBlockRef.current.style.width = '100%';
          topBlockRef.current.style.opacity = '0';

          setTimeout(() => {
            if (topBlockRef.current) {
              topBlockRef.current.style.opacity = '1';
            }
          }, 50);
        }

        return false;
      });
    }
  }, []);

  const handleResize = useCallback(() => {
    const topPosition = containerRef.current?.scrollTop || 0;

    if (topPosition > 60) {
      if (topBlockRef.current && containerRef.current) {
        const containerProps = containerRef.current.getBoundingClientRect();

        topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
        topBlockRef.current.style.left = `${containerProps.left}px`;
        topBlockRef.current.style.right = `${containerProps.right}px`;
        topBlockRef.current.style.width = `${containerProps.width}px`;
      }
    } else {
      if (topBlockRef.current) {
        topBlockRef.current.style.top = '0';
        topBlockRef.current.style.left = '0';
        topBlockRef.current.style.right = '0';
        topBlockRef.current.style.width = '100%';
      }
    }
  }, []);

  const onCloseDetail = useCallback(() => {
    setCurrentTokenInfo(undefined);
  }, []);

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      if (item.isReady) {
        setCurrentTokenInfo({
          slug: item.slug,
          symbol: item.symbol
        });
      }
    };
  }, []);

  const onOpenSendFund = useCallback(() => {
    if (currentAccount && currentAccount.isReadOnly) {
      notify({
        message: t('The account you are using is watch-only, you cannot send assets with it'),
        type: 'info',
        duration: 3
      });

      return;
    }

    const address = currentAccount ? isAccountAll(currentAccount.address) ? '' : currentAccount.address : '';

    setStorage({
      ...DEFAULT_TRANSFER_PARAMS,
      from: address,
      defaultSlug: tokenGroupSlug || ''
    });

    navigate('/transaction/send-fund');
  },
  [currentAccount, navigate, notify, setStorage, t, tokenGroupSlug]
  );

  const onOpenBuyTokens = useCallback(() => {
    let symbol = '';

    if (buyInfos.length) {
      if (buyInfos.length === 1) {
        symbol = buyInfos[0].slug;
      } else {
        symbol = buyInfos[0].symbol;
      }
    }

    navigate('/buy-tokens', { state: { symbol } });
  },
  [buyInfos, navigate]
  );

  const onOpenSwap = useCallback(() => {
    openInNewTab('https://web.subwallet.app/redirect-handler/swap')();
  }, []);

  const goHome = useCallback(() => {
    navigate('/home/events');
  }, [navigate]);

  const onOpenGlobalSearchToken = useCallback(() => {
    activeModal(GlobalSearchTokenModalId);
  }, [activeModal]);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  useEffect(() => {
    if (currentTokenInfo) {
      activeModal(TokenDetailModalId);
    } else {
      inactiveModal(TokenDetailModalId);
    }
  }, [activeModal, currentTokenInfo, inactiveModal]);

  useEffect(() => {
    setIsShrink(false);
  }, [tokenGroupSlug]);

  useEffect(() => {
    if (!tokenBalanceItems.length) {
      goHome();
    }
  }, [goHome, tokenBalanceItems.length]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    setContainerClass('wallet-screen-wrapper');

    return () => {
      setContainerClass(undefined);
    };
  }, [setContainerClass]);

  return (
    <div
      className={'token-detail-container'}
      onScroll={handleScroll}
      ref={containerRef}
    >
      <div
        className={classNames('__upper-block-wrapper')}
        ref={topBlockRef}
      >
        <DetailUpperBlock
          balanceValue={tokenBalanceValue}
          className={'__static-block'}
          isShrink={isShrink}
          isSupportBuyTokens={!!buyInfos.length}
          onOpenBuyTokens={onOpenBuyTokens}
          onOpenReceive={onOpenReceive}
          onOpenSendFund={onOpenSendFund}
          onOpenSwap={onOpenSwap}
          symbol={symbol}
        />

        <div className='token-action-bar'>
          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={CaretLeft}
              />
            )}
            onClick={goHome}
            size={'xs'}
            type={'ghost'}
          />

          <div className='token-action-bar-label'>
            {t('Token')}
          </div>

          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={FadersHorizontal}
              />
            )}
            onClick={onOpenCustomizeModal}
            size={'xs'}
            type={'ghost'}
          />
          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={MagnifyingGlass}
              />
            )}
            onClick={onOpenGlobalSearchToken}
            size={'xs'}
            type={'ghost'}
          />
        </div>
      </div>
      <div
        className={'__scroll-container'}
      >
        {
          tokenBalanceItems.map((item) => (
            <TokenBalanceDetailItem
              key={item.slug}
              {...item}
              onClick={onClickItem(item)}
            />
          ))
        }
      </div>

      <DetailModal
        currentTokenInfo={currentTokenInfo}
        id={TokenDetailModalId}
        onCancel={onCloseDetail}
        tokenBalanceMap={tokenBalanceMap}
      />

      <AccountSelectorModal
        items={accountSelectorItems}
        onSelectItem={openSelectAccount}
      />

      <TokensSelectorModal
        address={selectedAccount}
        items={tokenSelectorItems}
        onSelectItem={openSelectToken}
      />

      <ReceiveQrModal
        address={selectedAccount}
        selectedNetwork={selectedNetwork}
      />
    </div>
  );
}

const Tokens = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    overflow: 'hidden',

    '.token-detail-container': {
      height: '100%',
      overflow: 'auto',
      fontSize: token.fontSizeLG,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 218,
      paddingBottom: 34
    },

    '.token-action-bar': {
      display: 'flex',
      alignItems: 'center',
      paddingTop: token.paddingSM
    },

    '.token-action-bar-label': {
      paddingLeft: token.paddingXS,
      paddingRight: token.padding,
      fontSize: token.fontSizeLG,
      lineHeight: token.lineHeightLG,
      fontWeight: token.headingFontWeight,
      flex: 1
    },

    '.__scroll-container': {
      paddingTop: token.paddingXXS,
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.__upper-block-wrapper': {
      position: 'absolute',
      zIndex: 10,
      height: 218,
      top: 0,
      left: 0,
      right: 0,
      transition: 'opacity 0.1s, padding-top 0.27s ease, height 0.1s ease',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      backgroundColor: token.colorWhite
    },

    '.tokens-upper-block': {
      flex: 1
    },

    '.__scrolling-block': {
      display: 'none'
    },

    '.token-balance-detail-item': {
      marginBottom: token.sizeXS
    }
  });
});

export default Tokens;
