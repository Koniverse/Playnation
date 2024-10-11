// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { rankPointMap } from '@subwallet/extension-koni-ui/constants';
import { useNotification, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { copyToClipboard, toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Copy, UserCirclePlus } from 'phosphor-react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

interface Props extends ThemeProps {
  hideCopyLink?: boolean;
}

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const Component = ({ className, hideCopyLink }: Props) => {
  const { t } = useTranslation();
  const invitePoint = useMemo(() => (rankPointMap.iron || 0), []);
  const notify = useNotification();

  const inviteURL = useMemo(() => {
    const encodeURL = apiSDK.getInviteURL();

    return `https://t.me/share/url?url=${encodeURL}&text=${encodeURIComponent('Invite your friend and earn a bonus gift for each friend you bring in!')}`;
  }, []);

  const inviteFriend = useCallback(() => {
    telegramConnector.openTelegramLink(inviteURL);
  }, [inviteURL]);

  const copyLink = useCallback(() => {
    copyToClipboard(apiSDK.getInviteURL());

    notify({
      key: 'invite-copied',
      message: t('Copied to clipboard')
    });
  }, [notify, t]);

  return (
    <div className={CN('invitation-area', className)}>
      <div className='invitation-text'>
        {t('Invite friends and get more SP!')}
      </div>

      <div className='invitation-reward'>
        {t('Up to')} <b>{toDisplayNumber(invitePoint)} SP</b> {t('per invite!')}
      </div>

      <div className='invitation-buttons'>
        <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={UserCirclePlus}
              weight={'fill'}
            />
          )}
          onClick={inviteFriend}
          schema={'primary'}
          shape={'round'}
          size={hideCopyLink ? 'sm' : 'xs'}
        >
          {t('Invite now')}
        </Button>

        {!hideCopyLink && <Button
          block={true}
          icon={(
            <Icon
              customSize={'20px'}
              phosphorIcon={Copy}
              weight={'fill'}
            />
          )}
          onClick={copyLink}
          schema={'secondary'}
          shape={'round'}
          size={'xs'}
        >
          {t('Copy link')}
        </Button>}
      </div>
    </div>
  );
};

const InviteCTA = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  backgroundColor: token.colorWhite,
  borderRadius: 20,
  padding: token.padding,
  paddingBottom: token.paddingLG,
  marginBottom: token.margin,

  '.invitation-text': {
    color: token.colorTextDark1,
    fontSize: 16,
    lineHeight: token.lineHeightLG,
    fontWeight: token.headingFontWeight,
    textAlign: 'center',
    marginBottom: token.marginXS
  },

  '.invitation-reward': {
    color: token.colorTextDark3,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    verticalAlign: 'baseline',
    textAlign: 'center',
    marginBottom: 22,

    b: {
      color: token.colorTextDark1,
      fontSize: 16
    }
  },

  '.invitation-reward-token': {
    display: 'inline-block',
    width: 20,
    height: 20,
    marginLeft: token.marginXXS
  },

  '.invitation-buttons': {
    display: 'flex',
    gap: token.sizeSM
  }

}));

export default InviteCTA;
