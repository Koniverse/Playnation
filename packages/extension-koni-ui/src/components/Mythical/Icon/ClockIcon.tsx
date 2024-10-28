// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type Props = {
  className?: string;
}

const ClockIcon: React.FC<Props> = ({ className }: Props) => {
  return (
    <svg
      className={className}
      fill='none'
      height='1em'
      viewBox='0 0 14 14'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M13.0815 7.00033C13.0815 10.2203 10.4681 12.8337 7.24813 12.8337C4.02813 12.8337 1.41479 10.2203 1.41479 7.00033C1.41479 3.78033 4.02813 1.16699 7.24813 1.16699C10.4681 1.16699 13.0815 3.78033 13.0815 7.00033Z'
        stroke='white'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.2'
      />
      <path
        d='M9.41223 8.85503L7.60389 7.77586C7.28889 7.58919 7.03223 7.14003 7.03223 6.77253V4.38086'
        stroke='white'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.2'
      />
    </svg>
  );
};

export default ClockIcon;
