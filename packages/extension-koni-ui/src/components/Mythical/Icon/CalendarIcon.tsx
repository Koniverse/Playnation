// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type Props = {
  className?: string;
}

const CalendarIcon: React.FC<Props> = ({ className }: Props) => {
  return (
    <svg
      className={className}
      fill='none'
      height='1em'
      viewBox='0 0 16 16'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M5.99992 1.3335V2.66683H9.99992V1.3335H11.3333V2.66683H13.9999C14.3681 2.66683 14.6666 2.96531 14.6666 3.3335V14.0002C14.6666 14.3684 14.3681 14.6668 13.9999 14.6668H1.99992C1.63173 14.6668 1.33325 14.3684 1.33325 14.0002V3.3335C1.33325 2.96531 1.63173 2.66683 1.99992 2.66683H4.66659V1.3335H5.99992ZM13.3333 8.00016H7.99992H2.66659V13.3335H13.3333V8.00016ZM5.33325 9.3335V10.6668H3.99992V9.3335H5.33325ZM8.66659 9.3335V10.6668H7.33325V9.3335H8.66659ZM11.9999 9.3335V10.6668H10.6666V9.3335H11.9999ZM4.66659 4.00016H2.66659V6.66683H7.99992H13.3333V4.00016H11.3333V5.3335H9.99992V4.00016H5.99992V5.3335H4.66659V4.00016Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default CalendarIcon;
