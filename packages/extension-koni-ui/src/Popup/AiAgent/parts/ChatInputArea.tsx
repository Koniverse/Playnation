// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageInput } from '@chatscope/chat-ui-kit-react';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Paperclip } from 'phosphor-react';
import React, { useCallback, useRef } from 'react';
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
  const notify = useNotification();

  const onUpload = useCallback(() => {
    notify({
      message: 'Coming soon!'
    });
  }, [notify]);

  const _onSubmit = useCallback((innerHtml: string, textContent: string, innerText: string, nodes: NodeList) => {
    onSubmit(innerHtml);
  }, [onSubmit]);

  return (
    <div
      className={CN(className)}
    >
      <MessageInput
        attachButton={false}
        disabled={disabled}
        onChange={onInputChange}
        onSend={_onSubmit}
        placeholder={'Type your question'}
        ref={inputRef}
        sendButton={false}
        value={inputValue}
      />

      <Button
        className={'__upload-button'}
        icon={(
          <Icon
            customSize={'20px'}
            phosphorIcon={Paperclip}
          />
        )}
        onClick={onUpload}
        shape={'round'}
        size={'sm'}
        type={'ghost'}
      />
    </div>
  );
}

export const ChatInputArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    padding: 12,
    backgroundColor: 'rgba(240, 251, 255, 0.65)',
    borderTop: '2px solid #fff',
    backdropFilter: 'blur(4px)',
    backfaceVisibility: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 30,

    '.cs-message-input--disabled': {
      opacity: 0.4
    },

    '.cs-message-input': {
      background: 'transparent'
    },

    '.cs-message-input__content-editor-wrapper': {
      background: '#fff',
      borderRadius: 26,
      padding: 16,
      paddingTop: 11,
      paddingBottom: 11
    },

    '.cs-message-input__content-editor-container, .cs-message-input__content-editor': {
      background: 'transparent'
    },

    '.cs-message-input__content-editor-container': {
      fontSize: token.fontSize,
      lineHeight: '22px'
    },

    '.cs-message-input__content-editor': {
      color: token.colorTextDark1,
      fontFamily: token.fontFamily
    },

    '.cs-message-input__content-editor[data-placeholder]:empty:before': {
      color: token.colorTextDark4
    },

    '.__upload-button': {
      position: 'absolute',
      right: 10,
      bottom: 32,
      minWidth: '40px !important',
      height: 40
    }
  };
});
