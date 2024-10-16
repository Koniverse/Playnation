// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EmptyList, PageWrapper } from '@subwallet/extension-koni-ui/components';
import { AccountSelectorModal } from '@subwallet/extension-koni-ui/components/Modal/AccountSelectorModal';
import ReceiveQrModal from '@subwallet/extension-koni-ui/components/Modal/ReceiveModal/ReceiveQrModal';
import { TokensSelectorModal } from '@subwallet/extension-koni-ui/components/Modal/ReceiveModal/TokensSelectorModal';
import { TokenGroupBalanceItem } from '@subwallet/extension-koni-ui/components/TokenItem/TokenGroupBalanceItem';
import { CUSTOMIZE_MODAL, DEFAULT_TRANSFER_PARAMS, TRANSFER_TRANSACTION } from '@subwallet/extension-koni-ui/constants';
import { DataContext } from '@subwallet/extension-koni-ui/contexts/DataContext';
import { HomeContext } from '@subwallet/extension-koni-ui/contexts/screen/HomeContext';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import useNotification from '@subwallet/extension-koni-ui/hooks/common/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import useReceiveQR from '@subwallet/extension-koni-ui/hooks/screen/home/useReceiveQR';
import { UpperBlock } from '@subwallet/extension-koni-ui/Popup/Home/Tokens/UpperBlock';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps, TransferParams } from '@subwallet/extension-koni-ui/types';
import { TokenBalanceItemType } from '@subwallet/extension-koni-ui/types/balance';
import { isAccountAll, openInNewTab, sortTokenByValue } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext, SwAlert } from '@subwallet/react-ui';
import classNames from 'classnames';
import { Coins, FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = ThemeProps;

const GlobalSearchTokenModalId = 'globalSearchToken';

const Component = (): React.ReactElement => {
  useSetCurrentPage('/home/games');
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);
  const { setContainerClass } = useContext(HomeContext);
  const [isShrink, setIsShrink] = useState<boolean>(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);
  const { accountBalance: { tokenGroupBalanceMap,
    totalBalanceInfo }, tokenGroupStructure: { sortedTokenGroups } } = useContext(HomeContext);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);
  const notify = useNotification();
  const { accountSelectorItems,
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    selectedAccount,
    selectedNetwork,
    tokenSelectorItems } = useReceiveQR();

  const isZkModeSyncing = useSelector((state: RootState) => state.mantaPay.isSyncing);
  const zkModeSyncProgress = useSelector((state: RootState) => state.mantaPay.progress);
  const [, setStorage] = useLocalStorage<TransferParams>(TRANSFER_TRANSACTION, DEFAULT_TRANSFER_PARAMS);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const topPosition = event.currentTarget.scrollTop;

    if (topPosition > 80) {
      setIsShrink((value) => {
        if (!value && topBlockRef.current && containerRef.current) {
          const containerProps = containerRef.current.getBoundingClientRect();

          topBlockRef.current.style.position = 'fixed';
          topBlockRef.current.style.top = `${Math.floor(containerProps.top)}px`;
          topBlockRef.current.style.left = `${containerProps.left}px`;
          topBlockRef.current.style.right = `${containerProps.right}px`;
          topBlockRef.current.style.width = `${containerProps.width}px`;
          topBlockRef.current.style.opacity = '0';
          topBlockRef.current.style.paddingTop = '0';

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
          topBlockRef.current.style.paddingTop = '0';

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

    if (topPosition > 80) {
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

  const isTotalBalanceDecrease = totalBalanceInfo.change.status === 'decrease';

  const onClickItem = useCallback((item: TokenBalanceItemType) => {
    return () => {
      navigate(`/home/tokens/detail/${item.slug}`);
    };
  }, [navigate]);

  const onClickManageToken = useCallback(() => {
    navigate('/settings/tokens/manage');
  }, [navigate]);

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
      from: address
    });
    navigate('/transaction/send-fund');
  },
  [currentAccount, navigate, notify, t, setStorage]
  );

  const onOpenBuyTokens = useCallback(() => {
    navigate('/buy-tokens');
  },
  [navigate]
  );

  const onOpenSwap = useCallback(() => {
    openInNewTab('https://web.subwallet.app/redirect-handler/swap')();
  }, []);

  const tokenGroupBalanceItems = useMemo<TokenBalanceItemType[]>(() => {
    const result: TokenBalanceItemType[] = [];

    sortedTokenGroups.forEach((tokenGroupSlug) => {
      if (tokenGroupBalanceMap[tokenGroupSlug]) {
        result.push(tokenGroupBalanceMap[tokenGroupSlug]);
      }
    });

    return result.sort(sortTokenByValue);
  }, [sortedTokenGroups, tokenGroupBalanceMap]);

  const onOpenGlobalSearchToken = useCallback(() => {
    activeModal(GlobalSearchTokenModalId);
  }, [activeModal]);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

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
      className={'tokens-screen-container'}
      onScroll={handleScroll}
      ref={containerRef}
    >
      <div
        className={classNames('__upper-block-wrapper', {
          '-is-shrink': isShrink,
          '-decrease': isTotalBalanceDecrease
        })}
        ref={topBlockRef}
      >
        <UpperBlock
          isPriceDecrease={isTotalBalanceDecrease}
          isShrink={isShrink}
          onOpenBuyTokens={onOpenBuyTokens}
          onOpenReceive={onOpenReceive}
          onOpenSendFund={onOpenSendFund}
          onOpenSwap={onOpenSwap}
          totalChangePercent={totalBalanceInfo.change.percent}
          totalChangeValue={totalBalanceInfo.change.value}
          totalValue={totalBalanceInfo.convertedValue}
        />

        <div className='token-action-bar'>
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
          isZkModeSyncing && (
            <SwAlert
              className={classNames('zk-mode-alert-area')}
              description={t('This may take a few minutes. Please keep the app open')}
              title={t('Zk mode is syncing: {{percent}}%', { replace: { percent: zkModeSyncProgress || '0' } })}
              type={'warning'}
            />
          )
        }

        {
          tokenGroupBalanceItems.map((item) => {
            return (
              <TokenGroupBalanceItem
                key={item.slug}
                {...item}
                onPressItem={onClickItem(item)}
              />
            );
          })
        }
        {
          !tokenGroupBalanceItems.length && (
            <EmptyList
              className={'__empty-list'}
              emptyMessage={t('Try searching or importing one')}
              emptyTitle={t('No tokens found')}
              phosphorIcon={Coins}
            />
          )
        }
        <div className={'__scroll-footer'}>
          <Button
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={FadersHorizontal}
              />
            )}
            onClick={onClickManageToken}
            size={'xs'}
            type={'ghost'}
          >
            {t('Manage tokens')}
          </Button>
        </div>
      </div>

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
};

