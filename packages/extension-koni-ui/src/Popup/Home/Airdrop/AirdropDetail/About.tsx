// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AirdropCampaign } from '@subwallet/extension-koni-ui/connector/booka/types';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  airdropInfo: AirdropCampaign
};

function Component ({ airdropInfo, className }: Props) {
  // @ts-ignore
  const { t } = useTranslation();

  return (
    <div className={CN(className)}>

    </div>
  );
}

export const AirdropDetailAbout = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({

  });
});
