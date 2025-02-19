// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PWAWelcome from '@subwallet/extension-koni-ui/components/Modal/PWA/PWAWelcome';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ACCESS_HOME_SCREEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useContext, useEffect, useState } from 'react';
import { Props } from 'react-select';
import styled from 'styled-components';

const sdk = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  const [account, setAccount] = useState<BookaAccount | undefined>();
  const { activeModal } = useContext(ModalContext);

  useEffect(() => {
    sdk.subscribeAccount().subscribe((account) => {
      setAccount(account);
    });
  }, []);

  useEffect(() => {
    if (account?.otp) {
      activeModal(ACCESS_HOME_SCREEN_MODAL);
    }
  }, [account?.otp, activeModal]);

  return (
    <div className={CN(className, 'loading-layer')}>
      {account?.otp && <PWAWelcome otp={account?.otp} />}
    </div>
  );
};

const LoginPWAConfirm = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)'
  };
});

export default LoginPWAConfirm;
