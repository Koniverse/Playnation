// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { WC_DEFAULT_CHAIN_ID } from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { EmptyList, GameAccountAvatar } from '@subwallet/extension-koni-ui/components';
import WalletConnectStats from '@subwallet/extension-koni-ui/components/EmptyList/WalletConnectStats';
import NFTListModal from '@subwallet/extension-koni-ui/components/Modal/NFTListModal';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount, IntegratedProfileResult } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useNotification, useSetCurrentPage } from '@subwallet/extension-koni-ui/hooks';
import { wcSignMessageRequest } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, toDisplayNumber, toShort } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, ModalContext } from '@subwallet/react-ui';
import { ArrowSquareIn, Copy, ShareNetwork, SmileySad } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { stringToHex } from '@polkadot/util';

type Props = ThemeProps;
const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;
const nftListModalId = 'nft-list-modal';

const Component: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const { wcAccount } = useSelector((state: RootState) => state.accountState);
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);
  const [addressLinked, setAddressLinked] = useState<string | undefined>(apiSDK.addressLinked);
  const { connectWC, requireWC, waitingSigningModal: { close: closeWaiting, open: openWaiting } } = useContext(WalletConnectContext);
  const [accountIntegrationProfile, setAccountIntegrationProfile] = useState<IntegratedProfileResult | undefined>();
  const { activeModal } = useContext(ModalContext);
  const notify = useNotification();
  const { t } = useTranslation();

  useSetCurrentPage('/home/account');

  const onCopyAddress = useCallback(() => {
    copyToClipboard(wcAccount?.address || '');
    notify({
      message: t('Copied to clipboard')
    });
  }, [wcAccount?.address, notify, t]);

  const currentPoint = account?.attributes.accumulatePoint || 0;

  const openNftModal = useCallback(() => {
    activeModal(nftListModalId);
  }, [activeModal]);

  const onClickShare = useCallback(() => {
    if (!accountIntegrationProfile?.totalTransactions) {
      return;
    }

    const inviteLink = apiSDK.getInviteURL();

    const content = `Just checked my @koniverse Integrated Profile and found that I’ve made ${accountIntegrationProfile?.totalTransactions} transactions on @StoryProtocol Odyssey 🎉%0AWanna see yours? Join me now on @koniverse 👉`;
    const url = `http://x.com/share?text=${content}&url=${inviteLink}`;

    if (url) {
      telegramConnector.openLink(url);
    }
  }, [accountIntegrationProfile?.totalTransactions]);

  const remainingTransactionsValue = useMemo(() => {
    const profile = accountIntegrationProfile;

    if (!profile) {
      return 0;
    }

    const remainingValue = profile.totalTransactions - profile.totalSwapPiperXTransactions - profile.totalStakeVerioTransactions;

    return remainingValue < 0 ? 0 : remainingValue;
  }, [accountIntegrationProfile]);

  const connectWalletConnect = useCallback(() => {
    const fnc = async () => {
      try {
        await requireWC();
        const address = await connectWC();

        const message = `Approve use this address to set linked address: ${address}`;

        openWaiting();

        try {
          await wcSignMessageRequest({
            address: address,
            chainId: WC_DEFAULT_CHAIN_ID,
            payload: stringToHex(message),
            method: 'personal_sign'
          });

          apiSDK.setAddressLinking(address);
          closeWaiting();
        } catch (e) {
          closeWaiting();

          const error = e as Error;

          console.error('Fail to get signature', error);

          if (error.message.toLowerCase().includes('user rejected'.toLowerCase())) {
            notify({
              message: t('You’ve rejected this request'),
              type: 'error',
              duration: null
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fnc().catch(console.error);
  }, [closeWaiting, connectWC, notify, openWaiting, requireWC, t]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount()
      .subscribe((data) => {
        setAccount(data);
      });

    const addressLinkedSub = apiSDK.subscribeAddressLinked()
      .subscribe((data) => {
        setAddressLinked(data);
      });

    return () => {
      accountSub.unsubscribe();
      addressLinkedSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiSDK.getStatsOfAddress();

        setAccountIntegrationProfile(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats().catch(console.error);
  }, []);

  useEffect(() => {
    const profileSub = apiSDK.subscribeAccountIntegrationProfile()
      .subscribe((data) => {
        setAccountIntegrationProfile(data);
      });

    return () => {
      profileSub.unsubscribe();
    };
  }, []);

  return (
    <div className={className}>
      <div className='account-info-area'>
        <GameAccountAvatar
          avatarPath={account?.info.photoUrl || undefined}
          className={'account-avatar'}
          hasBoxShadow
          size={'custom'}
        />

        <div className='account-name'>{account?.info.telegramUsername}</div>
        {addressLinked && <div className='account-address-wrapper'>
          <div className='account-address'>
            ({toShort(addressLinked, 12, 5)})
          </div>

          <div className='account-address-copy-button-wrapper'>
            <Button
              className={'account-address-copy-button'}
              icon={(
                <Icon
                  customSize={'20px'}
                  phosphorIcon={Copy}
                  weight={'fill'}
                />
              )}
              onClick={onCopyAddress}
              size={'xs'}
              type={'ghost'}
            />
          </div>
        </div>}
      </div>
      <div className={'block-info-account'}>
        <div className={'left-block-info-account'}>
          <div className={'left-block-info-account-label'}>You have</div>
          <div className={'left-block-info-account-value'}>{toDisplayNumber(currentPoint)}</div>
          <div className={'left-block-info-account-unit'}>Story Point (SP)</div>
        </div>
        <div className={'block-info-account-separator'}></div>
        <div className={'right-block-info-account'}>
          <div className={'right-block-info-account-label'}>Active day</div>
          <div className={'right-block-info-account-value'}>{toDisplayNumber(accountIntegrationProfile?.loginCount)}</div>
          <div className={'right-block-info-account-unit'}>days</div>
        </div>
      </div>
      {!!addressLinked && accountIntegrationProfile && (
        <div className='block-stats-info'>
          <div className={'block-stats'}>
            <div className={'block-stats-left'}>Your IPventure Stats</div>
            <div className={'block-stats-right'}>
              <div className={'block-stats-right-value'}>{toDisplayNumber(accountIntegrationProfile?.totalTransactions)}</div>
              <div className={'block-stats-right-unit'}>Transactions</div>
            </div>
          </div>
          <div className={'block-content-wrapper'}>
            <div className={'block-content1'}>
              <div className={'block-content-label'}>Stake</div>
              <div className={'block-content-value'}>{toDisplayNumber(accountIntegrationProfile?.totalStakeVerioTransactions)}</div>
              <div className={'block-content-unit'}>Transactions</div>
            </div>
            <div className={'block-content2'}>
              <div className={'block-content-label'}>Swap</div>
              <div className={'block-content-value'}>{toDisplayNumber(accountIntegrationProfile?.totalSwapPiperXTransactions)}</div>
              <div className={'block-content-unit'}>Transactions</div>
            </div>
            <div className={'block-content3'}>
              <div className={'block-content-label'}>
                <div className={'nft-label'}>NFT</div>
                <div
                  className={'nft-arrow-icon'}
                  onClick={openNftModal}
                >
                  <Icon
                    customSize={'20px'}
                    phosphorIcon={ArrowSquareIn}
                    weight={'fill'}
                  />
                </div>
              </div>
              <div className={'block-content-value'}>{toDisplayNumber(accountIntegrationProfile?.totalBadgeNFTsOwned)}</div>
              <div className={'block-content-unit'}>NFTs</div>
            </div>
            <div className={'block-content4'}>
              <div className={'block-content-label'}>Others</div>
              <div className={'block-content-value'}>{toDisplayNumber(remainingTransactionsValue)}</div>
              <div className={'block-content-unit'}>Transactions</div>
            </div>
          </div>
          <Button
            block={true}
            className={'share-button'}
            icon={(
              <Icon
                customSize={'20px'}
                phosphorIcon={ShareNetwork}
                weight={'fill'}
              />
            )}
            onClick={onClickShare}
            schema={'primary'}
            shape={'round'}
            size={'sm'}
          >
            {t('Share')}
          </Button>
        </div>
      )}

      {!accountIntegrationProfile && wcAccount && (
        <div className='block-stats-info'>
          <div className={'empty-list-label'}>Your IPventure Stats</div>
          <EmptyList
            className={'empty-list-block'}
            emptyTitle={t('Uh oh, no transactions found')}
            phosphorIcon={SmileySad}
          />
        </div>
      )}

      {!addressLinked && (
        <div className='block-stats-info'>
          <WalletConnectStats
            className={'wallet-connect-stats'}
            handleWalletConnect={connectWalletConnect}
          />
        </div>
      )}
      <NFTListModal />
    </div>
  );
};

const AccountDetail = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    // account
    paddingTop: token.paddingXXS,
    paddingLeft: token.paddingXS,
    paddingRight: token.paddingXS,
    paddingBottom: 24,

    '.block-info-account': {
      display: 'flex',
      background: token.colorWhite,
      borderRadius: '20px 20px',
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16,
      alignItems: 'center',
      textAlign: 'left',

      '.block-info-account-separator': {
        backgroundColor: token.colorBgDivider,
        width: 2,
        marginLeft: 8,
        marginRight: 8,
        strokeWidth: 1,
        height: 64
      },

      '.left-block-info-account, .right-block-info-account': {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      },

      '.left-block-info-account': {
        flex: 1,
        paddingRight: 8
      },

      '.right-block-info-account': {
        minWidth: 142,
        paddingLeft: 16
      },

      '.left-block-info-account-label, .right-block-info-account-label': {
        color: token.colorTextDark3,
        fontSize: token.fontSizeSM,
        fontWeight: token.bodyFontWeight,
        lineHeight: token.lineHeightSM
      },
      '.left-block-info-account-value, .right-block-info-account-value': {
        color: token.colorTextBase,
        fontSize: token.fontSizeHeading3,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading3
      },
      '.left-block-info-account-unit, .right-block-info-account-unit': {
        color: token.colorTextLabel,
        fontSize: token.fontSize,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading3
      }
    },

    '.block-stats-info': {
      display: 'flex',
      background: token.colorWhite,
      borderRadius: '20px 20px',
      marginTop: 12,
      paddingTop: 12,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 12,
      flexDirection: 'column',

      '.block-stats': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center'
      },

      '.block-content-wrapper': {
        marginTop: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12
      },

      '.block-stats-left, .block-stats-right-unit, .empty-list-label': {
        color: token.colorText,
        fontSize: token.fontSizeLG,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading3
      },

      '.empty-list-label': {
        paddingTop: 14,
        paddingBottom: 18
      },

      '.block-stats-right': {
        textAlign: 'right'
      },

      '.block-stats-right-value': {
        color: token.colorText,
        fontSize: token.fontSizeHeading3,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading3
      },

      '.block-stats-right-unit': {
        color: token.colorTextLabel
      },

      '.block-content-label': {
        fontSize: token.fontSizeSM,
        fontWeight: 700,
        lineHeight: token.lineHeightHeading3,
        color: token.colorTextSecondary
      },
      '.block-content-value': {
        fontSize: token.fontSizeXL,
        fontWeight: token.fontWeightStrong,
        lineHeight: token.lineHeightHeading3,
        color: token.colorTextBase
      },
      '.block-content-unit': {
        fontSize: token.fontSizeSM,
        fontWeight: token.bodyFontWeight,
        lineHeight: token.lineHeightSM,
        color: token.colorTextSecondary
      },

      '.block-content1, .block-content2, .block-content3, .block-content4': {
        borderRadius: 12,
        backgroundColor: token.colorFillSecondary,
        display: 'flex',
        padding: '8px 16px 10px 16px',
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 4
      },

      '.block-content3': {
        '.block-content-label': {
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%'
        },
        '.nft-arrow-icon:hover': {
          cursor: 'pointer'
        }
      },

      '.share-button': {
        marginTop: 12,
        background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)',
        '.ant-btn-content-wrapper': {
          color: token.colorTextDark1,
          fontSize: token.fontSize,
          fontWeight: token.bodyFontWeight,
          lineHeight: token.lineHeightSM
        },
        '.anticon': {
          color: token.colorTextBase
        }
      },

      '.wallet-connect-stats': {
        paddingTop: 21,
        paddingBottom: 13,
        paddingLeft: 12,
        paddingRight: 12,
        '.empty_icon_wrapper': {
          paddingBottom: 24,
          marginBottom: 0
        },
        '.empty_title': {
          fontSize: token.fontSizeLG,
          fontWeight: token.fontWeightStrong,
          lineHeight: token.lineHeightHeading3,
          marginBottom: 9
        },
        '.ant-btn-content-wrapper': {
          fontSize: token.fontSize,
          fontWeight: token.bodyFontWeight,
          lineHeight: token.lineHeightSM
        },
        '.anticon': {
          fontSize: token.fontSizeXL
        },
        '.ant-btn': {
          minWidth: 173
        }
      },

      '.empty-list-block': {
        paddingBottom: 26,
        paddingRight: 19,
        paddingLeft: 19,
        '.empty_title': {
          marginBottom: 0
        }
      }
    },

    '.account-info-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 19,

      '.account-avatar': {
        borderWidth: 2,
        width: 92,
        height: 92,
        minWidth: 92,

        '.__inner': {
          borderWidth: 4
        },

        '.__avatar-image': {
          borderWidth: 2
        }
      }
    },

    '.account-name': {
      fontSize: token.fontSizeHeading4,
      lineHeight: token.lineHeightHeading3,
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1,
      marginBottom: token.marginXXS
    },

    '.account-address-wrapper': {
      color: token.colorTextDark3,
      fontSize: token.fontSizeSM,
      lineHeight: token.lineHeightSM,
      display: 'flex',
      gap: token.sizeXXS
    },

    '.account-address-copy-button-wrapper': {
      minWidth: 20,
      height: 20,
      position: 'relative'
    },

    '.account-address-copy-button': {
      position: 'absolute',
      left: -10,
      top: -10,
      color: token.colorTextDark3
    },

    '.account-detail-area': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      background: token.colorWhite,
      borderRadius: '20px 20px 0 0',
      paddingTop: 24,
      paddingBottom: 24,

      '.__title': {
        fontSize: 20,
        marginBottom: 24
      },

      '.__point': {
        fontSize: 44,
        fontWeight: 700
      }
    },

    '.invitation-area': {
      paddingTop: token.paddingXS,
      borderRadius: '0 0 20px 20px'
    },

    '.block-info-card .separator': {
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',

      '.__left, .__right, .__center': {
        height: 32,
        backgroundColor: token.colorWhite
      },

      '.__left, .__right': {
        width: 32
      },

      '.__center': {
        flex: 1
      },

      '.__left': {
        clipPath: 'path("M 0 0 L 32 0 L 32 32 L 0 32 L 0 31 C 16 28 16 4 0 1 L 0 0 Z")'
      },

      '.__right': {
        clipPath: 'path("M 0 0 L 32 0 L 32 1 C 16 4 16 28 32 31 L 32 32 L 0 32 L 0 0 Z")'
      },

      hr: {
        border: 0,
        width: '93%',
        marginTop: 15,
        borderTop: '1px dashed rgba(31, 31, 35, 0.12)'
      }
    }
  };
});

export default AccountDetail;
