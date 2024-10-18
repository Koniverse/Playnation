// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps;

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [isSelected, setIsSelected] = useState<boolean>(false);

  const onClick = useCallback(() => {
    setIsSelected((prev) => !prev);
  }, []);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        backgroundImage: isSelected ? 'url("/images/mythical/tool-filter-active-background.png")' : 'url("/images/mythical/tool-filter-background.png")'
      }}
    >
      <div className={'__button-label'}>
        {t('Filters')}

        {
          isSelected && (
            <span>&nbsp;({'1'})</span>
          )
        }
      </div>
    </div>
  );
};

export const ToolFilters = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    cursor: 'pointer',
    minWidth: 86,
    paddingLeft: 4,
    paddingRight: 4,
    height: 36,
    backgroundSize: '100% 36px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',

    '.__button-label': {
      marginTop: -2,
      textTransform: 'uppercase',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: '18px',
      letterSpacing: -0.16,
      color: '#fff',
      fontFamily: extendToken.fontDruk,

      span: {
        color: extendToken.mythColorGray1
      }
    }
  };
});
