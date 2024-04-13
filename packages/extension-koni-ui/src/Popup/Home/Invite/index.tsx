// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/invite');
  const [account, setAccount] = useState(apiSDK.account);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  return <div className={className}>
    {account && <div>
      <h1>Account Information</h1>
      <p>Energy: {account.attributes.energy}</p>
      <p>Point: {account.attributes.point}</p>
    </div>}
    <div className={'leader-board'}>
      <h1>Invite Link</h1>
      <h1>Invited History</h1>
    </div>
  </div>;
};

const Invite = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {

  };
});

export default Invite;
