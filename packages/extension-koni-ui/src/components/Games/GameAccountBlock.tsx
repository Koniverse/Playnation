// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { GameAccountAvatar, GameEnergyBar } from '@subwallet/extension-koni-ui/components';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useGetEnergyInfo } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { formatIntegerShort } from '@subwallet/extension-koni-ui/utils';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Lightning } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  className?: string;
  accountInfo?: BookaAccount;
  maxEnergy?: number;
};

function Component ({ accountInfo, className, maxEnergy }: Props) {
  const { t } = useTranslation();

  const { currentEnergy } = useGetEnergyInfo({
    startTime: accountInfo?.attributes.lastEnergyUpdated,
    energy: accountInfo?.attributes.energy,
    maxEnergy
  });

  return (
    <div className={CN(className)}>
      <div className='__left-part'>
        <GameAccountAvatar
          avatarPath={accountInfo?.info.photoUrl}
          className={'__avatar'}
          size={5}
        />
      </div>

      <div className='__right-part'>
        <div className='__point-info'>
          <div className='__point-value'>
            {formatIntegerShort(accountInfo?.attributes.point || 0)}
          </div>
          <img
            alt={'avatar'}
            className='__token-icon'
            src={DefaultLogosMap.token_icon}
          />
        </div>

        <div className='__energy-bar-info'>
          <div className='__recovery'>
            <span className='__recovery-value'>
              <span>1</span>

              <Icon
                customSize={'12px'}
                phosphorIcon={Lightning}
                weight={'fill'}
              />
            </span>
            <span className='__recovery-suffix'>
              /{t('min')}
            </span>
          </div>
          <div className='__energy'>
            <span className='__current-energy'>
              <Icon
                customSize={'12px'}
                phosphorIcon={Lightning}
                weight={'fill'}
              />

              <span>{formatIntegerShort(currentEnergy || 0)}</span>
            </span>
            <span className='__max-energy'>
              /{formatIntegerShort(maxEnergy || 0)}
            </span>
          </div>
        </div>

        <GameEnergyBar
          currentEnergy={currentEnergy}
          maxEnergy={maxEnergy}
        />
      </div>
    </div>
  );
}

export const GameAccountBlock = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    backgroundColor: token.colorWhite,
    padding: '12px 20px',
    borderRadius: 20,
    display: 'flex',
    gap: token.size,
    alignItems: 'center',

    '.__right-part': {
      flex: 1
    },

    '.__point-info': {
      display: 'flex',
      gap: token.sizeXXS,
      alignItems: 'center',
      marginBottom: token.marginXXS
    },

    '.__point-value': {
      color: token.colorTextDark2,
      fontSize: token.fontSizeHeading3,
      lineHeight: token.lineHeightHeading3,
      fontWeight: token.headingFontWeight
    },

    '.__token-icon': {
      minWidth: 18,
      height: 18
    },

    '.__energy-bar-info': {
      display: 'flex',
      justifyContent: 'space-between',
      gap: token.size,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      marginBottom: 6
    },

    '.__recovery-value, .__current-energy': {
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark2
    },

    '.__recovery-suffix, .__max-energy': {
      color: token.colorTextDark3
    }
  });
});

export default GameAccountBlock;
