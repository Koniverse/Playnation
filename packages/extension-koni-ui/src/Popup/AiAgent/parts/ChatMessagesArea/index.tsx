// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TypingIndicator } from '@chatscope/chat-ui-kit-react';
import { UserMessage } from '@subwallet/extension-koni-ui/Popup/AiAgent/parts/ChatMessagesArea/UserMessage';
import { MessageType } from '@subwallet/extension-koni-ui/Popup/AiAgent/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import styled from 'styled-components';

import { BotMessage } from './BotMessage';

type Props = ThemeProps & {
  messages: MessageType[];
  loading?: boolean;
  onClickConnectWallet: VoidFunction;
};

export interface ChatMessagesAreaRef {
  scrollToBottom: (delay?: number) => void;
}

function Component (props: Props, ref: ForwardedRef<ChatMessagesAreaRef>): React.ReactElement<Props> {
  const { className, loading, messages, onClickConnectWallet } = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollContainerRefCurrent = scrollContainerRef.current;

  const scrollToBottom = useCallback((delay = 50) => {
    if (scrollContainerRefCurrent) {
      setTimeout(() => {
        scrollContainerRefCurrent.scrollTo(0, scrollContainerRefCurrent.scrollHeight);
      }, delay);
    }
  }, [scrollContainerRefCurrent]);

  useImperativeHandle(ref, () => {
    return {
      scrollToBottom
    };
  }, [scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <div
      className={CN(className)}
    >
      <div
        className={'__scroll-container'}
        ref={scrollContainerRef}
      >
        {
          messages.map((message, index) => (
            <React.Fragment
              key={index}
            >
              {
                message.type === 'apiMessage' && (
                  <BotMessage
                    className={'__message-wrapper -ai'}
                    message={message}
                    onClickConnectWallet={onClickConnectWallet}
                  />
                )
              }
              {
                message.type === 'userMessage' && (
                  <UserMessage
                    className={'__message-wrapper -user'}
                    message={message}
                  />
                )
              }
            </React.Fragment>
          ))
        }
        {
          loading && (<TypingIndicator />)
        }
      </div>
    </div>
  );
}

export const ChatMessagesArea = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',

    '.__scroll-container': {
      scrollBehavior: 'smooth',
      height: '100%',
      overflowY: 'auto',
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 98
    },

    '.__message-wrapper': {

    },

    '.__message-wrapper + .__message-wrapper': {
      marginTop: 16
    },

    '.__message-wrapper.-user + .__message-wrapper.-ai': {
      marginTop: 16
    },

    '.ant-sw-sub-header-container': {
      paddingTop: 12,
      paddingBottom: 16
    },

    '.cs-typing-indicator': {
      marginTop: 12
      // position: 'absolute',
      // bottom: 0,
      // paddingLeft: 12,
      // paddingBottom: 8
    },

    '.cs-typing-indicator__dot': {
      backgroundColor: token.colorTextDark3
    }
  };
});
