// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MythButton } from '@subwallet/extension-koni-ui/components/Mythical';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { Reward, RewardStatus } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { MYTHICAL_ALERT_REWARD_MODAL } from '@subwallet/extension-koni-ui/constants';
import useTranslation from '@subwallet/extension-koni-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { preloadImages, toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
// import { openInNewTab } from '@subwallet/extension-koni-ui/utils/common/browser';
import { Logo, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  rewardsEligible: Reward[];
};

const MythicalAlertRewardModalId = MYTHICAL_ALERT_REWARD_MODAL;
const apiSDK = BookaSdk.instance;
const giftMythReward = '/images/mythical/gift-myth-reward.png';
const closeIcon = '/images/mythical/close-button.png';
const infoIcon = '/images/mythical/info-button.png';
const telegramConnector = TelegramConnector.instance;

function Component ({ className, rewardsEligible }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const navigate = useNavigate();
  const [account, setAccount] = useState(apiSDK.account);
  const [totalReward, setTotalReward] = useState<number>(0);

  useEffect(() => {
    preloadImages([
      giftMythReward,
      closeIcon,
      infoIcon,
      '/images/mythical/gift-myth-reward-mask-image.png'
    ]);
  }, []);

  useEffect(() => {
    const totalReward = rewardsEligible.reduce((acc, reward) => {
      if (reward.status === RewardStatus.SUCCESS) {
        acc += reward.token;
      }

      return acc;
    }, 0);

    setTotalReward(totalReward);
  }, [rewardsEligible]);

  const onCancel = useCallback(() => {
    apiSDK.updateRewardHistory().catch(console.error);
    inactiveModal(MythicalAlertRewardModalId);
  }, [inactiveModal]);

  const shareToTwitter = useCallback(() => {
    const content = `I’ve won ${toDisplayNumber(totalReward)} MYTH on Football Rivals Telegram bot 💥
                                                 %0AWant to win MYTH too? Join me NOW 👇`;

    const urlShare = 'https://x.koni.studio/football-rivals';
    const linkShare = `${urlShare}?startApp=${account?.info.inviteCode || 'booka'}`;

    const url = `http://x.com/share?text=${content}&url=${linkShare}`;

    telegramConnector.openLink(url);
    apiSDK.updateRewardHistory().catch(console.error);
    inactiveModal(MythicalAlertRewardModalId);
  }, [account?.info.inviteCode, inactiveModal, totalReward]);

  const goMyProfile = useCallback(() => {
    navigate('/home/my-profile');
    apiSDK.updateRewardHistory().catch(console.error);
    inactiveModal(MythicalAlertRewardModalId);
  }, [inactiveModal, navigate]);

  // const openUserGuide = useCallback(() => {
  //   openInNewTab('https://www.mythical.games/mythical-rewards');
  // }, []);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const footerModal = useMemo(() => {
    return (
      <>
        <MythButton
          className={CN('__action-button __left-button')}
          onClick={goMyProfile}
        >
          {t('VIEW DETAILS')}
        </MythButton>

        <MythButton
          className={CN('__action-button __right-button')}
          onClick={shareToTwitter}
        >
          {t('SHARE TO TWITTER')}
        </MythButton>
      </>
    );
  }, [goMyProfile, shareToTwitter, t]);

  return (
    <>
      <SwModal
        className={CN(className)}
        closable={true}
        closeIcon={<img
          alt='close'
          className={'__icon-close'}
          src={closeIcon}
        />}
        footer={footerModal}
        id={MythicalAlertRewardModalId}
        maskClosable={false}
        onCancel={onCancel}
        // rightIconProps={{
        //   icon: <img
        //     alt={'info'}
        //     className={'icon-info'}
        //     src={infoIcon}
        //   />,
        //   onClick: openUserGuide
        // }}
        title={t('YOUR REWARDS')}
      >
        <div className={'__modal-content'}>
          <div className={'__gift-reward-image-wrap'}>
            <img
              alt='gift'
              className={'__gift-reward-image'}
              src={giftMythReward}
            />
          </div>

          <div className={'__token-value-wrapper'}>
            <Logo
              className={'__token-logo'}
              network={'mythos'}
              shape={'squircle'}
              size={30.77}
            />
            <div className={'__token-content-wrapper'}>
              <span className='__token-value'>{toDisplayNumber(totalReward)}&nbsp;</span>
              <span className='__token-symbol'>{'MYTH'}</span>
            </div>
          </div>

        </div>
      </SwModal>
    </>
  );
}

