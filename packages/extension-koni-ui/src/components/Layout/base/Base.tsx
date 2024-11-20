// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ClaimableAchievement } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useDefaultNavigate, useSelector } from '@subwallet/extension-koni-ui/hooks';
import { LayoutBackgroundStyle, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon, SwScreenLayout, SwScreenLayoutProps } from '@subwallet/react-ui';
import { SwTabBarItem } from '@subwallet/react-ui/es/sw-tab-bar';
import CN from 'classnames';
import { ArrowLeft } from 'phosphor-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SelectAccount from '../parts/SelectAccount';

export interface LayoutBaseProps extends Omit<
SwScreenLayoutProps,
'tabBarItems' | 'footer' | 'headerContent' | 'selectedTabBarItem'
>, ThemeProps {
  children: React.ReactNode | React.ReactNode[];
  backgroundStyle?: LayoutBackgroundStyle;
  onTabSelected?: (key: string) => void
}

const specialLanguages: Array<LanguageType> = ['ja', 'ru'];
const apiSdk = BookaSdk.instance;

const Component = ({ backgroundStyle = 'style-1', children, className, headerIcons, onBack, onTabSelected, ...props }: LayoutBaseProps) => {
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { language } = useSelector((state) => state.settings);
  const [hasClaimableAchievements, setHasClaimableAchievements] = useState(apiSdk.getClaimableAchievementSubject().achievement);

  const tabBarItems = useMemo((): Array<Omit<SwTabBarItem, 'onClick'> & { url: string }> => ([
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <svg
            fill='none'
            height='1em'
            viewBox='0 0 24 24'
            width='1em'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M19.5 3H17.25V2.25C17.25 2.05109 17.171 1.86032 17.0303 1.71967C16.8897 1.57902 16.6989 1.5 16.5 1.5C16.3011 1.5 16.1103 1.57902 15.9697 1.71967C15.829 1.86032 15.75 2.05109 15.75 2.25V3H8.25V2.25C8.25 2.05109 8.17098 1.86032 8.03033 1.71967C7.88968 1.57902 7.69891 1.5 7.5 1.5C7.30109 1.5 7.11032 1.57902 6.96967 1.71967C6.82902 1.86032 6.75 2.05109 6.75 2.25V3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V4.5C21 4.10218 20.842 3.72064 20.5607 3.43934C20.2794 3.15804 19.8978 3 19.5 3ZM10.5 17.25C10.5 17.4489 10.421 17.6397 10.2803 17.7803C10.1397 17.921 9.94891 18 9.75 18C9.55109 18 9.36032 17.921 9.21967 17.7803C9.07902 17.6397 9 17.4489 9 17.25V12.4631L8.58563 12.6713C8.4076 12.7603 8.2015 12.7749 8.01268 12.712C7.82385 12.649 7.66776 12.5137 7.57875 12.3356C7.48974 12.1576 7.47509 11.9515 7.53803 11.7627C7.60097 11.5739 7.73635 11.4178 7.91437 11.3287L9.41437 10.5787C9.52876 10.5215 9.65589 10.4945 9.78367 10.5002C9.91145 10.506 10.0356 10.5443 10.1444 10.6116C10.2532 10.6788 10.343 10.7728 10.4052 10.8845C10.4675 10.9963 10.5001 11.1221 10.5 11.25V17.25ZM15.75 16.5C15.9489 16.5 16.1397 16.579 16.2803 16.7197C16.421 16.8603 16.5 17.0511 16.5 17.25C16.5 17.4489 16.421 17.6397 16.2803 17.7803C16.1397 17.921 15.9489 18 15.75 18H12.75C12.6107 18 12.4742 17.9612 12.3557 17.888C12.2372 17.8148 12.1415 17.71 12.0792 17.5854C12.0169 17.4608 11.9905 17.3214 12.003 17.1826C12.0155 17.0439 12.0664 16.9114 12.15 16.8L14.8481 13.2028C14.9095 13.1211 14.9535 13.0277 14.9775 12.9284C15.0015 12.8291 15.0049 12.7259 14.9876 12.6252C14.9703 12.5245 14.9325 12.4284 14.8767 12.3428C14.8209 12.2572 14.7482 12.1839 14.6631 12.1274C14.5779 12.0709 14.4821 12.0324 14.3816 12.0143C14.281 11.9961 14.1778 11.9987 14.0783 12.0219C13.9788 12.0451 13.885 12.0884 13.8028 12.1491C13.7206 12.2098 13.6517 12.2867 13.6003 12.375C13.5525 12.463 13.4876 12.5406 13.4093 12.6031C13.3311 12.6656 13.2411 12.7118 13.1447 12.739C13.0483 12.7661 12.9474 12.7737 12.8481 12.7613C12.7487 12.7489 12.6528 12.7166 12.5661 12.6665C12.4794 12.6165 12.4035 12.5495 12.3431 12.4696C12.2827 12.3898 12.2389 12.2986 12.2142 12.2015C12.1896 12.1044 12.1847 12.0034 12.1997 11.9044C12.2148 11.8054 12.2495 11.7104 12.3019 11.625C12.5496 11.1963 12.9319 10.8612 13.3894 10.6718C13.8469 10.4824 14.3541 10.4493 14.8324 10.5774C15.3107 10.7056 15.7333 10.988 16.0348 11.3808C16.3363 11.7736 16.4998 12.2548 16.5 12.75C16.5016 13.2391 16.3421 13.7152 16.0463 14.1047L14.25 16.5H15.75ZM4.5 7.5V4.5H6.75V5.25C6.75 5.44891 6.82902 5.63968 6.96967 5.78033C7.11032 5.92098 7.30109 6 7.5 6C7.69891 6 7.88968 5.92098 8.03033 5.78033C8.17098 5.63968 8.25 5.44891 8.25 5.25V4.5H15.75V5.25C15.75 5.44891 15.829 5.63968 15.9697 5.78033C16.1103 5.92098 16.3011 6 16.5 6C16.6989 6 16.8897 5.92098 17.0303 5.78033C17.171 5.63968 17.25 5.44891 17.25 5.25V4.5H19.5V7.5H4.5Z'
              fill='currentColor'
            />
          </svg>
        )
      },
      label: t('Events'),
      key: 'events',
      url: '/home/events'
    },
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <>
            <svg
              fill='none'
              height='1em'
              viewBox='0 0 24 24'
              width='1em'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M19.5 3H4.5C4.10218 3 3.72064 3.15804 3.43934 3.43934C3.15804 3.72064 3 4.10218 3 4.5V19.5C3 19.8978 3.15804 20.2794 3.43934 20.5607C3.72064 20.842 4.10218 21 4.5 21H19.5C19.8978 21 20.2794 20.842 20.5607 20.5607C20.842 20.2794 21 19.8978 21 19.5V4.5C21 4.10218 20.842 3.72064 20.5607 3.43934C20.2794 3.15804 19.8978 3 19.5 3ZM11.0306 14.0306L8.03063 17.0306C7.96097 17.1004 7.87825 17.1557 7.78721 17.1934C7.69616 17.2312 7.59856 17.2506 7.5 17.2506C7.40144 17.2506 7.30384 17.2312 7.21279 17.1934C7.12175 17.1557 7.03903 17.1004 6.96937 17.0306L5.46938 15.5306C5.32864 15.3899 5.24958 15.199 5.24958 15C5.24958 14.801 5.32864 14.6101 5.46938 14.4694C5.61011 14.3286 5.80098 14.2496 6 14.2496C6.19902 14.2496 6.38989 14.3286 6.53063 14.4694L7.5 15.4397L9.96937 12.9694C10.1101 12.8286 10.301 12.7496 10.5 12.7496C10.699 12.7496 10.8899 12.8286 11.0306 12.9694C11.1714 13.1101 11.2504 13.301 11.2504 13.5C11.2504 13.699 11.1714 13.8899 11.0306 14.0306ZM11.0306 8.03063L8.03063 11.0306C7.96097 11.1004 7.87825 11.1557 7.78721 11.1934C7.69616 11.2312 7.59856 11.2506 7.5 11.2506C7.40144 11.2506 7.30384 11.2312 7.21279 11.1934C7.12175 11.1557 7.03903 11.1004 6.96937 11.0306L5.46938 9.53063C5.39969 9.46094 5.34442 9.37822 5.30671 9.28717C5.26899 9.19613 5.24958 9.09855 5.24958 9C5.24958 8.80098 5.32864 8.61011 5.46938 8.46937C5.61011 8.32864 5.80098 8.24958 6 8.24958C6.19902 8.24958 6.38989 8.32864 6.53063 8.46937L7.5 9.43969L9.96937 6.96937C10.1101 6.82864 10.301 6.74958 10.5 6.74958C10.699 6.74958 10.8899 6.82864 11.0306 6.96937C11.1714 7.11011 11.2504 7.30098 11.2504 7.5C11.2504 7.69902 11.1714 7.88989 11.0306 8.03063ZM18 15.75H13.5C13.3011 15.75 13.1103 15.671 12.9697 15.5303C12.829 15.3897 12.75 15.1989 12.75 15C12.75 14.8011 12.829 14.6103 12.9697 14.4697C13.1103 14.329 13.3011 14.25 13.5 14.25H18C18.1989 14.25 18.3897 14.329 18.5303 14.4697C18.671 14.6103 18.75 14.8011 18.75 15C18.75 15.1989 18.671 15.3897 18.5303 15.5303C18.3897 15.671 18.1989 15.75 18 15.75ZM18 9.75H13.5C13.3011 9.75 13.1103 9.67098 12.9697 9.53033C12.829 9.38968 12.75 9.19891 12.75 9C12.75 8.80109 12.829 8.61032 12.9697 8.46967C13.1103 8.32902 13.3011 8.25 13.5 8.25H18C18.1989 8.25 18.3897 8.32902 18.5303 8.46967C18.671 8.61032 18.75 8.80109 18.75 9C18.75 9.19891 18.671 9.38968 18.5303 9.53033C18.3897 9.67098 18.1989 9.75 18 9.75Z'
                fill='currentColor'
              />
            </svg>
            { hasClaimableAchievements && <div className={'__notice-icon-tabbar'}></div>}
          </>
        )
      },
      label: t('Tasks'),
      key: 'mission',
      url: '/home/mission'
    },
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <svg
            fill='none'
            height='1em'
            viewBox='0 0 24 24'
            width='1em'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M22.5 18.75H21.75V13.5C21.75 13.1022 21.592 12.7206 21.3107 12.4393C21.0294 12.158 20.6478 12 20.25 12H16.5V5.25C16.5 4.85218 16.342 4.47064 16.0607 4.18934C15.7794 3.90804 15.3978 3.75 15 3.75H9C8.60218 3.75 8.22064 3.90804 7.93934 4.18934C7.65804 4.47064 7.5 4.85218 7.5 5.25V8.25H3.75C3.35218 8.25 2.97064 8.40804 2.68934 8.68934C2.40804 8.97064 2.25 9.35218 2.25 9.75V18.75H1.5C1.30109 18.75 1.11032 18.829 0.96967 18.9697C0.829018 19.1103 0.75 19.3011 0.75 19.5C0.75 19.6989 0.829018 19.8897 0.96967 20.0303C1.11032 20.171 1.30109 20.25 1.5 20.25H22.5C22.6989 20.25 22.8897 20.171 23.0303 20.0303C23.171 19.8897 23.25 19.6989 23.25 19.5C23.25 19.3011 23.171 19.1103 23.0303 18.9697C22.8897 18.829 22.6989 18.75 22.5 18.75ZM7.5 18.75H3.75V9.75H7.5V18.75ZM13.125 12.75C13.125 12.9489 13.046 13.1397 12.9053 13.2803C12.7647 13.421 12.5739 13.5 12.375 13.5C12.1761 13.5 11.9853 13.421 11.8447 13.2803C11.704 13.1397 11.625 12.9489 11.625 12.75V10.0406L11.4872 10.0866C11.3937 10.1177 11.2951 10.1301 11.1968 10.1232C11.0986 10.1162 11.0027 10.0899 10.9146 10.0459C10.8265 10.0018 10.7479 9.94085 10.6834 9.86644C10.6188 9.79202 10.5696 9.70563 10.5384 9.61219C10.5073 9.51874 10.4949 9.42008 10.5018 9.32183C10.5088 9.22358 10.5351 9.12767 10.5791 9.03957C10.6232 8.95147 10.6842 8.87291 10.7586 8.80837C10.833 8.74383 10.9194 8.69459 11.0128 8.66344L12.1378 8.28844C12.2506 8.25085 12.3706 8.2406 12.4881 8.25852C12.6056 8.27645 12.7171 8.32203 12.8135 8.39152C12.91 8.46102 12.9885 8.55243 13.0426 8.65822C13.0968 8.76401 13.125 8.88115 13.125 9V12.75ZM20.25 18.75H16.5V13.5H20.25V18.75Z'
              fill='currentColor'
            />
          </svg>
        )
      },
      label: t('Leaderboard'),
      key: 'leaderboard',
      url: '/home/leaderboard'
    },
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <svg
            fill='none'
            height='1em'
            viewBox='0 0 21 18'
            width='1em'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M15.75 3.75H2.25C1.85218 3.75 1.47064 3.90804 1.18934 4.18934C0.908035 4.47064 0.75 4.85218 0.75 5.25V15.75C0.75 16.1478 0.908035 16.5294 1.18934 16.8107C1.47064 17.092 1.85218 17.25 2.25 17.25H15.75C16.1478 17.25 16.5294 17.092 16.8107 16.8107C17.092 16.5294 17.25 16.1478 17.25 15.75V5.25C17.25 4.85218 17.092 4.47064 16.8107 4.18934C16.5294 3.90804 16.1478 3.75 15.75 3.75ZM15.75 15.75H2.25V5.25H15.75V15.75ZM20.25 2.25V13.5C20.25 13.6989 20.171 13.8897 20.0303 14.0303C19.8897 14.171 19.6989 14.25 19.5 14.25C19.3011 14.25 19.1103 14.171 18.9697 14.0303C18.829 13.8897 18.75 13.6989 18.75 13.5V2.25H4.5C4.30109 2.25 4.11032 2.17098 3.96967 2.03033C3.82902 1.88968 3.75 1.69891 3.75 1.5C3.75 1.30109 3.82902 1.11032 3.96967 0.96967C4.11032 0.829018 4.30109 0.75 4.5 0.75H18.75C19.1478 0.75 19.5294 0.908035 19.8107 1.18934C20.092 1.47064 20.25 1.85218 20.25 2.25Z'
              fill='currentColor'
            />
          </svg>
        ),
        weight: 'fill'
      },
      label: t('Cards'),
      key: 'cards',
      url: '/home/cards'
    },
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <svg
            fill='none'
            height='1em'
            viewBox='0 0 21 20'
            width='1em'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M14.625 9.25C14.625 10.0658 14.3831 10.8634 13.9298 11.5417C13.4766 12.2201 12.8323 12.7488 12.0786 13.061C11.3248 13.3732 10.4954 13.4549 9.69526 13.2957C8.89508 13.1366 8.16008 12.7437 7.58319 12.1668C7.0063 11.5899 6.61343 10.8549 6.45427 10.0547C6.2951 9.25458 6.37679 8.42518 6.689 7.67143C7.00121 6.91769 7.52992 6.27345 8.20828 5.82019C8.88663 5.36693 9.68416 5.125 10.5 5.125C11.5936 5.12624 12.6421 5.56124 13.4154 6.33455C14.1888 7.10787 14.6238 8.15636 14.625 9.25ZM20.25 10C20.25 11.9284 19.6782 13.8134 18.6068 15.4168C17.5355 17.0202 16.0127 18.2699 14.2312 19.0078C12.4496 19.7458 10.4892 19.9389 8.59787 19.5627C6.70656 19.1865 4.96928 18.2579 3.60571 16.8943C2.24215 15.5307 1.31355 13.7934 0.937348 11.9021C0.561142 10.0108 0.754225 8.05042 1.49218 6.26884C2.23013 4.48726 3.47982 2.96451 5.08319 1.89317C6.68657 0.821828 8.57164 0.25 10.5 0.25C13.085 0.25273 15.5634 1.28084 17.3913 3.10872C19.2192 4.93661 20.2473 7.41498 20.25 10ZM18.75 10C18.7488 8.88956 18.5237 7.79077 18.0881 6.76934C17.6525 5.7479 17.0154 4.82481 16.2148 4.05525C15.4143 3.2857 14.4668 2.68549 13.429 2.29053C12.3911 1.89556 11.2843 1.71395 10.1747 1.75656C5.75907 1.92719 2.23782 5.605 2.25 10.0234C2.25424 12.0349 2.99609 13.9749 4.335 15.4759C4.88028 14.6851 5.57292 14.0068 6.375 13.4781C6.44339 13.433 6.52469 13.4114 6.60646 13.4169C6.68824 13.4223 6.76599 13.4543 6.82782 13.5081C7.84705 14.3897 9.1496 14.8749 10.4972 14.8749C11.8448 14.8749 13.1473 14.3897 14.1666 13.5081C14.2284 13.4543 14.3061 13.4223 14.3879 13.4169C14.4697 13.4114 14.551 13.433 14.6194 13.4781C15.4225 14.0065 16.1161 14.6848 16.6622 15.4759C18.0077 13.9694 18.751 12.0199 18.75 10Z'
              fill='currentColor'
            />
          </svg>
        ),
        weight: 'fill'
      },
      label: t('Account'),
      key: 'my-profile',
      url: '/home/my-profile'
    }
  ]), [hasClaimableAchievements, t]);

  const selectedTab = useMemo((): string => {
    const isHomePath = pathname.includes('/home');

    if (isHomePath) {
      const pathExcludeHome = pathname.split('/home')[1];
      const currentTab = pathExcludeHome.split('/')[1];

      return currentTab || '';
    }

    return '';
  }, [pathname]);

  const onSelectTab = useCallback(
    (url: string) => () => {
      navigate(url);
    },
    [navigate]
  );

  const defaultOnBack = useCallback(() => {
    goHome();
  }, [goHome]);

  useEffect(() => {
    onTabSelected?.(selectedTab);
  }, [onTabSelected, selectedTab]);

  useEffect(() => {
    const sub1 = apiSdk.subscribeClaimableAchievementSubject().subscribe((claimableAchievement: ClaimableAchievement) => {
      setHasClaimableAchievements(claimableAchievement.achievement);
    });

    return () => {
      sub1.unsubscribe();
    };
  }, []);

  return (
    <SwScreenLayout
      subHeaderLeft={(
        <Icon
          phosphorIcon={ArrowLeft}
          size='md'
          type='phosphor'
        />
      )}
      {...props}
      className={CN(className, `-background-${backgroundStyle}`, {
        'special-language': specialLanguages.includes(language),
        '-show-tab-bar': props.showTabBar
      })}
      headerContent={props.showHeader && <SelectAccount />}
      headerIcons={headerIcons}
      onBack={onBack || defaultOnBack}
      selectedTabBarItem={selectedTab}
      tabBarItems={tabBarItems.map((item) => ({
        ...item,
        onClick: onSelectTab(item.url)
      }))}
    >
      <div className={'ant-sw-screen-layout-body-inner'}>
        {children}
      </div>
    </SwScreenLayout>
  );
};

