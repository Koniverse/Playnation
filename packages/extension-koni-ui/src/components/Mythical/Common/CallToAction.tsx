// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  title: string;
  content: string;
  buttonLabel: string;
  onAction?: VoidFunction;
};

const Component = ({ buttonLabel,
  className,
  content,
  onAction,
  title }: Props): React.ReactElement => {
  return (
    <div
      className={className}
    >
      <div className='__title'>
        {title}
      </div>

      <div className='__title'>
        {content}
      </div>

      <MythButton onClick={onAction}>
        {buttonLabel}
      </MythButton>
    </div>
  );
};

const CallToAction = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default CallToAction;
