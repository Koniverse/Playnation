// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import PWALogin from '@subwallet/extension-koni-ui/components/Modal/PWA/PWALogin';
import { PWA_WELCOME_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { ModalContext } from '@subwallet/react-ui';
import React, { useContext, useEffect } from 'react';
import { Props } from 'react-select';
import styled from 'styled-components';

const modalId = PWA_WELCOME_MODAL;

const Component = ({ className }: Props): React.ReactElement => {
  const { activeModal } = useContext(ModalContext);

  useEffect(() => {
    activeModal(modalId);
  }, [activeModal]);

  return (
    <div className={className}>
      <PWALogin />
    </div>
  );
};

const LoginSelect = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)'
  };
});

export default LoginSelect;
