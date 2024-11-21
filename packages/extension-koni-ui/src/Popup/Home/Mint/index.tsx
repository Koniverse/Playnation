// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MintNftDetail, MintNftHeader, MintNftSuccess } from '@subwallet/extension-koni-ui/components/Mint';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/leaderboard');
  const [nftAirdropList, setNftAirdropList] = useState<IAirdropNftMinting[]>(apiSDK.airdropNftMintList);
  const [mintSuccess, setMintSuccess] = useState(false);

  const currentIAirdropNftMinting = useMemo(() => {
    return nftAirdropList[0];
  }, [nftAirdropList]);

  const onMintSuccess = useCallback(() => {
    setMintSuccess(true);
  }, []);

  // todo: remove after debug
  const onClickLogo = useCallback(() => {
    setMintSuccess((prev) => !prev);
  }, []);

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
    <div className={CN(className, {
      '-not-minted': !mintSuccess,
      '-minted': mintSuccess
    })}
    >
      <MintNftHeader
        airdropNftInfo={currentIAirdropNftMinting}
        onClickLogo={onClickLogo}
      />
      {
        mintSuccess
          ? (
            <MintNftSuccess airdropNftInfo={currentIAirdropNftMinting} />
          )
          : (
            <MintNftDetail
              airdropNftInfo={currentIAirdropNftMinting}
              onSuccess={onMintSuccess}
            />
          )
      }
    </div>
  );
};

const Leaderboard = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: token.sizeSM,
    padding: `0 ${token.paddingXS}px`,
    paddingBottom: 24,

    '&.-minted': {

    },

    '&.-not-minted': {
      height: '100%'
    }
  };
});

export default Leaderboard;
