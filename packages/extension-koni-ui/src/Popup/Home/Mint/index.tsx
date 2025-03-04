// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MintNftDetail, MintNftHeader, MintNftSuccess } from '@subwallet/extension-koni-ui/components/Mint';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { IAirdropNftMinting, NftMintingLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import CN from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const apiSDK = BookaSdk.instance;
const mintingLogSubscription = apiSDK.subscribeNftMintingLog();

const Component = ({ className }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mint');
  const [nftAirdropList, setNftAirdropList] = useState<IAirdropNftMinting[]>(apiSDK.airdropNftMintList);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintedAddress, setMintedAddress] = useState<string | undefined>(undefined);
  const [mintingLog, setMintingLog] = useState<NftMintingLog | undefined>(mintingLogSubscription.value.data);
  const [isFetchingNftMintingLog, setIsFetchingNftMintingLog] = useState<boolean>(!mintingLogSubscription.value.isFetched);

  // @ts-ignore
  const [alwaysShowMint, setAlwaysShowMint] = useState<boolean>(false);

  const currentIAirdropNftMinting = useMemo(() => {
    return nftAirdropList[0];
  }, [nftAirdropList]);

  const onMintSuccess = useCallback((address: string) => {
    setMintedAddress(address);
    setMintSuccess(true);
  }, []);

  const onClickLogo = useCallback(() => {
    // setMintSuccess((prev) => !prev);
  }, []);

  const onClickHeaderNameArea = useCallback(() => {
    // setAlwaysShowMint((prev) => !prev);
  }, []);

  useEffect(() => {
    const subscription = apiSDK.subscribeAirdropNftMint().subscribe((data) => {
      setNftAirdropList(data);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    apiSDK.getNftMintingLog().catch(console.error);
    const sub = apiSDK.subscribeNftMintingLog().subscribe((data) => {
      setMintingLog(data.data);
      setIsFetchingNftMintingLog(!data.isFetched);
    });

    return () => {
      sub.unsubscribe();
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
        onClickNameArea={onClickHeaderNameArea}
      />
      {
        mintSuccess
          ? (
            <MintNftSuccess
              airdropNftInfo={currentIAirdropNftMinting}
              mintedAddress={mintedAddress}
            />
          )
          : (
            <MintNftDetail
              airdropNftInfo={currentIAirdropNftMinting}
              alwaysShowMint={alwaysShowMint}
              isFetchingNftMintingLog={isFetchingNftMintingLog}
              mintingLog={mintingLog}
              onSuccess={onMintSuccess}
            />
          )
      }
    </div>
  );
};

const MintPage = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
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

export default MintPage;
