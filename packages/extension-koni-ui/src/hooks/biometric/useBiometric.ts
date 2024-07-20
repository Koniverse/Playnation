// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';

const telegramConnector = TelegramConnector.instance;

export default function useBiometric() {
  const [supportBiometric, setSupportBiometric] = useState(false);
  const [usingBiometric, setUsingBiometric] = useState(false);


  useEffect(() => {
    telegramConnector.isBiometricAvailable().then((res) => {
      setSupportBiometric(res);
    }).catch(console.error);

    telegramConnector.checkUsingBiometric().then((res) => {
      setUsingBiometric(res);
    }).catch(console.error);
  }, []);

  return {
    supportBiometric,
    usingBiometric,
    setToken: telegramConnector.setBiometricToken.bind(telegramConnector),
    getToken: telegramConnector.getBiometricToken.bind(telegramConnector),
    removeToken: async () => {
      await telegramConnector.setBiometricToken('');
    },
  }
}
