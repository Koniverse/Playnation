// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageType } from '@subwallet/extension-koni-ui/Popup/AiAgent/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  message: MessageType;
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, message } = props;

  return (
    <div
      className={CN(className)}
    >
      <div className={'__message-content-block'}>
        {message.message}
      </div>
    </div>
  );
}

export const UserMessage = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    display: 'flex',
    justifyContent: 'flex-end',
    pageLeft: 32,

    '.__message-content-block': {
      overflow: 'hidden',
      wordBreak: 'break-word',
      backgroundColor: '#fff',
      borderRadius: 16,
      borderTopRightRadius: 4,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 13,
      paddingTop: 13,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextDark1
    }
  };
});
