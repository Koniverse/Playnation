// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Message, MessageList, TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { MessageType } from '@subwallet/extension-koni-ui/Popup/AiAgent/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

type Props = ThemeProps & {
  messages: MessageType[];
  loading?: boolean;
};

function Component (props: Props): React.ReactElement<Props> {
  const { className, loading, messages } = props;

  return (
    <div
      className={CN(className)}
    >
      <MessageList autoScrollToBottom={true}>
        {
          messages.map((message, index) => (
            <Message
              key={index}
              model={{
                direction: message.type === 'userMessage' ? 'outgoing' : 'incoming',
                position: 'normal'
              }}
            >
              <Message.CustomContent>
                <ReactMarkdown>{message.message}</ReactMarkdown>
              </Message.CustomContent>
            </Message>
          ))
        }
      </MessageList>
      {
        loading && (<TypingIndicator />)
      }
    </div>
  );
}

export const ChatMessagesArea = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',

    '.cs-message-list__scroll-wrapper': {
      paddingTop: 12
    },

    '.cs-typing-indicator': {
      position: 'absolute',
      bottom: 0,
      paddingLeft: 12,
      paddingBottom: 8
    },

    '.cs-message__custom-content': {
      fontFamily: token.fontFamily,
      lineHeight: token.lineHeight,
      fontSize: token.fontSize,

      'white-space': 'normal',

      p: {
        marginBottom: 0
      }
    }
  };
});
