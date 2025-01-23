// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { LayoutBaseProps } from '@subwallet/extension-koni-ui/components/Layout/base/Base';
import { VISIT_INVITATION_SCREEN_FLAG } from '@subwallet/extension-koni-ui/constants';
import { CUSTOMIZE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { ButtonProps, Icon, ModalContext, Tooltip } from '@subwallet/react-ui';
import { Export, FadersHorizontal, MagnifyingGlass } from 'phosphor-react';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

type Props = {
  children?: React.ReactNode;
  showGiftIcon?: boolean;
  showFilterIcon?: boolean;
  showSearchIcon?: boolean;
  onClickFilterIcon?: () => void;
  onClickSearchIcon?: () => void;
  showTabBar?: boolean
  backgroundStyle?: LayoutBaseProps['backgroundStyle'];
  backgroundImages?: LayoutBaseProps['backgroundImages'];
  onTabSelected?: LayoutBaseProps['onTabSelected'];
  className?: string;
};

const Component = (props: Props) => {
  const { backgroundImages, backgroundStyle, children, className, onClickFilterIcon, onClickSearchIcon, onTabSelected, showFilterIcon, showGiftIcon, showSearchIcon, showTabBar } = props;
  const navigate = useNavigate();
  const [, setIsVisitedInvitationScreen] = useLocalStorage(VISIT_INVITATION_SCREEN_FLAG, false);
  const { t } = useTranslation();
  const { activeModal } = useContext(ModalContext);

  const onOpenCustomizeModal = useCallback(() => {
    activeModal(CUSTOMIZE_MODAL);
  }, [activeModal]);

  const onOpenInvite = useCallback(() => {
    navigate('/home/invite');
    setIsVisitedInvitationScreen(true);
  }, [navigate, setIsVisitedInvitationScreen]);

  const headerIcons = useMemo<ButtonProps[]>(() => {
    const icons: ButtonProps[] = [];

    if (showFilterIcon) {
      icons.push({
        icon: (
          <Icon
            phosphorIcon={FadersHorizontal}
            size='md'
          />
        ),
        onClick: onClickFilterIcon || onOpenCustomizeModal
      });
    }

    if (showSearchIcon) {
      icons.push({
        icon: (
          <Icon
            phosphorIcon={MagnifyingGlass}
            size='md'
          />
        ),
        onClick: onClickSearchIcon
      });
    }

    if (showGiftIcon) {
      icons.push({
        icon: (
          <>
            <Icon
              customSize={'20px'}
              phosphorIcon={Export}
              weight={'fill'}
            />

            <Tooltip
              className={'invite-tooltip'}
              open={false}
              overlayClassName={'tooltip-overlay'}
              placement={'bottomRight'}
              title={t('Invite your friend')}
            >
              <div>
              </div>
            </Tooltip>
          </>
        ),
        className: 'invite-button',
        onClick: onOpenInvite
      });
    }

    return icons;
  }, [showFilterIcon, showSearchIcon, showGiftIcon, onClickFilterIcon, onOpenCustomizeModal, onClickSearchIcon, t, onOpenInvite]);

  const onClickLeftButton = useCallback(() => {
    navigate('/ai-agent');
  }, [navigate]);

  return (
    <Layout.Base
      backgroundImages={backgroundImages}
      backgroundStyle={backgroundStyle}
      className={className}
      headerCenter={false}
      headerIcons={headerIcons}
      headerLeft={(
        <>
          <svg
            className='__icon'
            fill='none'
            height='24'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle
              cx='12'
              cy='12'
              fill='#1F1F23'
              r='12'
            />
            <path
              d='M20 12.4871L16 10.6604V9.83607L20 8V8.9274L16.6745 10.4075V10.0796L20 11.5597V12.4871Z'
              fill='white'
            />
            <path
              d='M9 15L16 15V17.2473C16 17.6689 15.9123 18.0391 15.7369 18.3582C15.5615 18.6772 15.311 18.925 14.9852 19.1016C14.6595 19.2839 14.2774 19.375 13.8389 19.375C13.4004 19.375 13.0183 19.2839 12.6926 19.1016C12.3732 18.925 12.1226 18.6772 11.9409 18.3582C11.7655 18.0448 11.6779 17.6746 11.6779 17.2473V15.8374L9 15.8374L9 15ZM12.5235 15.8374V17.2729C12.5235 17.5293 12.5767 17.7515 12.6832 17.9395C12.7897 18.1274 12.9432 18.2727 13.1436 18.3752C13.3441 18.4778 13.5758 18.5291 13.8389 18.5291C14.1083 18.5291 14.34 18.4778 14.5342 18.3752C14.7347 18.2727 14.8881 18.1274 14.9946 17.9395C15.1011 17.7515 15.1544 17.5293 15.1544 17.2729V15.8374L12.5235 15.8374Z'
              fill='white'
            />
            <path
              clipRule='evenodd'
              d='M6.5 12.6154C7.66829 12.6154 8.61538 11.6683 8.61538 10.5C8.61538 9.33171 7.66829 8.38462 6.5 8.38462C5.33171 8.38462 4.38462 9.33171 4.38462 10.5C4.38462 11.6683 5.33171 12.6154 6.5 12.6154ZM6.5 13C7.88071 13 9 11.8807 9 10.5C9 9.11929 7.88071 8 6.5 8C5.11929 8 4 9.11929 4 10.5C4 11.8807 5.11929 13 6.5 13Z'
              fill='white'
              fillRule='evenodd'
            />
            <path
              d='M6.5 8C6.00555 8 5.5222 8.14662 5.11107 8.42133C4.69995 8.69603 4.37952 9.08648 4.1903 9.54329C4.00108 10.0001 3.95157 10.5028 4.04804 10.9877C4.1445 11.4727 4.3826 11.9181 4.73223 12.2678C5.08186 12.6174 5.52732 12.8555 6.01227 12.952C6.49723 13.0484 6.99989 12.9989 7.45671 12.8097C7.91352 12.6205 8.30397 12.3 8.57867 11.8889C8.85338 11.4778 9 10.9945 9 10.5L6.5 10.5L6.5 8Z'
              fill='white'
            />
          </svg>

          <span className='__label'>
            Ask <strong>Tell Me Agent</strong> anything!
          </span>
        </>
      )}
      headerOnClickLeft={onClickLeftButton}
      headerPaddingVertical={true}
      onTabSelected={onTabSelected}
      showHeader={true}
      showLeftButton={true}
      showTabBar={showTabBar ?? true}
    >
      {children}
    </Layout.Base>
  );
};

export const Home = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({
  '.ant-sw-header-left-part': {
    marginLeft: 16,

    '.ant-btn.ant-btn': {
      backgroundColor: token.colorTextLight4,
      gap: 6,
      height: 32,
      lineHeight: '32px',
      paddingLeft: 4,
      paddingRight: 12,
      borderRadius: 24
    }
  }
}));
