// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageType } from '@subwallet/extension-koni-ui/Popup/AiAgent/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
      <div className='__message-header'>
        <svg
          className={'__agent-avatar'}
          fill='none'
          height='20'
          viewBox='0 0 20 20'
          width='20'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle
            cx='10'
            cy='10'
            fill='#1F1F23'
            r='10'
          />
          <path
            d='M16.6668 10.4058L13.3335 8.88352V8.19656L16.6668 6.6665V7.43934L13.8956 8.67275V8.39952L16.6668 9.63294V10.4058Z'
            fill='white'
          />
          <path
            d='M7.5 12.5L13.3333 12.5V14.3728C13.3333 14.7241 13.2603 15.0326 13.1141 15.2985C12.9679 15.5643 12.7591 15.7708 12.4877 15.918C12.2163 16.0699 11.8978 16.1458 11.5324 16.1458C11.167 16.1458 10.8486 16.0699 10.5772 15.918C10.311 15.7708 10.1022 15.5643 9.95078 15.2985C9.80462 15.0374 9.73154 14.7288 9.73154 14.3728V13.1978L7.5 13.1978L7.5 12.5ZM10.4362 13.1978V14.3941C10.4362 14.6077 10.4806 14.7929 10.5694 14.9495C10.6581 15.1062 10.786 15.2273 10.953 15.3127C11.1201 15.3982 11.3132 15.4409 11.5324 15.4409C11.7569 15.4409 11.95 15.3982 12.1119 15.3127C12.2789 15.2273 12.4068 15.1062 12.4955 14.9495C12.5843 14.7929 12.6286 14.6077 12.6286 14.3941V13.1978L10.4362 13.1978Z'
            fill='white'
          />
          <path
            clipRule='evenodd'
            d='M5.41683 10.5127C6.39041 10.5127 7.17965 9.72342 7.17965 8.74984C7.17965 7.77626 6.39041 6.98702 5.41683 6.98702C4.44325 6.98702 3.65401 7.77626 3.65401 8.74984C3.65401 9.72342 4.44325 10.5127 5.41683 10.5127ZM5.41683 10.8332C6.56742 10.8332 7.50016 9.90043 7.50016 8.74984C7.50016 7.59924 6.56742 6.6665 5.41683 6.6665C4.26624 6.6665 3.3335 7.59924 3.3335 8.74984C3.3335 9.90043 4.26624 10.8332 5.41683 10.8332Z'
            fill='white'
            fillRule='evenodd'
          />
          <path
            d='M5.41683 6.66659C5.00478 6.66659 4.60199 6.78877 4.25939 7.01769C3.91679 7.24661 3.64976 7.57198 3.49208 7.95266C3.3344 8.33334 3.29314 8.75223 3.37353 9.15636C3.45391 9.56048 3.65233 9.9317 3.94369 10.2231C4.23505 10.5144 4.60626 10.7128 5.01039 10.7932C5.41452 10.8736 5.83341 10.8324 6.21409 10.6747C6.59477 10.517 6.92014 10.25 7.14906 9.90736C7.37798 9.56475 7.50016 9.16196 7.50016 8.74992L5.41683 8.74992L5.41683 6.66659Z'
            fill='white'
          />
        </svg>

        <div className='__agent-name'>
          Tell Me Agent
        </div>
      </div>
      <div className='__message-content-block'>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
        >{message.message}</ReactMarkdown>
      </div>
    </div>
  );
}

export const BotMessage = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.__message-header': {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    },

    '.__agent-avatar': {

    },

    '.__agent-name': {
      fontSize: 12,
      lineHeight: '20px',
      color: token.colorTextDark3
    },

    '.__message-content-block': {
      overflow: 'hidden',
      wordBreak: 'break-word',
      padding: '12px 16px 20px 16px',
      borderRadius: '4px 16px 16px 16px',
      backgroundColor: token.colorTextLight4,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextDark1,

      '> *': {
        marginBottom: 0
      },

      '> * + *': {
        marginTop: 12
      },

      'ul, ol': {
        'list-style-position': 'inside',
        paddingLeft: 4,

        'li::marker': {
          marginRight: 8
        }
      }
    }
  };
});
