// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  imageSrc: string;
};

const Component = ({ className, imageSrc }: Props): React.ReactElement => {
  return (
    <div
      className={className}
      style={{
        backgroundImage: `url("/images/mythical/cards/${imageSrc}.png")`
      }}
    ></div>
  );
};

const CardItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    backgroundSize: '135% auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',

    '&:before': {
      content: '""',
      display: 'block',
      paddingTop: '115%'
    }
  };
});

export default CardItem;
