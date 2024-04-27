// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Progress } from '@subwallet/react-ui';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

type GameEnergyProps = ThemeProps & {
  className?: string;
  startTime: string;
  energy: number;
};

const maxEnergy = 300;
const ONE_SECOND = 1000; // 1 second in milliseconds
const regenSeconds = 60;
const regenTime = ONE_SECOND * regenSeconds;

function _GameEnergy ({ className, energy, startTime }: GameEnergyProps) {
  const [countdown, setCountdown] = useState<number | undefined>();
  const [currentEnergy, setCurrentEnergy] = useState(energy);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRegen = useMemo(() => {
    try {
      return new Date(startTime).getTime();
    } catch (e) {
      return Date.now();
    }
  }, [startTime]);

  const updateEnergy = useCallback(() => {
    const now = Date.now();
    const diff = now - startRegen;
    const recovered = Math.floor(diff / regenTime);
    const remainingTime = Math.floor((regenTime - (diff % regenTime)) / ONE_SECOND);
    const e = Math.min(maxEnergy, energy + recovered);

    if (e >= maxEnergy) {
      setCurrentEnergy(maxEnergy);
      setCountdown(undefined);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setCurrentEnergy(recovered + energy);
      setCountdown(remainingTime);
    }
  }, [energy, startRegen]);

  useEffect(() => {
    intervalRef.current = setInterval(updateEnergy, ONE_SECOND);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateEnergy]);

  return <div className={className}>
    <Progress
      percent={currentEnergy / maxEnergy * 100}
      showInfo={false}
      status={'active'}
      type={'line'}
    />
    <div className={'energy-info'}>
      <div className={'__left'}>
        {countdown === undefined ? `+1 every ${regenSeconds}s` : `${countdown} s`}
      </div>
      <div className={'__right'}>
        <span>Energy: {currentEnergy} / {maxEnergy}</span>
      </div>
    </div>
  </div>;
}

export const GameEnergy = styled(_GameEnergy)<GameEnergyProps>(({ theme: { token } }: GameEnergyProps) => {
  return ({
    '.energy-info': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: `${token.paddingXXS} ${token.paddingXS}`,
      fontSize: token.fontSizeSM,
      color: token.colorTextSecondary,

      '.__left': {
        flex: 1
      },

      '.__right': {
        marginLeft: token.marginXS
      }
    }
  });
});

export default GameEnergy;
