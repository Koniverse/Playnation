// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AirdropRaffle } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleDown, CheckCircle } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onCancel: VoidFunction;
  onClaim: VoidFunction;
  onClaimLater: VoidFunction;
  raffle: AirdropRaffle | null;
  isLoading?: boolean;
}

type RewardInfo = {
  iconSrc: string,
  value: number,
  symbol: string
}

export const AIRDROP_REWARD_MODAL_ID = 'AIRDROP_REWARD_MODAL_ID';
const modalId = AIRDROP_REWARD_MODAL_ID;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { className = '', isLoading, onCancel, onClaim, onClaimLater, raffle } = props;
  const _onClaimLater = useCallback(() => {
    onClaimLater?.();
  }, [onClaimLater]);

  const modalFooter = (() => {
    return (
      <>
        {raffle?.rewardType === 'NPS' &&
         <Button
           block={true}
           icon={
             <Icon
               phosphorIcon={ArrowCircleDown}
               weight={'fill'}
             />
           }
           onClick={_onClaimLater}
           schema={'secondary'}
           shape={'round'}
           size={'sm'}
         >

           {t('Close')}
         </Button>
        }
        {raffle?.rewardType !== 'NPS' && <>
          <Button
            block={true}
            icon={
              <Icon
                phosphorIcon={ArrowCircleDown}
                weight={'fill'}
              />
            }
            onClick={_onClaimLater}
            schema={'secondary'}
            shape={'round'}
            size={'sm'}
          >

            {t('Claim later')}
          </Button>
          <Button
            block={true}
            icon={
              <Icon
                phosphorIcon={CheckCircle}
                weight={'fill'}
              />
            }
            loading={isLoading}
            onClick={onClaim}
            shape={'round'}
            size={'sm'}
          >
            {t('Claim')}
          </Button>
        </>
        }

      </>
    );
  })();

  const rewardInfo: RewardInfo = (() => {
    if (raffle?.rewardType === 'NPS') {
      return {
        iconSrc: '/images/games/token-icon.png',
        value: raffle?.rewardAmount || 0,
        symbol: 'NPS'
      };
    }

    return {
      iconSrc: '/images/projects/karura.png',
      value: raffle?.rewardAmount || 0,
      symbol: 'KAR'
    };
  })();

  return (
    <SwModal
      className={CN(className, '-light-theme')}
      footer={modalFooter}
      id={modalId}
      onCancel={onCancel}
      title={t('Your rewards')}
    >
      <div className='__content-area'>
        <img
          alt='Gift Box'
          className={'__zoomable-image'}
          src={DefaultLogosMap.boxGift}
        />
        <div className='__congratulation-text'>
          {t('Congratulations on your receipt')}:
        </div>

        <div className='__reward-info'>
          <img
            alt={'token'}
            className='__reward-icon'
            src={rewardInfo.iconSrc}
          />
          <span className={'__reward-value'}>{rewardInfo.value}</span>
          <span className={'__reward-symbol'}>{rewardInfo.symbol}</span>
        </div>
      </div>
    </SwModal>
  );
}

export const AirdropRewardModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS,
      paddingBottom: 0
    },

    '.ant-sw-modal-footer': {
      borderTop: 0,
      display: 'flex'
    },

    '.__content-area': {
      backgroundColor: token.colorPrimary,
      borderRadius: 24,
      display: 'flex',
      gap: token.size,
      textAlign: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px'
    },

    '.__congratulation-text': {
      fontSize: token.fontSizeLG,
      fontWeight: token.headingFontWeight,
      lineHeight: token.lineHeightLG,
      color: token.colorTextDark1
    },

    '.__reward-info': {
      height: 48,
      paddingLeft: 20,
      paddingRight: 20,
      display: 'flex',
      alignItems: 'center',
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading4,
      fontWeight: token.headingFontWeight,
      backgroundColor: extendToken.colorBgSecondary1,
      borderRadius: 58
    },

    '.__reward-icon': {
      width: 28,
      height: 28
    },

    '.__reward-value': {
      marginLeft: token.marginXS
    },

    '.__reward-symbol': {
      marginLeft: token.marginXXS,
      color: token.colorTextDark4
    }

  });
});
