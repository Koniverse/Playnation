// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type Props = {
  className?: string;
}

const XIcon: React.FC<Props> = ({ className }: Props) => {
  return (
    <svg
      className={className}
      fill='none'
      height='1em'
      viewBox='0 0 24 24'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12.4987 10.5865L17.4485 5.63672L18.8627 7.05093L13.9129 12.0007L18.8627 16.9504L17.4485 18.3646L12.4987 13.4149L7.54899 18.3646L6.13477 16.9504L11.0845 12.0007L6.13477 7.05093L7.54899 5.63672L12.4987 10.5865Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default XIcon;
