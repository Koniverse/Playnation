// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWStorage } from '@subwallet/extension-base/storage';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ON_CHAIN_PROFILE_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { Theme } from '@subwallet/extension-koni-ui/themes';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Confetti } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

type Props = ThemeProps & {
  onSubmitAddressLinking: (address?: string) => void;
}
const apiSDK = BookaSdk.instance;
const cloudStorage = SWStorage.instance;
const cloudStorageKey = 'on-chain-profile-modal';
const modalId = ON_CHAIN_PROFILE_MODAL;

function Component ({ className, onSubmitAddressLinking }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { wcAccount } = useSelector((state) => state.accountState);
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;
  const [loading] = useState(false);

  const onCheckingLinkedAccount = useCallback(() => {
    const func = async () => {
      await cloudStorage.setItem(cloudStorageKey, 'showed');

      const addressMinted = await apiSDK.getMintedAddress();

      if (addressMinted) {
        await apiSDK.setAccountAddress(addressMinted);
        await apiSDK.getStatsOfAddress();
        inactiveModal(modalId);
      } else {
        inactiveModal(modalId);
        const _wcAddress = wcAccount?.address;

        if (_wcAddress) {
          onSubmitAddressLinking(_wcAddress);
        }
      }
    };

    func().catch(console.error);
  }, [inactiveModal, onSubmitAddressLinking, wcAccount?.address]);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onCheckingLinkedAccount}
          shape={'round'}
        >
          {t('Got it')}
        </Button>
      </>
    );
  }, [loading, onCheckingLinkedAccount, t]);

  return (
    <SwModal
      className={CN(className)}
      closable={true}
      footer={footerModal}
      id={modalId}
      onCancel={onCheckingLinkedAccount}
      title={t('Integrated profile is live!')}
    >
      <div className='ant-sw-modal-confirm-body'>
        <div className={'__icon-modal'}>
          <Icon
            customSize={'60px'}
            iconColor={token.colorIconHover}
            phosphorIcon={Confetti}
            size='md'
            weight={'fill'}
          />
        </div>
        <div className={'__description-modal'}>
          <div className={'__title-modal'}>{t('View your on-chain stats with ease')}</div>
          <ul
            className={'__sub-title-modal'}
          >
            <li>{t('Integrated profile is a new feature that records your account\'s information based on on-chain activities\n')}</li>
            <li>{t('With this feature, your Telegram ID can only be linked to one account. This account will be used for all on-chain missions linked with your Telegram ID')}</li>
          </ul>
        </div>
      </div>
    </SwModal>
  );
}

const OnChainProfileModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    padding: 0,
    maxHeight: '100%',
    marginBottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',

    '.ant-sw-modal-body': {
      padding: `${token.padding}px ${token.paddingXS}px`
    },

    '.ant-sw-modal-confirm-body': {
      background: extendToken.colorBgGradient,
      borderRadius: 24,
      padding: `${token.paddingXL}px ${token.paddingMD}px`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.paddingLG,

      '.ant-sw-modal-confirm-content': {
        padding: 0,
        margin: 0
      }
    },

    '.ant-sw-sub-header-container': {
      flexDirection: 'row-reverse',

      '.ant-sw-header-left-part': {
        marginRight: token.marginXS
      }
    },

    '.__icon-modal': {
      borderRadius: '50%',
      padding: token.paddingLG - 2,
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: token.colorWhite,
      width: 104,
      height: 104
    },

    '.__description-modal': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: token.size
    },

    '.__title-modal': {
      fontSize: token.fontSizeHeading5,
      lineHeight: token.lineHeightHeading5,
      color: token.colorText,
      fontWeight: 600
    },

    '.__sub-title-modal': {
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      fontWeight: 500,
      color: token.colorTextDark2,
      paddingInlineStart: token.paddingSM,

      li: {
        listStyle: 'inside',
        textAlign: 'center'
      }
    },

    '.ant-sw-modal-footer': {
      borderTop: 'none',
      paddingTop: token.paddingXS
    },

    '.ant-sw-modal-confirm-btns': {
      flexDirection: 'row',

      '.ant-btn': {
        flex: 1
      }
    }
  };
});

export default OnChainProfileModal;
