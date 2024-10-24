// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  return (
    <div className={className}>

    </div>
  );
};

const MainScreenHeader = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default MainScreenHeader;
