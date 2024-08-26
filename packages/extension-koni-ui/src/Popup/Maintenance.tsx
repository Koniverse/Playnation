// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Layout } from '@subwallet/extension-koni-ui/components';
import { MaintenanceInfo, MetadataHandler } from '@subwallet/extension-koni-ui/connector/booka/metadata';
import { Theme } from '@subwallet/extension-koni-ui/themes';
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
      <div className='sub-title h3-text'>{maintenance?.title}</div>
      <div
        className='h5-text description'
        dangerouslySetInnerHTML={{ __html: maintenance?.message || '' }}
      ></div>
    </Layout.Base>
  );
}

const Maintenance = styled(Component)<Props>(({ theme }) => {
  const { token } = theme as Theme;

  return ({
    position: 'relative',
    border: `1px solid ${token.colorBgInput}`,

    '.ant-sw-screen-layout-body-inner': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 128
    },

    '.ant-sw-sub-header-title-content': {
      zIndex: 1
    },

    '.title': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center'
    },

    '.sub-title': {
      paddingTop: token.paddingXL,
      paddingBottom: token.padding,
      color: token.colorWarning
    },

    '.description': {
      textAlign: 'center',
      paddingLeft: token.paddingXL,
      paddingRight: token.paddingXL,
      wordBreak: 'break-all',
      color: token.colorTextSecondary,
      fontWeight: token.bodyFontWeight
    }
  });
});

export default Maintenance;
