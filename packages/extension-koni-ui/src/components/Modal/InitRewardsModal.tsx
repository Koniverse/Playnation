// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import { ACCOUNT_INIT_POINT_MODAL } from '@subwallet/extension-koni-ui/constants';
import { useDefaultNavigate, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Progress, SwModal, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { Check, CheckCircle } from 'phosphor-react';
import React, { useMemo } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

type RewardItemType = {
  id: number;
  name: string;
}

export type InitRewardsModalProps = {
  rewards: RewardItemType[];
  totalPoint: number;
  isInit: boolean
}

type Props = ThemeProps & InitRewardsModalProps;

function Component ({ className, rewards, totalPoint }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { goHome } = useDefaultNavigate();
  const rewardValue = useMemo(() => {
    return `${totalPoint} SP`;
  }, [totalPoint]);

  return (
    <SwModal
      className={CN(className)}
      id={ACCOUNT_INIT_POINT_MODAL}
    >
      <div className='bg-image' />
      <div className='body-container'>
        <div className='logo-container'>
          <img
            alt='logo'
            className='logo'
            src={'/images/games/default-avatar.png'}
          />
        </div>
        <header className='header'>
          <Typography.Title
            className={'title'}
            level={4}
          >
            {t('Your rewards')}
          </Typography.Title>
          <Typography.Text className={'sub-title'}>
            <Trans
              components={{
                highlight: (
                  <span className='highlight' />
                )
              }}
              i18nKey={detectTranslate('Congratulations! You\'ve received <highlight>{{rewardValue}}</highlight> for these following activities')}
              values={{ rewardValue }}
            />
          </Typography.Text>
        </header>

        <div className='kick-starting-list'>
          <div className='__list'>
            {
              rewards.map((item) => (
                <div
                  className={'starting-item'}
                  key={item.id}
                >
                  <div className='__top'>
                    <span className='__label'>
                      {item.name}
                    </span>
                    <Icon
                      customSize={'12px'}
                      phosphorIcon={Check}
                      weight={'bold'}
                    />
                  </div>
                  <Progress
                    className={'process-bar'}
                    percent={100}
                    showInfo={false}
                    status={'active'}
                    type={'line'}
                  />
                </div>
              ))
            }
          </div>
          <div className='__actions'>
            <Button
              block={true}
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={CheckCircle}
                  weight={'fill'}
                />
              )}
              onClick={goHome}
              schema={'primary'}
              shape={'round'}
              size={'sm'}
            >
              {t('Got it!')}
            </Button>
          </div>
        </div>
      </div>
    </SwModal>
  );
}

export const InitRewardsModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    background: extendToken.colorBgGradient || '#fff',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '.body-container': {
      padding: token.sizeLG,
      paddingLeft: token.sizeXS,
      paddingRight: token.sizeXS,
      textAlign: 'center',
      opacity: 0.999, // Hot fix show wrong opacity in browser

      header: {
        marginBottom: token.marginLG
      },

      '.icon-container': {
        marginBottom: token.marginLG
      },

      '.icon-group': {
        display: 'inline-block',
        position: 'relative',
        width: 104,
        height: 104,
        borderRadius: '50%',
        backgroundColor: token.colorWhite,
        textAlign: 'center'
      },

      '.__main-icon': {
        marginTop: 22
      },

      '.__sub-icon': {
        position: 'absolute',

        '&.p1': {
          top: 4,
          left: 0
        },

        '&.p2': {
          top: 67,
          left: 76
        }
      },

      '.title': {
        color: token.colorTextBase,
        marginBottom: token.marginSM
      },

      '.sub-title': {
        color: token.colorTextDark3
      },

      '.sub-title span': {
        color: token.colorTextDark2,
        fontWeight: 600
      }
    },

    '.logo-container': {
      marginBottom: 24
    },

    '.logo': {
      width: 104,
      height: 104
    },

    '.kick-starting-list': {
      padding: token.paddingLG,
      background: token.colorWhite,
      borderRadius: 20,
      fontSize: token.fontSizeSM,
      fontWeight: token.fontWeightStrong,

      '.__list': {
        marginTop: token.margin,
        marginBottom: token.margin
      },

      '.__actions': {
        marginBottom: token.margin
      },

      '.starting-item': {
        marginBottom: token.marginXS,

        '.__top': {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%'
        },

        '.process-bar': {
          width: '100%'
        }
      }
    }
  };
});
