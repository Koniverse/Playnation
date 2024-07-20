// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SecurityContext } from '@subwallet/extension-koni-ui/contexts/SecurityContext';
import { useContext } from 'react';

export default function useBiometric () {
  return useContext(SecurityContext);
}
