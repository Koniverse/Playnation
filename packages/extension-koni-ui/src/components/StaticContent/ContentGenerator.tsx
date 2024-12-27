// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { noop } from '@subwallet/extension-koni-ui/utils';
import { Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import styled from 'styled-components';

interface Props extends ThemeProps {
  content: string;
}

const onClickHyperLink = (href?: string) => {
  return (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    window.open(href);
  };
};

const Component = ({ className, content }: Props) => {
  return (
    <ReactMarkdown
      className={className}
      components={{
        img (props) {
          const { children, className, node, src, ...rest } = props;

          return (
            <Image
              {...rest}
              className={'custom-img'}
              onClick={noop}
              src={src}
              width={'100%'}
            />
          );
        },
        blockquote (props) {
          const { children, ...rest } = props;

          return (
            <blockquote
              {...rest}
              className={'custom-blockquote'}
            >
              {children}
            </blockquote>
          );
        },
        hr (props) {
          return (
            <hr
              {...props}
              className={'custom-hr'}
            />
          );
        },
        ul (props) {
          return (
            <ul
              {...props}
              className={'custom-ul'}
            ></ul>
          );
        },
        body (props) {
          return (
            <body
              {...props}
              className={'custom-body'}
            ></body>
          );
        },
        p (props) {
          const { children, className, ...rest } = props;

          return (
            <p
              {...rest}
              className={CN([className, 'custom-paragraph'])}
            >{children}</p>
          );
        },
        a (props) {
          const { children, className, href, ...rest } = props;

          return (
            <a
              {...rest}
              onClick={onClickHyperLink(href)}
            >{children}</a>
          );
        },
        th (props) {
          const { children, ...rest } = props;

          return (
            <th
              {...rest}
              className={'custom-th'}
            >
              {children}
            </th>
          );
        },
        thead (props) {
          const { children, ...rest } = props;

          return (
            <thead
              {...rest}
              className={'custom-thead'}
            >
              {children}
            </thead>
          );
        },
        table (props) {
          const { children, ...rest } = props;

          return (
            <table
              {...rest}
              className={'custom-table'}
            >
              {children}
            </table>
          );
        },
        td (props) {
          const { children, ...rest } = props;

          return (
            <td
              {...rest}
              className={'custom-td'}
            >
              {children}
            </td>
          );
        }
      }}
      remarkPlugins={[gfm]}
    >{content}</ReactMarkdown>
  );
};

const ContentGenerator = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.custom-body': {
      color: token.colorWhite,
      fontSize: token.fontSizeSM,
      lineHeight: token.fontSizeSM * token.lineHeightSM,
      fontFamily: 'PlusJakartaSans-Medium'
    },
    '.custom-blockquote': {
      backgroundColor: token.colorBgSecondary,
      borderColor: 'transparent',
      borderLeftWidth: 0,
      marginLeft: 0,
      paddingLeft: 12,
      paddingRight: 12,
      borderRadius: token.borderRadiusLG,
      paddingTop: 4,
      paddingBottom: 4,
      marginTop: 4,
      marginBottom: 4,
      display: 'inline-block'
    },
    '.custom-hr': {
      backgroundColor: token.colorBgBorder,
      height: 2,
      marginTop: 4,
      marginBottom: 4,
      border: 'none'
    },
    '.custom-ul': {
      paddingInlineStart: 24,
      marginBottom: 8,
      textAlign: 'left'
    },
    '.custom-th': {
      border: `1px solid ${extendToken.mythColorGray1}`,
      padding: 4
    },
    '.custom-thead': {
      paddingLeft: 8,
      paddingRight: 8
    },
    '.custom-td': {
      border: `1px solid ${extendToken.mythColorGray1}`,
      padding: 4
    },
    '.custom-table': {
      margin: 'auto',
      marginBottom: 8
    },
    '.custom-img': {
      marginTop: 4,
      marginBottom: 4
    },
    '.custom-paragraph': {
      marginBottom: 8,
      textAlign: 'left'
    }
  };
});

export default ContentGenerator;
