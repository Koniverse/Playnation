// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { toShort } from '@subwallet/extension-koni-ui/utils';
import { Field, Icon, PageIcon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Plugs } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  address: string;
}

function Component (props: Props): React.ReactElement<Props> {
  const { address, className = '' } = props;

  const { t } = useTranslation();
  const { token } = useTheme() as Theme;

  return (
    <div className={CN(className)}>
      <div className='page-icon-overide'>
        <PageIcon
          color='#000'
          iconProps={{
            phosphorIcon: Plugs,
            weight: 'fill'
          }}
        />
      </div>
      <div className='disconnect-text'>
        {t('Do you want to disconnect from this account?')}
      </div>
      <Field
        className={'address-field'}
        content={toShort(address, 10, 16)}
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
}

export const DisconnectWalletConnectModalContent = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    background: 'linear-gradient(117deg, #FFD8E6 9.05%, #BCEBFF 91.43%)',
    borderRadius: 24,
    display: 'flex',
    gap: token.size,
    textAlign: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 20px',

    '.disconnect-text': {
      fontSize: token.fontSizeSM,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM,
      color: token.colorTextDark1
    },

    '.address-field': {
      '.ant-field-content': {
        color: `${token.colorTextTertiary} !important`
      }
    }
  });
});