const Base = styled(Component)<LayoutBaseProps>(({ theme: { extendToken, token } }: LayoutBaseProps) => ({
  backgroundColor: extendToken.mythColorDark,

  '.ant-sw-screen-layout-body': {
    overflow: 'hidden'
  },

  '.__notice-icon-tabbar': {
    position: 'absolute',
    zIndex: 2,
    minWidth: 17,
    height: 17,
    backgroundImage: 'url(/images/mythical/notice-icon.png)',
    backgroundPosition: 'center center',
    backgroundSize: '100% 100%',
    top: 7,
    left: '32%',
    filter: 'drop-shadow(0px 1.405px 4.216px rgba(0, 0, 0, 0.25))'
  },

  '.ant-sw-screen-layout-body-inner': {
    overflow: 'auto',
    position: 'relative',
    height: '100%',
    zIndex: 5
  },

  '&.-background-style-1': {
    backgroundImage: 'url(/images/mythical/layout/background-1.jpg)',
    backgroundPosition: 'center bottom',
    backgroundSize: 'cover'
  },

  '&.-background-style-2': {
    backgroundImage: 'url(/images/mythical/layout/background-2.jpg)',
    backgroundPosition: 'center bottom',
    backgroundSize: 'cover'
  },

  '> .ant-sw-screen-layout-header .ant-sw-header-bg-default': {
    backgroundColor: 'transparent'
  },

  '&.-show-tab-bar > .ant-sw-screen-layout-body > .ant-sw-screen-layout-body-inner': {
    paddingBottom: 90
  },

  '.ant-sw-tab-bar-container': {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    backgroundImage: 'url("/images/mythical/bottom-tab-bar-background.png")',
    backgroundSize: '100% auto',
    backgroundPosition: 'left top',
    zIndex: 500,
    minHeight: 90,
    borderRadius: 0,
    paddingTop: 14,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 28,

    '.ant-sw-tab-bar-item': {
      gap: token.sizeXXS,

      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: extendToken.mythColorGray2
      }
    },

    '.ant-sw-tab-bar-item:hover': {
      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: extendToken.mythColorGray1
      }
    },

    '.ant-sw-tab-bar-item.ant-sw-tab-bar-item-active': {
      '.ant-sw-tab-bar-item-icon, .ant-sw-tab-bar-item-label': {
        color: token.colorPrimary
      }
    },

    '.ant-sw-tab-bar-item-label': {
      textAlign: 'center',
      fontSize: 14,
      fontFamily: extendToken.fontBarlowCondensed,
      fontWeight: 400,
      lineHeight: '16px',
      letterSpacing: 0.28
    }
  },

  '&.special-language': {
    '.ant-sw-tab-bar-container': {
      paddingBottom: token.padding,

      '.ant-sw-tab-bar-item': {
        gap: token.sizeXXS,

        '.ant-sw-tab-bar-item-label': {
          fontSize: token.fontSizeXS,
          lineHeight: 1,
          maxWidth: token.sizeXXL,
          overflowWrap: 'break-word'
        }
      }
    }
  }
}));

export default Base;
