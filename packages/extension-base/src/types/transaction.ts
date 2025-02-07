
export interface RequestMintNft {
  address: string;
  chain: string;
  signature: string;
}

export interface RequestSubscribeTransactionById {
  id: string;
}
