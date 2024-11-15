// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Image } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  airdropNftInfo: IAirdropNftMinting
}

const Component = ({ airdropNftInfo, className }: Props) => {
  const { t } = useTranslation();
  const { icon, name } = airdropNftInfo;

  return (
    <div className={CN(className)}>
      <div className={'__mint-nft-success-header'}>
        {t('Yay! You minted {{nft}} badge', { replace: { nft: name } })}
      </div>
      <div className={CN('__mint-nft-success-content')}>
        <Image src={icon} />
      </div>
      <div className={'__mint-nft-success-footer'}>
        {t('Congratulations on minting a soul-bound NFT that confirms your OG status in the Story ecosystem! Check out other quests here')}
        <a href={'/'}>{t('here')}</a>
      </div>
    </div>

  );
};

const MintNftSuccessItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => ({
  backgroundColor: extendToken.colorBgSecondary1,
  backgroundImage: "url('/images/paper-firework-left.png'), url('/images/paper-firework-right.png')",
  backgroundPosition: 'calc(16px) calc(16px), calc(100% - 16px) calc(16px)',
  backgroundRepeat: 'no-repeat, no-repeat',
  borderRadius: 20,
  height: 350,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: token.padding,

  '.__mint-nft-success-header': {
    maxWidth: 300,
    fontSize: token.fontSizeHeading4,
    fontFamily: token.fontFamily,
    fontWeight: 600,
    lineHeight: token.lineHeightHeading4,
    textAlign: 'center'
  },

  '.__mint-nft-success-content': {
    borderRadius: '50%',
    background: extendToken.colorBgGradient
  },

  '.__mint-nft-success-footer': {
    textAlign: 'center',
    fontSize: token.fontSizeHeading6,
    color: token.colorTextDark3,
    fontWeight: 500,
    lineHeight: token.lineHeightHeading6,
    fontFamily: token.fontFamily
  }
}));

export default MintNftSuccessItem;
