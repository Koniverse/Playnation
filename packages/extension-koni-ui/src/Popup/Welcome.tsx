// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

function Component ({ className }: Props): React.ReactElement<Props> {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/accounts/new-seed-phrase');
    }, 1000);
  }, [navigate]);

  return (
    <Layout.Base
      className={CN(className)}
    >
      <></>
    </Layout.Base>
  );
}

const Welcome = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {

  };
});

export default Welcome;
