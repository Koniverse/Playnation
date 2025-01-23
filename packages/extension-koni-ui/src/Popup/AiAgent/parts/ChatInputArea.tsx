// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageInput } from '@chatscope/chat-ui-kit-react';
import { useNotification } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleUp, Paperclip } from 'phosphor-react';
import React, { useCallback, useRef, useState } from 'react';
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
  const [textContent, setTextContent] = useState<string>('');

  const onUpload = useCallback(() => {
    notify({
      message: 'Coming soon!'
    });
  }, [notify]);

  const _onInputChange = useCallback((innerHtml: string, textContent: string, innerText: string, nodes: NodeList) => {
    // todo: may modify the content before passing to the parent
    onInputChange(innerHtml);
    setTextContent(textContent);
  }, [onInputChange]);

  const _onSubmit = useCallback(() => {
    onSubmit(inputValue);
    setTextContent('');
  }, [inputValue, onSubmit]);

  const hasTextContent = !!(textContent?.trim());

  return (
    <div
      className={CN(className)}
    >
      <div className='__input-wrapper'>
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

        <MessageInput
          attachButton={false}
          disabled={disabled}
          onChange={_onInputChange}
          placeholder={'Type your question'}
          ref={inputRef}
          sendButton={false}
          sendOnReturnDisabled={true}
          value={inputValue}
        />
      </div>

      {
        hasTextContent && (
          <Button
            className={'__submit-button'}
            icon={(
              <Icon
                customSize={'24px'}
                phosphorIcon={ArrowCircleUp}
                weight={'fill'}
              />
            )}
            onClick={_onSubmit}
            shape={'round'}
            size={'sm'}
            type={'ghost'}
          />
        )
      }
    </div>
  );
}

export const ChatInputArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    padding: 12,
    backgroundColor: 'rgba(31, 31, 35, 0.06)',
    borderTop: '1px solid rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(4px)',
    backfaceVisibility: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 30,
    display: 'flex',
    alignItems: 'flex-end',

    '.__input-wrapper': {
      position: 'relative',
      flex: 1
    },

    '.__upload-button': {
      position: 'absolute',
      left: 2,
      bottom: 2,
      minWidth: '40px !important',
      height: 40,
      zIndex: 10
    },

    '.cs-message-input--disabled': {
      opacity: 0.4
    },

    '.cs-message-input': {
      background: 'transparent'
    },

    '.cs-message-input__content-editor-wrapper': {
      background: '#fff',
      borderRadius: 26,
      paddingLeft: 44,
      paddingRight: 16,
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

    '.__submit-button': {
      marginLeft: 8,
      minWidth: '40px !important',
      height: 40,
      borderRadius: '100%',
      backgroundColor: 'rgba(31, 31, 35, 0.12) !important'
    }
  };
});
