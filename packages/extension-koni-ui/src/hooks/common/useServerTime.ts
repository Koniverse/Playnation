// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { useEffect, useState } from 'react';

const apiSDK = BookaSdk.instance;

const useServerTime = () => {
  const [serverTime, setServerTime] = useState<number | undefined>();

  useEffect(() => {
    const serverTimeSubject = apiSDK.subscribeServerTime();

    const updateDateTime = (value: number) => {
      setServerTime(value);
    };

    updateDateTime(serverTimeSubject.value);

    const timeSub = serverTimeSubject.subscribe((value) => {
      updateDateTime(value);
    });

    return () => {
      timeSub.unsubscribe();
    };
  }, []);

  return {
    serverTime
  };
};

export default useServerTime;
