// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { showAccountAddress, smallRankIconMap } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Image } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { AccountBriefInfo } from '../../../Account';

type Props = ThemeProps;
const apiSDK = BookaSdk.instance;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const notify = useNotification();
  const navigate = useNavigate();
  const [gameAccount, setGameAccount] = useState(apiSDK.account);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);

  const onClickAccount = useCallback(() => {
    // navigate(`/accounts/detail/${currentAccount?.address || ''}`);
    navigate('/home/account');
  }, [navigate]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setGameAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const onCopyCurrent = useCallback(() => {
    copyToClipboard(currentAccount?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [currentAccount?.address, notify, t]);

  return (
    <div className={CN(className, 'global-account-info')}>
      {showAccountAddress && <Button
        icon={(
          <Image
            src={smallRankIconMap[gameAccount?.attributes.rank || 'iron']}
            width={20}
          />
        )}
        size={'xs'}
        type={'ghost'}
      />}

      {
        !!currentAccount && (
          <div onClick={onClickAccount}>
            <AccountBriefInfo
              account={currentAccount}
              className='selected-account'
            />
          </div>
        )
      }

      {
        showAccountAddress && <Button
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
      }
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
        gap: token.sizeXXS,
        cursor: 'pointer'
      },

      '.__copy-button': {
        color: token.colorTextDark4
      }
    }
  });
});

export default SelectAccount;
