// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CountDownProps {
  prefix?: string;
  completedText?: string;
  targetTime: number;
}

const ONE_SECOND = 1000; // 1 second in milliseconds

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const CountDown: React.FC<CountDownProps> = ({ completedText, prefix, targetTime }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateCountdown = useCallback(() => {
    const now = Date.now();
    const timeDifference = targetTime - now;

    if (timeDifference <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setTimeLeft(null);
    } else {
      const minutes = Math.floor((timeDifference / (ONE_SECOND * 60)) % 60);
      const hours = Math.floor((timeDifference / (ONE_SECOND * 60 * 60)) % 24);
      const days = Math.floor(timeDifference / (ONE_SECOND * 60 * 60 * 24));

      setTimeLeft({ days, hours, minutes });
    }
  }, [targetTime]);

  useEffect(() => {
    updateCountdown();
    intervalRef.current = setInterval(updateCountdown, ONE_SECOND * 60);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateCountdown]);

  return (
    <div>
      {timeLeft
        ? (
          <>
            {prefix && <span>{prefix}</span>}
            {timeLeft.days > 0 && <span>{timeLeft.days} d </span>}
            {timeLeft.hours > 0 && <span>{timeLeft.hours} h </span>}
            {timeLeft.minutes > 0 && <span>{timeLeft.minutes} m </span>}
          </>
        )
        : (
          completedText && <span>{completedText}</span>
        )}
    </div>
  );
};

export default CountDown;
