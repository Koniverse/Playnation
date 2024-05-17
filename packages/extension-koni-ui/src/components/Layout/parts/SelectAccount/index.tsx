// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson, CurrentAccountInfo } from '@subwallet/extension-base/background/types';
import { SimpleQrModal } from '@subwallet/extension-koni-ui/components/Modal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { DISCONNECT_EXTENSION_MODAL, SELECT_ACCOUNT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useGoBackSelectAccount, useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { saveCurrentAccountAddress } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, findAccountByAddress, funcSortByName, isAccountAll, searchAccountFunction } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Image, ModalContext, SelectModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { AccountBriefInfo, AccountCardItem, AccountItemWithName } from '../../../Account';
import { GeneralEmptyList } from '../../../EmptyList';

type Props = ThemeProps

const renderEmpty = () => <GeneralEmptyList />;

const modalId = SELECT_ACCOUNT_MODAL;
const simpleQrModalId = 'simple-qr-modal-id';
const apiSDK = BookaSdk.instance;
const rankIconMap: Record<string, string> = {
  iron: '/images/ranks/iron.svg',
  bronze: '/images/ranks/bronze.svg',
  silver: '/images/ranks/silver.svg',
  gold: '/images/ranks/gold.svg',
  platinum: '/images/ranks/platinum.svg',
  diamond: '/images/ranks/diamond.svg'
};

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { goHome } = useDefaultNavigate();
  const notify = useNotification();

  const [gameAccount, setGameAccount] = useState(apiSDK.account);

  const { accounts: _accounts, currentAccount } = useSelector((state: RootState) => state.accountState);

  const [selectedQrAddress, setSelectedQrAddress] = useState<string | undefined>();

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setGameAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const accounts = useMemo((): AccountJson[] => {
    const result = [..._accounts].sort(funcSortByName);
    const all = result.find((acc) => isAccountAll(acc.address));

    if (all) {
      const index = result.indexOf(all);

      result.splice(index, 1);
      result.unshift(all);
    }

    if (!!currentAccount?.address && (currentAccount?.address !== (all && all.address))) {
      const currentAccountIndex = result.findIndex((item) => {
        return item.address === currentAccount?.address;
      });

      if (currentAccountIndex > -1) {
        const _currentAccount = result[currentAccountIndex];

        result.splice(currentAccountIndex, 1);
        result.splice(1, 0, _currentAccount);
      }
    }

    return result;
  }, [_accounts, currentAccount?.address]);

  const noAllAccounts = useMemo(() => {
    return accounts.filter(({ address }) => !isAccountAll(address));
  }, [accounts]);

  const showAllAccount = useMemo(() => {
    return noAllAccounts.length > 1;
  }, [noAllAccounts]);

  const _onSelect = useCallback((address: string) => {
    if (address) {
      const accountByAddress = findAccountByAddress(accounts, address);

      if (accountByAddress) {
        const accountInfo = {
          address: address
        } as CurrentAccountInfo;

        saveCurrentAccountAddress(accountInfo).then(() => {
          const pathName = location.pathname;
          const locationPaths = location.pathname.split('/');

          if (locationPaths) {
            if (locationPaths[1] === 'home') {
              if (locationPaths.length >= 3) {
                if (pathName.startsWith('/home/nfts')) {
                  navigate('/home/nfts/collections');
                } else if (pathName.startsWith('/home/tokens/detail')) {
                  navigate('/home/tokens');
                } else {
                  navigate(`/home/${locationPaths[2]}`);
                }
              }
            } else {
              goHome();
            }
          }
        }).catch((e) => {
          console.error('Failed to switch account', e);
        });
      } else {
        console.error('Failed to switch account');
      }
    }
  }, [accounts, location.pathname, navigate, goHome]);

  const onClickDetailAccount = useCallback((address: string) => {
    return () => {
      inactiveModal(modalId);
      setTimeout(() => {
        navigate(`/accounts/detail/${address}`);
      }, 100);
    };
  }, [navigate, inactiveModal]);

  const openDisconnectExtensionModal = useCallback(() => {
    activeModal(DISCONNECT_EXTENSION_MODAL);
  }, [activeModal]);

  const onClickItemQrButton = useCallback((address: string) => {
    setSelectedQrAddress(address);
    activeModal(simpleQrModalId);
  }, [activeModal]);

  const onCopyCurrent = useCallback(() => {
    copyToClipboard(currentAccount?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [currentAccount?.address, notify, t]);

  const onQrModalBack = useGoBackSelectAccount(simpleQrModalId);

  const renderItem = useCallback((item: AccountJson, _selected: boolean): React.ReactNode => {
    const currentAccountIsAll = isAccountAll(item.address);

    if (currentAccountIsAll) {
      if (showAllAccount) {
        return (
          <AccountItemWithName
            address={item.address}
            className='all-account-selection'
            isSelected={_selected}
          />
        );
      } else {
        return null;
      }
    }

    const isInjected = !!item.isInjected;

    return (
      <AccountCardItem
        accountName={item.name || ''}
        address={item.address}
        className={className}
        genesisHash={item.genesisHash}
        isSelected={_selected}
        onClickQrButton={onClickItemQrButton}
        onPressMoreButton={isInjected ? openDisconnectExtensionModal : onClickDetailAccount(item.address)}
        source={item.source}
      />
    );
  }, [className, onClickDetailAccount, openDisconnectExtensionModal, onClickItemQrButton, showAllAccount]);

  const renderSelectedItem = useCallback((item: AccountJson): React.ReactNode => {
    return (
      <AccountBriefInfo
        account={item}
        className='selected-account'
      />
    );
  }, []);

  return (
    <div className={CN(className, 'global-account-info')}>
      <Button
        icon={(
          <Image
            src={rankIconMap[gameAccount?.attributes.rank || 'iron']}
            width={20}
          />
        )}
        size={'xs'}
        type={'ghost'}
      />

      <SelectModal
        background={'default'}
        className={className}
        id={modalId}
        ignoreScrollbarMethod='padding'
        inputWidth={'100%'}
        itemKey='address'
        items={accounts}
        onSelect={_onSelect}
        renderItem={renderItem}
        renderSelected={renderSelectedItem}
        renderWhenEmpty={renderEmpty}
        searchFunction={searchAccountFunction}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('Account name')}
        selected={currentAccount?.address || ''}
        shape='round'
        size='small'
        title={t('Select account')}
      />

      <Button
        className={'__copy-button'}
        icon={(
          <Icon
            phosphorIcon={Copy}
            size={'xs'}
            weight={'fill'}
          />
        )}
        onClick={onCopyCurrent}
        size={'xs'}
        type={'ghost'}
      />

      <SimpleQrModal
        address={selectedQrAddress}
        id={simpleQrModalId}
        onBack={onQrModalBack}
      />
    </div>
  );
}

