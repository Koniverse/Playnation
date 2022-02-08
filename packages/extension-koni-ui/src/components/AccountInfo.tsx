// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { Recoded, ThemeProps } from '../types';

import { faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import styled from 'styled-components';

import cloneLogo from '@polkadot/extension-koni-ui/assets/clone.svg';
import Identicon from '@polkadot/extension-koni-ui/components/Identicon';
import { defaultRecoded, recodeAddress } from '@polkadot/extension-koni-ui/util';
import getNetworkInfoByGenesisHash from '@polkadot/extension-koni-ui/util/getNetworkInfoByGenesisHash';

import useToast from '../hooks/useToast';
import useTranslation from '../hooks/useTranslation';
import getParentNameSuri from '../util/getParentNameSuri';
import { AccountContext } from './contexts';

export interface Props {
  address?: string | null;
  className?: string;
  genesisHash?: string | null;
  name?: string | null;
  parentName?: string | null;
  suri?: string;
  showCopyBtn?: boolean
  type?: KeypairType;
}

function AccountInfo ({ address, className, genesisHash, name, parentName, showCopyBtn = true, suri, type: givenType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const [{ account,
    formatted,
    genesisHash: recodedGenesis,
    isEthereum,
    prefix }, setRecoded] = useState<Recoded>(defaultRecoded);
  const networkInfo = getNetworkInfoByGenesisHash(genesisHash || recodedGenesis);
  const { show } = useToast();
  const accountName = name || account?.name;
  const displayName = accountName || t('<unknown>');

  useEffect((): void => {
    if (!address) {
      setRecoded(defaultRecoded);

      return;
    }

    setRecoded(recodeAddress(address, accounts, networkInfo, givenType));
  }, [accounts, address, networkInfo, givenType]);

  const iconTheme = (
    isEthereum
      ? 'ethereum'
      : (networkInfo?.icon || 'polkadot')
  ) as IconTheme;

  const _onCopy = useCallback(
    () => show(t('Copied')),
    [show, t]
  );

  const toShortAddress = (_address: string | null, halfLength?: number) => {
    const address = (_address || '').toString();

    const addressLength = halfLength || 7;

    return address.length > 13 ? `${address.slice(0, addressLength)}…${address.slice(-addressLength)}` : address;
  };

  const parentNameSuri = getParentNameSuri(parentName, suri);

  return (
    <div className={className}>
      <div className='account-info-row'>
        <Identicon
          className='account-info-identity-icon'
          iconTheme={iconTheme}
          prefix={prefix}
          size={32}
          value={formatted || address}
        />
        <div className='account-info'>
          {parentName
            ? (
              <>
                <div className='account-info-derive-name'>
                  <FontAwesomeIcon
                    className='account-info-derive-icon'
                    icon={faCodeBranch}
                  />
                  <div
                    className='account-info-parent-name'
                    data-field='parent'
                    title={parentNameSuri}
                  >
                    {parentNameSuri}
                  </div>
                </div>
                <div className='account-info__name displaced'>
                  <span title={displayName}>{displayName}</span>
                </div>
              </>
            )
            : (
              <div
                className='account-info__name'
                data-field='name'
              >
                <span title={displayName}>{displayName}</span>
              </div>
            )
          }
          {networkInfo?.genesisHash && (
            <div
              className='account-info-banner account-info-chain'
              data-field='chain'
            >
              {networkInfo.chain.replace(' Relay Chain', '')}
            </div>
          )}
          <div className='account-info-address-display'>
            <div
              className='account-info-full-address'
              data-field='address'
            >
              {toShortAddress(formatted || address || t('<unknown>'), 10)}
            </div>
            {showCopyBtn && <CopyToClipboard text={(formatted && formatted) || ''}>
              <img
                alt='copy'
                className='account-info-copy-icon'
                onClick={_onCopy}
                src={cloneLogo}
              />
            </CopyToClipboard>}
          </div>
        </div>
      </div>
    </div>

  );
}

export default styled(AccountInfo)(({ theme }: ThemeProps) => `
  .account-info-banner {
    font-size: 12px;
    line-height: 16px;
    position: absolute;
    top: 10px;

    &.account-info-chain {
      background: ${theme.chainBackgroundColor};
      border-radius: 4px;
      color: ${theme.chainTextColor};
      font-size: 15px;
      line-height: 24px;
      padding: 0 8px;
      right: 15px;
      z-index: 1;
    }
  }

  .account-info-derive-name {
    font-size: 12px;
    line-height: 16px;
    position: absolute;
    top: 0;
  }

  .account-info-address-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .account-info-address-display .svg-inline--fa {
    width: 14px;
    height: 14px;
    margin-right: 10px;
    color: ${theme.accountDotsIconColor};
    &:hover {
      color: ${theme.labelColor};
      cursor: pointer;
    }
  }

  .account-info-identity-icon {
    border: 2px solid ${theme.checkDotColor};
    margin-right: 10px;
  }

  .account-info {
    width: 100%;
  }

  .account-info-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    height: 72px;
    border-radius: 4px;
  }

  .account-info__name {
    font-size: 15px;
    line-height: 24px;
    font-weight: 500;
    color: ${theme.textColor};
    margin: 2px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    // width: 300px;
    white-space: nowrap;

    &.displaced {
      padding-top: 10px;
    }
  }

  .account-info-parent-name {
    position: absolute;
    color: ${theme.labelColor};
    overflow: hidden;
    padding: 2px 0 0 0.8rem;
    text-overflow: ellipsis;
    width: 270px;
    white-space: nowrap;
  }

  .account-info-full-address {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 225px;
    color: ${theme.textColor2};
    font-size: 14px;
    line-height: 24px;
    font-weight: 400;
  }

  .account-info-copy-icon {
    cursor: pointer;
  }

  .account-info-derive-icon {
    color: ${theme.labelColor};
    position: absolute;
    top: 5px;
    width: 9px;
    height: 9px;
  }
`);