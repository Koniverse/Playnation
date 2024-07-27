// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LeaderboardContent } from '@subwallet/extension-koni-ui/components';
import { LeaderboardContentProps } from '@subwallet/extension-koni-ui/components/Leaderboard/LeaderboardContent';
import { LEADERBOARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

export type LeaderboardModalProps = LeaderboardContentProps & {
  modalTitle: string;
};

type Props = ThemeProps & LeaderboardModalProps & {
  onCancel: VoidFunction;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Component = ({ className, modalTitle, onCancel, theme, ...leaderboardContentProps }: Props): React.ReactElement => {
  return (
    <SwModal
      className={CN(className)}
      id={LEADERBOARD_MODAL}
      onCancel={onCancel}
      title={modalTitle}
    >
      <LeaderboardContent
        {...leaderboardContentProps}
        className={'leaderboard-content-container'}
      />
    </SwModal>
  );
};

const LeaderboardModal = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-modal-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 0
    },

    '.leaderboard-content-container': {
      background: extendToken.colorBgGradient || token.colorPrimary,
      height: '100%',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: token.padding
    },

    '.leaderboard-item-list-container': {
      paddingBottom: 24
    }
  };
});

export default LeaderboardModal;