const WrapperComponent = ({ className = '' }: ThemeProps): React.ReactElement<Props> => {
  const dataContext = useContext(DataContext);

  return (
    <PageWrapper
      className={`tokens ${className}`}
      hideLoading={true}
      resolve={dataContext.awaitStores(['price', 'chainStore', 'assetRegistry', 'balance', 'mantaPay'])}
    >
      <Component />
    </PageWrapper>
  );
};

const Tokens = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return ({
    overflow: 'hidden',

    '.__empty-list': {
      marginTop: token.marginSM,
      marginBottom: token.marginSM
    },

    '.tokens-screen-container': {
      height: '100%',
      fontSize: token.fontSizeLG,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingTop: 310,
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
      height: 310,
      zIndex: 10,
      top: 0,
      left: 0,
      width: '100%',
      transition: 'opacity 0.1s, padding-top 0.27s ease, height 0.1s ease',
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      backgroundColor: token.colorWhite,

      '&.-is-shrink': {
        height: 218
      }
    },

    '.tokens-upper-block': {
      flex: 1
    },

    '.__scroll-footer': {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: token.size
    },

    '.token-group-balance-item': {
      marginBottom: token.sizeXXS
    },

    '.__upper-block-wrapper.-is-shrink': {
      '.__static-block': {
        display: 'none'
      },

      '.__scrolling-block': {
        display: 'flex'
      }
    },

    '.zk-mode-alert-area': {
      marginBottom: token.marginXS
    }
  });
});

export default Tokens;
