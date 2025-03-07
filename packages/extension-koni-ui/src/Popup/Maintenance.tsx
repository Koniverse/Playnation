// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import CN from 'classnames';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

interface Props {
  className?: string;
}

const metaDataHandler = MetadataHandler.instance;

function Component ({ className }: Props): React.ReactElement<Props> {
  const [maintenance, setMaintenance] = React.useState<MaintenanceInfo|undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = metaDataHandler.maintenanceSubject.subscribe(setMaintenance);

    return () => {
      unsub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (maintenance && !maintenance.isMaintenance) {
      navigate('/');
    }
  }, [maintenance, navigate]);

  return (
    <Layout.Base
      className={CN(className)}
      showBackButton={false}
      subHeaderPaddingVertical={true}
    >
      <div className={'__body'}>
        <div className='__title'>
          {maintenance?.title}
        </div>

        <div className='__content'>
          {maintenance?.message}
        </div>
      </div>
    </Layout.Base>
  );
}

const Maintenance = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return ({
    '.__body': {
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      gap: 8
    },

    '.__title': {
      color: token.colorWhite,
      fontFamily: extendToken.fontDruk,
      fontSize: '20px',
      fontStyle: 'italic',
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '-0.6px',
      textTransform: 'uppercase'
    },

    '.__content': {
      color: token.colorWhite,
      fontFamily: extendToken.fontBarlowCondensed,
      fontSize: '16px',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: '18px',
      letterSpacing: '0.32px'
    }
  });
});

export default Maintenance;
