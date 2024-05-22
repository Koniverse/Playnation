// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Progress } from '@subwallet/react-ui';
import React from 'react';
import styled from 'styled-components';

type GameEnergyProps = ThemeProps & {
  maxEnergy?: number;
  currentEnergy: number
};

function Component ({ className, currentEnergy, maxEnergy }: GameEnergyProps) {
  return (
    <Progress
      className={className}
      percent={maxEnergy ? (currentEnergy / maxEnergy * 100) : 0}
      showInfo={false}
      status={'active'}
      type={'line'}
    />
  );
}

export const GameEnergyBar = styled(Component)<GameEnergyProps>(({ theme: { token } }: GameEnergyProps) => {
  return ({
    marginRight: 0,
    marginBottom: 0,

    '&, .ant-progress-outer, .ant-progress-inner': {
      display: 'block'
    }
  });
});

export default GameEnergyBar;
