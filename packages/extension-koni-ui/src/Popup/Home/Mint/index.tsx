// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MintNftDetail, MintNftHeader } from '@subwallet/extension-koni-ui/components/Mint';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const { id } = useParams<{ id: string }>();
  const [nftAirdropList, setNftAirdropList] = useState<IAirdropNftMinting[]>(apiSDK.airdropNftMintList);

  const currentIAirdropNftMinting = useMemo(() => {
    return nftAirdropList[0];
  }, [nftAirdropList, id]);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropNftMint().subscribe((data) => {
      setNftAirdropList(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!currentIAirdropNftMinting) {
    return <></>;
  }

  return (
    <div className={className}>
      <MintNftHeader airdropNftInfo={currentIAirdropNftMinting} />
      <MintNftDetail airdropNftInfo={currentIAirdropNftMinting} />
      {/* <MintNftSuccess airdropNftInfo={currentIAirdropNftMinting} /> */}
    </div>
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM,
    padding: `0 ${token.paddingXS}px`
  };
});

export default Leaderboard;