const MythicalAlertRewardModal = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.ant-sw-modal-body': {
      margin: 0,
      padding: `${token.paddingXL}px ${token.paddingXL}px 27px ${token.paddingXL}px`,
      position: 'relative'
    },

    '.ant-sw-modal-body:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: '-3px',
      top: '-26px',
      zIndex: 1,
      width: '100%',
      height: '100%',
      backgroundPosition: 'center center',
      backgroundSize: '100% 100%',
      backgroundImage: 'url(/images/mythical/gift-myth-reward-mask-image.png)'
    },

    '.ant-sw-modal-title': {
      '.ant-sw-header-container-center': {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        padding: '0 8px'
      }
    },

    '.ant-sw-header-center-part.ant-sw-header-center-part': {
      marginLeft: 16,
      marginRight: 16
    },

    '.ant-sw-modal-footer': {
      display: 'flex',
      borderTop: 0,
      gap: 11,
      paddingBottom: 34,
      justifyContent: 'center'
    },

    '.ant-sw-header-center-part': {
      position: 'relative',
      marginLeft: 16,
      marginRight: 16
    },

    '.ant-sw-sub-header-title-content.ant-sw-sub-header-title-content.ant-sw-sub-header-title-content': {
      color: token.colorWhite,
      textAlign: 'center',
      fontFamily: extendToken.fontPermanentMarker,
      fontWeight: 400,
      lineHeight: '40px',
      fontSize: 32,
      textTransform: 'uppercase',
      'white-space': 'normal'
    },

    '&.ant-sw-modal .ant-sw-modal-body.ant-sw-modal-body': {
      paddingTop: 42
    },

    '.ant-sw-modal-content.ant-sw-modal-content': {
      borderRadius: 0,
      paddingTop: 27,
      backgroundImage: 'url(/images/mythical/alert-modal-bg.png)',
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat',
      // filter: 'drop-shadow(4px 6px 0px #000)',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      width: '100%'
    },

    '.__modal-content': {
      color: extendToken.mythColorGray1,
      fontSize: 16,
      fontFamily: extendToken.fontBarlowCondensed,
      display: 'flex',
      flexDirection: 'column',
      gap: 25.81,
      lineHeight: '18px',
      textAlign: 'center',
      letterSpacing: 0.32,
      paddingLeft: 22,
      paddingRight: 22,
      fontWeight: 400,
      position: 'relative',
      zIndex: 2
    },

    '.__buttons-container': {
      display: 'flex',
      gap: 12,
      justifyContent: 'space-between',
      flex: 1
    },

    '.__action-button': {
      height: 52,
      paddingLeft: 12,
      paddingRight: 10,

      '.__button-content': {
        fontSize: '22px',
        lineHeight: '24px',
        color: extendToken.mythColorDark
      },

      '.__button-background': {
        // filter: 'drop-shadow(1.444px 2.167px 0px #000)'
      },

      '.__button-background:before': {
        maskSize: '100% 100%',
        maskPosition: 'top left'
      },

      '.__button-inner': {
        flexDirection: 'row-reverse'
      }
    },

    '.__left-button': {
      maxWidth: '45%',
      flex: '1 5 auto',

      '.__button-inner': {
        gap: 4
      },

      '.__action-button-icon': {
        order: 1,
        color: extendToken.mythColorDark,
        fontSize: 24
      },

      '.__button-background:before': {
        backgroundColor: token.colorWhite,
        maskImage: 'url(/images/mythical/alert-modal-cancel-button.png)'
      }
    },

    '.__right-button': {
      flex: '1 0 auto',

      '.__button-inner': {
        gap: 4
      },

      '.__button-background:before': {
        backgroundColor: token.colorPrimary,
        maskImage: 'url(/images/mythical/alert-modal-ok-button.png)'
      }
    },

    '.__token-value': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '32px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: '-0.16px',
      color: token.colorWhite
    },

    '.__token-symbol': {
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '32px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '18px',
      color: extendToken.mythColorGray2,
      letterSpacing: '-0.16px'
    },

    '.__token-logo': {
      marginRight: token.marginXS
    },

    '.__token-value-wrapper': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    },

    '.__token-content-wrapper': {
      justifyContent: 'center',
      display: 'inline-flex',
      alignItems: 'baseline'
    },

    '.__gift-reward-image': {
      width: 213.4,
      height: 164.67
    },

    '.__icon-close, .icon-info': {
      width: 30,
      height: 32
    }
  };
});

export default MythicalAlertRewardModal;
