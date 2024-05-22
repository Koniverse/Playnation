// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const ONE_SECOND = 1000; // 1 second in milliseconds
const regenSeconds = 60;
const regenTime = ONE_SECOND * regenSeconds;

export function useGetEnergyInfo ({ energy, maxEnergy, startTime }: {
  startTime?: string,
  energy?: number,
  maxEnergy?: number
}) {
  const [currentEnergy, setCurrentEnergy] = useState(energy || 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRegen = useMemo(() => {
    try {
      return startTime ? new Date(startTime).getTime() : Date.now();
    } catch (e) {
      return Date.now();
    }
  }, [startTime]);

  const updateEnergy = useCallback(() => {
    if (!maxEnergy || !energy) {
      return;
    }

    const now = Date.now();
    const diff = now - startRegen;
    const recovered = Math.floor(diff / regenTime);
    const e = Math.min(maxEnergy, energy + recovered);

    if (e >= maxEnergy) {
      setCurrentEnergy(maxEnergy);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      setCurrentEnergy(recovered + energy);
    }
  }, [energy, maxEnergy, startRegen]);

  useEffect(() => {
    intervalRef.current = setInterval(updateEnergy, ONE_SECOND);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateEnergy]);

  return {
    currentEnergy
  };
}