const SelectAccount = styled(Component)<Props>(({ theme }) => {
  const { token } = theme as Theme;

  return ({
    '&.global-account-info': {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 'auto',
      alignItems: 'center',

      '.account-name.account-name': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight
      },

      '.ant-select-modal-input-container': {
        width: 'auto !important',
        marginLeft: -token.marginXXS,
        marginRight: -token.marginXXS
      },

      '.ant-select-modal-input-container.ant-select-modal-input-border-round::before': {
        display: 'none'
      },

      '.ant-select-modal-input-container.ant-select-modal-input-bg-default': {
        backgroundColor: 'transparent'
      },

      '.ant-select-modal-input-container.ant-select-modal-input-size-small .ant-select-modal-input-wrapper': {
        padding: 0
      },

      '.ant-select-modal-input-suffix': {
        display: 'none'
      },

      '.ant-select-modal-input-container:hover .account-name': {
        color: token.colorTextDark3
      },

      '.selected-account': {
        gap: token.sizeXXS
      },

      '.__copy-button': {
        color: token.colorTextDark4
      }
    },

    '&.ant-sw-modal': {
      '.ant-sw-modal-body': {
        marginBottom: 0
      },

      '.ant-sw-list-search-input': {
        paddingBottom: token.paddingXS
      },

      '.ant-sw-modal-footer': {
        marginTop: 0
      },

      '.ant-account-card': {
        padding: token.paddingSM
      },

      '.ant-web3-block .ant-web3-block-middle-item': {
        textAlign: 'initial'
      },

      '.all-account-selection': {
        cursor: 'pointer',
        borderRadius: token.borderRadiusLG,
        transition: `background ${token.motionDurationMid} ease-in-out`,

        '.account-item-name': {
          fontSize: token.fontSizeHeading5,
          lineHeight: token.lineHeightHeading5
        },

        '&:hover': {
          background: token.colorBgInput
        }
      },

      '.ant-account-card-name': {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        'white-space': 'nowrap',
        maxWidth: 120
      },

      '.ant-input-container .ant-input': {
        color: token.colorTextLight1
      }
    },

    '.all-account-item': {
      display: 'flex',
      padding: `${token.paddingSM + 2}px ${token.paddingSM}px`,
      cursor: 'pointer',
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: token.sizeXS,

      '&:hover': {
        backgroundColor: token.colorBgInput
      },

      '.selected': {
        color: token['cyan-6']
      }
    },

    '.ant-select-modal-input-container': {
      overflow: 'hidden'
    },

    '.connect-icon': {
      color: token.colorTextBase,
      width: 40,
      height: 40,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer'
    }
  });
});

export default SelectAccount;
