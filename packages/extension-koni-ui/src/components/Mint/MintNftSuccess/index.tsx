// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { IAirdropNftMinting } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import React from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

interface Props extends ThemeProps {
  airdropNftInfo: IAirdropNftMinting
}

const Component = ({ airdropNftInfo, className }: Props) => {
  const { t } = useTranslation();
  const { name, nft_url: nftUrl } = airdropNftInfo;
  const wcAccount = useSelector((state: RootState) => state.accountState.wcAccount);

  return (
    <div className={CN(className)}>
      <div className={'__mint-nft-success-header'}>
        {t('Yay! You minted {{nft}}', { replace: { nft: name } })}
      </div>
      <div className={CN('__mint-badge-wrapper')}>
        <img
          alt='badge'
          className={'__mint-badge-image'}
          src={nftUrl}
        />
      </div>
      <div className={'__mint-nft-success-footer'}>
        <Trans
          components={{
            highlight: (
              <a
                className='__link'
                href={'/'}
              />
            )
          }}
          i18nKey={detectTranslate('Congratulations! Your badge is minted with account {{address}}. Check out other badges <highlight>here</highlight>')}
          values={{ address: toShort(wcAccount?.address || '', 10, 16) }}
        />
      </div>
    </div>
  );
};

const MintNftSuccessItem = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => ({
  backgroundColor: extendToken.colorBgSecondary1,
  backgroundImage: "url('/images/paper-firework-left.png'), url('/images/paper-firework-right.png')",
  backgroundPosition: '12px 28px, right 20px top 28px',
  backgroundRepeat: 'no-repeat, no-repeat',
  borderRadius: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: 32,
  paddingRight: 32,
  paddingBottom: 32,
  paddingTop: 28,

  '.__mint-nft-success-header': {
    paddingLeft: 8,
    paddingRight: 8,
    marginBottom: 40,
    fontSize: token.fontSizeHeading4,
    fontFamily: token.fontFamily,
    fontWeight: 600,
    lineHeight: token.lineHeightHeading4,
    textAlign: 'center',
    position: 'relative',
    zIndex: 2
  },

  '.__mint-badge-wrapper': {
    marginBottom: token.size,
    position: 'relative'
  },

  '.__mint-badge-wrapper:before': {
    content: '""',
    display: 'block',
    width: 230,
    height: 230,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -115,
    marginTop: -115,
    zIndex: 1,
    borderRadius: '100%',
    backgroundImage: extendToken.colorBgGradient,
    filter: 'blur(32px)'
  },

  '.__mint-badge-image': {
    position: 'relative',
    zIndex: 2

  },

  '.__mint-nft-success-footer': {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    fontSize: token.fontSizeHeading6,
    color: token.colorTextDark3,
    fontWeight: 500,
    lineHeight: token.lineHeightHeading6,
    fontFamily: token.fontFamily
  },

  '.__link': {
    color: token.colorSuccess,
    textDecoration: 'underline'
  }
}));

export default MintNftSuccessItem;
