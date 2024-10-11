// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, Progress, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { ArrowCircleRight, Check, Gift, StarFour } from 'phosphor-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps;

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onContinue = useCallback(() => {
    navigate('/accounts/new-seed-phrase');
  }, [navigate]);

  return (
    <Layout.Base
      className={CN(className)}
    >
      <div className='bg-image' />
      <div className='body-container'>
        <div className='icon-container'>
          <div className='icon-group'>
            <Icon
              className={'__main-icon'}
              customSize={'60px'}
              phosphorIcon={Gift}
              weight={'fill'}
            />
            <Icon
              className={'__sub-icon p1'}
              customSize={'36px'}
              phosphorIcon={StarFour}
            />
            <Icon
              className={'__sub-icon p2'}
              customSize={'12px'}
              phosphorIcon={StarFour}
              weight={'fill'}
            />
          </div>
        </div>
        <header className='header'>
          <Typography.Title
            className={'title'}
            level={4}
          >
            {t('Kickstarting your IP journey')}
          </Typography.Title>
          <Typography.Text className={'sub-title'}>
            {t('Token created successfully. Check explorer for inscription!')}
          </Typography.Text>
        </header>

        <div className='kick-starting-list'>
          <div className='__list'>
            <div className={'starting-item'}>
              <div className='__top'>
                <span className='__label'>
                  {t('Account age bonus')}
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
            <div className={'starting-item'}>
              <div className='__top'>
                <span className='__label'>
                  {t('Premium account bonus')}
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
            <div className={'starting-item'}>
              <div className='__top'>
                <span className='__label'>
                  {t('Message count bonus')}
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
            <div className={'starting-item'}>
              <div className='__top'>
                <span className='__label'>
                  {t('OG status bonus')}
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
          </div>
          <div className='__actions'>
            <Button
              block={true}
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={ArrowCircleRight}
                  weight={'fill'}
                />
              )}
              onClick={onContinue}
              schema={'primary'}
              shape={'round'}
              size={'sm'}
            >
              {t('Continue')}
            </Button>
          </div>
        </div>
      </div>
    </Layout.Base>
  );
}

const Welcome = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    background: extendToken.colorBgGradient || '#fff',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',

    '.body-container': {
      padding: token.sizeLG,
      textAlign: 'center',
      opacity: 0.999, // Hot fix show wrong opacity in browser

      header: {
        marginBottom: token.marginXL
      },

      '.icon-container': {
        marginBottom: token.marginXL
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
        color: token.colorTextBase
      },

      '.sub-title': {
        color: token.colorTextDark3
      }
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

export default Welcome;
