// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { GameAccountAvatar } from '@subwallet/extension-koni-ui/components';
import InviteCTA from '@subwallet/extension-koni-ui/components/Invite/InviteCTA';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useNotification, useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import { Copy } from 'phosphor-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {showAccountAddress} from "@subwallet/extension-koni-ui/constants";

type Props = ThemeProps;
const apiSDK = BookaSdk.instance;

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const accountJson = accounts.find((account) => account.address !== ALL_ACCOUNT_KEY);
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const notify = useNotification();
  const { t } = useTranslation();

  useSetCurrentPage('/home/account');

  const onCopyAddress = useCallback(() => {
    copyToClipboard(accountJson?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [accountJson?.address, notify, t]);

  const currentPoint = account?.attributes.accumulatePoint || 0;

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>
      <div className='account-info-area'>
        <GameAccountAvatar
          avatarPath={account?.info.photoUrl || undefined}
          className={'account-avatar'}
          hasBoxShadow
          size={7}
        />

        <div className='account-name'>{accountJson?.name}</div>
        {showAccountAddress && <div className='account-address-wrapper'>
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
        </div>}
      </div>

      <div className='block-info-card'>
        <div className='account-detail-area'>
          <div className='__title'>
            Your Story Point (SP)
          </div>
          <div className='__point'>
            {currentPoint}
          </div>
        </div>
        <div className={'separator'}>
          <div className='__left'></div>
          <div className='__center'>
            <hr />
          </div>
          <div className='__right'></div>
        </div>
        <InviteCTA hideCopyLink={true} />
      </div>
    </div>
  );
};

const AccountDetail = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    // account
    paddingTop: token.paddingXXS,
    paddingLeft: token.paddingXS,
    paddingRight: token.paddingXS,
    paddingBottom: 24,

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

    '.account-detail-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      background: token.colorWhite,
      borderRadius: '20px 20px 0 0',
      paddingTop: 24,
      paddingBottom: 24,

      '.__title': {
        fontSize: 20,
        marginBottom: 24
      },

      '.__point': {
        fontSize: 44,
        fontWeight: 700
      }
    },

    '.invitation-area': {
      paddingTop: token.paddingXS,
      borderRadius: '0 0 20px 20px'
    },

    '.block-info-card .separator': {
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',

      '.__left, .__right, .__center': {
        height: 32,
        backgroundColor: token.colorWhite
      },

      '.__left, .__right': {
        width: 32
      },

      '.__center': {
        flex: 1
      },

      '.__left': {
        clipPath: 'path("M 0 0 L 32 0 L 32 32 L 0 32 L 0 31 C 16 28 16 4 0 1 L 0 0 Z")'
      },

      '.__right': {
        clipPath: 'path("M 0 0 L 32 0 L 32 1 C 16 4 16 28 32 31 L 32 32 L 0 32 L 0 0 Z")'
      },

      hr: {
        border: 0,
        width: '93%',
        marginTop: 15,
        borderTop: '1px dashed rgba(31, 31, 35, 0.12)'
      }
    }
  };
});

export default AccountDetail;
