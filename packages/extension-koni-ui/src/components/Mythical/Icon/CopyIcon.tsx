// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

type Props = {
  className?: string;
}

const CopyIcon: React.FC<Props> = ({ className }: Props) => {
  return (
    <svg
      className={className}
      fill='none'
      height='1em'
      viewBox='0 0 20 20'
      width='1em'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M6.33317 4.99984V2.49984C6.33317 2.0396 6.70627 1.6665 7.1665 1.6665H17.1665C17.6267 1.6665 17.9998 2.0396 17.9998 2.49984V14.1665C17.9998 14.6268 17.6267 14.9998 17.1665 14.9998H14.6665V17.4991C14.6665 17.9598 14.2916 18.3332 13.8275 18.3332H3.83888C3.37549 18.3332 3 17.9627 3 17.4991L3.00217 5.8339C3.00225 5.37326 3.3772 4.99984 3.84118 4.99984H6.33317ZM7.99983 4.99984H14.6665V13.3332H16.3332V3.33317H7.99983V4.99984Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default CopyIcon;
