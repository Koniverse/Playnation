// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReduxStatus, WalletConnectStore } from '@subwallet/extension-koni-ui/stores/types';
import { SessionTypes } from '@walletconnect/types';

const initialState: WalletConnectStore = {
  sessions: {},
  projectId: '',
  reduxStatus: ReduxStatus.INIT
};

const walletConnectSlice = createSlice({
  initialState,
  name: 'walletConnect',
  reducers: {
    updateSessions (state, action: PayloadAction<Record<string, SessionTypes.Struct>>) {
      const { payload } = action;

      return {
        ...state,
        sessions: payload
      };
    },
    updateProjectId (state, action: PayloadAction<string>) {
      const { payload } = action;

      return {
        ...state,
        projectId: payload,
        reduxStatus: ReduxStatus.READY
      };
    }
  }
});

export const { updateProjectId, updateSessions } = walletConnectSlice.actions;
export default walletConnectSlice.reducer;
