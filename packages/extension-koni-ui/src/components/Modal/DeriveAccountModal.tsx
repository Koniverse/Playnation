// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { canDerive } from '@subwallet/extension-base/utils';
import EmptyAccount from '@subwallet/extension-koni-ui/components/Account/EmptyAccount';
import AccountItemWithName from '@subwallet/extension-koni-ui/components/Account/Item/AccountItemWithName';
import { EVM_ACCOUNT_TYPE } from '@subwallet/extension-koni-ui/constants/account';
import { DERIVE_ACCOUNT_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import useNotification from '@subwallet/extension-koni-ui/hooks/useNotification';
import useTranslation from '@subwallet/extension-koni-ui/hooks/useTranslation';
import { deriveAccountV3 } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { searchAccountFunction } from '@subwallet/extension-koni-ui/util/account';
import { Icon, ModalContext, SwList, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { SpinnerGap } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps;

const modalId = DERIVE_ACCOUNT_MODAL;

const renderEmpty = () => <EmptyAccount />;

const renderLoaderIcon = (x: React.ReactNode): React.ReactNode => {
  return (
    <>
      {x}
      <Icon
        className='loader-icon'
        phosphorIcon={SpinnerGap}
        size='sm'
      />
    </>
  );
};

const Component: React.FC<Props> = ({ className }: Props) => {
  const { t } = useTranslation();
  const { token } = useTheme() as Theme;
  const notify = useNotification();

  const { inactiveModal } = useContext(ModalContext);

  const { accounts } = useSelector((state: RootState) => state.accountState);

  const [selected, setSelected] = useState('');

  const filtered = useMemo(
    () => accounts
      .filter(({ isExternal }) => !isExternal)
      .filter(({ isMasterAccount, type }) => canDerive(type) && (type !== EVM_ACCOUNT_TYPE || (isMasterAccount && type === EVM_ACCOUNT_TYPE))),
    [accounts]
  );

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onSelectAccount = useCallback((account: AccountJson): () => void => {
    return () => {
      setSelected(account.address);

      setTimeout(() => {
        deriveAccountV3({
          address: account.address
        }).then(() => {
          inactiveModal(modalId);
        }).catch((e: Error) => {
          notify({
            message: e.message,
            type: 'error'
          });
        }).finally(() => {
          setSelected('');
        });
      }, 500);
    };
  }, [inactiveModal, notify]);

  const renderItem = useCallback((account: AccountJson): React.ReactNode => {
    const disabled = !!selected;
    const isSelected = account.address === selected;

    return (
      <React.Fragment key={account.address}>
        <AccountItemWithName
          accountName={account.name}
          address={account.address}
          avatarSize={token.sizeLG}
          className={CN({ disabled: disabled && !isSelected }) }
          onClick={disabled ? undefined : onSelectAccount(account)}
          renderRightItem={isSelected ? renderLoaderIcon : undefined}
        />
      </React.Fragment>
    );
  }, [onSelectAccount, selected, token.sizeLG]);

  return (
    <SwModal
      className={className}
      id={modalId}
      maskClosable={false}
      onCancel={selected ? undefined : onCancel}
      title={t('Select Account')}
    >
      <SwList.Section
        displayRow={true}
        enableSearchInput={true}
        height='370px'
        list={filtered}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
        rowGap='var(--row-gap)'
        searchFunction={searchAccountFunction}
        searchPlaceholder={t('Account name')}
      />
    </SwModal>
  );
};

const DeriveAccountModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--row-gap': token.sizeXS,

    '.ant-web3-block': {
      display: 'flex !important',

      '.ant-web3-block-right-item': {
        marginRight: 0,

        '.loader-icon': {
          animation: 'spinner-loading 1s infinite linear'
        }
      }
    },

    '.ant-sw-modal-body': {
      padding: `0 0 ${token.padding}px`
    },

    '.disabled': {
      opacity: 0.4,

      '.ant-web3-block': {
        cursor: 'not-allowed',

        '&:hover': {
          backgroundColor: token['gray-1']
        }
      }
    }
  };
});

export default DeriveAccountModal;