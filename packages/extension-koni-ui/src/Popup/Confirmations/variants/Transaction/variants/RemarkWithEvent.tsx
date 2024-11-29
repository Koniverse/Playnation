// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { AlertDialogProps, Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Field, Icon, PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle } from 'phosphor-react';
import React from 'react';
import styled, { useTheme } from 'styled-components';

export interface BaseTransactionConfirmationProps extends ThemeProps {
  transaction: SWTransactionResult;
  openAlert: (alertProps: AlertDialogProps) => void;
  closeAlert: VoidFunction;
}

const Component: React.FC<BaseTransactionConfirmationProps> = (props: BaseTransactionConfirmationProps) => {
  const { className, transaction } = props;

  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  return (
    <div className={CN(className)}>
      <div className='page-icon-overide'>
        <PageIcon
          color='#000'
          iconProps={{
            phosphorIcon: CheckCircle,
            weight: 'fill'
          }}
        />
      </div>
      <div className='__congratulation-text'>
        {t('You’re performing an on-chain check-in transaction with this account')}
      </div>
      <Field
        className={'__address-field'}
        content={toShort(transaction.address, 10, 16)}
        suffix={(
          <Icon
            iconColor={token.colorSuccess}
            phosphorIcon={CheckCircle}
            size='sm'
            weight='fill'
          />
        )}
      />
    </div>
  );
};

const RemarkWithEvent = styled(Component)<BaseTransactionConfirmationProps>(({ theme: { token } }: BaseTransactionConfirmationProps) => {
  return {
    background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)',
    borderRadius: 24,
    display: 'flex',
    gap: token.size,
    textAlign: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 20px',

    '.__congratulation-text': {
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark1
    }
  };
});

export default RemarkWithEvent;
