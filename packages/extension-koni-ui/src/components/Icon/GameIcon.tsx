// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { SwIconProps } from '@subwallet/react-ui';
import CN from 'classnames';
import React from 'react';

interface Props extends ThemeProps {
  size?: SwIconProps['size'],
  customSize?: SwIconProps['customSize']
}

const GameIcon: React.FC<Props> = ({ className, customSize, size }: Props) => {
  const iconSize = (() => {
    if (!size) {
      return undefined;
    }

    if (size === 'xs') {
      return 16;
    }

    if (size === 'sm') {
      return 20;
    }

    if (size === 'md') {
      return 24;
    }

    return 32;
  })();

  return (
    <span
      className={CN('anticon', className)}
      style={{ fontSize: customSize || iconSize }}
    >
      <svg
        fill='currentColor'
        height='1em'
        viewBox='0 0 24 24'
        width='1em'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          clipRule='evenodd'
          d='M10.9188 9.51718C10.9188 10.3475 10.2543 11.0207 9.43457 11.0207C8.61484 11.0207 7.95032 10.3475 7.95032 9.51718C7.95032 8.68681 8.61484 8.01367 9.43457 8.01367C10.2543 8.01367 10.9188 8.68681 10.9188 9.51718ZM16.8559 9.45929C16.8559 9.67083 16.6347 9.80743 16.4488 9.71073C15.8212 9.38423 15.0808 9.36525 14.4377 9.65916L14.3066 9.71907C14.0979 9.81445 13.8615 9.65998 13.8615 9.42823V9.17132C13.8615 9.0215 13.9482 8.88557 14.0832 8.82391L14.2106 8.76565C14.9972 8.40618 15.9028 8.4294 16.6704 8.82872C16.7843 8.88796 16.8559 9.00666 16.8559 9.13624V9.45929ZM21.5409 12.4257L22.3748 17.5174C22.5599 18.6475 21.6986 19.6757 20.5668 19.6757H18.5122C17.8619 19.6757 17.2603 19.3269 16.9313 18.7591L15.7719 16.7581C15.6734 16.5881 15.7846 16.3724 15.9787 16.3571C18.2387 16.1783 20.2538 14.8487 21.3273 12.8278L21.5409 12.4257Z'
          fill='currentColor'
          fillOpacity='0.65'
          fillRule='evenodd'
          opacity='0.5'
        />
        <path
          clipRule='evenodd'
          d='M4.18796 19.6757H6.2878C6.93798 19.6757 7.53949 19.327 7.86853 18.7594L9.73273 15.5437C9.84385 15.352 10.047 15.2342 10.2666 15.2342H15.4573C18.8922 15.2342 21.5023 12.108 20.9293 8.6801C20.4776 5.97783 18.1651 4 15.4573 4H6.21169C5.31578 4 4.55118 4.65557 4.4039 5.55L2.42473 17.569C2.24313 18.6718 3.08336 19.6757 4.18796 19.6757ZM9.21734 6.8632C7.76913 6.8632 6.59512 8.05144 6.59512 9.51721C6.59512 10.983 7.76913 12.1712 9.21734 12.1712H15.4597C16.908 12.1712 18.082 10.983 18.082 9.51721C18.082 8.05144 16.908 6.8632 15.4597 6.8632H9.21734Z'
          fill='currentColor'
          fillOpacity='0.65'
          fillRule='evenodd'
        />
      </svg>
    </span>
  );
};

export default GameIcon;
