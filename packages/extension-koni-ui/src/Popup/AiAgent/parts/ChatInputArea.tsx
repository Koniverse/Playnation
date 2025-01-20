// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageInput } from '@chatscope/chat-ui-kit-react';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useRef } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  disabled?: boolean;
  inputValue: string;
  onSubmit: (value: string) => void;
  onInputChange: (value: string) => void;
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, disabled, inputValue, onInputChange, onSubmit } = props;
  const inputRef = useRef(null);

  return (
    <div
      className={CN(className)}
    >
      <MessageInput
        attachButton={false}
        disabled={disabled}
        onChange={onInputChange}
        onSend={onSubmit}
        placeholder={'Type your question'}
        ref={inputRef}
        sendButton={true}
        value={inputValue}
      />
    </div>
  );
}

export const ChatInputArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.cs-message-input': {
      background: 'transparent'
    }
  };
});
