// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { ACCOUNT_ADD_POINT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleDown, CheckCircle } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export type YourRewardInfo = {
  iconSrc: string,
  value: number,
  symbol: string
}

export type AddRewardsModalProps = {
  onViewDetail?: VoidFunction;
  onOk?: VoidFunction;
  onCancel?: VoidFunction;
  rewardInfo: YourRewardInfo;
}

type Props = ThemeProps & AddRewardsModalProps;

const modalId = ACCOUNT_ADD_POINT_MODAL;

function Component (props: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { className = '', onCancel,
    onOk,
    onViewDetail, rewardInfo } = props;

  const modalFooter = (() => {
    return (
      <>
        <Button
          block={true}
          className={'__modal-button'}
          icon={
            <Icon
              customSize={'20px'}
              phosphorIcon={ArrowCircleDown}
              weight={'fill'}
            />
          }
          onClick={onViewDetail}
          schema={'secondary'}
          shape={'round'}
          size={'sm'}
        >

          {t('View Detail')}
        </Button>

        <Button
          block={true}
          className={'__modal-button'}
          icon={
            <Icon
              customSize={'20px'}
              phosphorIcon={CheckCircle}
              size={'small'}
              weight={'fill'}
            />
          }
          onClick={onOk}
          shape={'round'}
          size={'sm'}
        >
          {t('Got it!')}
        </Button>
      </>
    );
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

        <div className='__gift-image-wrapper'>
          <img
            alt='Gift Box'
            className={'__gift-image'}
            src={DefaultLogosMap.boxGift}
          />
        </div>

        <div className='__congratulation-text'>
          {t("Congratulations! You've received")}
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

export const AddRewardsModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
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
      background: extendToken.colorBgGradient || token.colorPrimary,
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
    },

    '.__modal-button': {
      '.anticon': {
        width: '1em',
        height: '1em'
      },

      '.ant-btn-content-wrapper': {
        fontSize: token.fontSize,
        lineHeight: token.lineHeight
      }
    }
  });
});
