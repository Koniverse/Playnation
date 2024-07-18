// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SigningRequest } from '@subwallet/extension-base/background/types';
import { AccountItemWithName, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
import { useOpenDetailModal, useParseSubstrateRequestPayload } from '@subwallet/extension-koni-ui/hooks';
import { enableChain } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { isSubstrateMessage, noop } from '@subwallet/extension-koni-ui/utils';
import { Button } from '@subwallet/react-ui';
import CN from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { ExtrinsicPayload } from '@polkadot/types/interfaces';
import { SignerPayloadJSON } from '@polkadot/types/types';

import useGetChainInfoByGenesisHash from '../../../hooks/chain/useGetChainInfoByGenesisHash';
import { BaseDetailModal, SubstrateExtrinsic, SubstrateMessageDetail, SubstrateSignArea } from '../parts';

interface Props extends ThemeProps {
  request: SigningRequest;
}

function Component ({ className, request }: Props) {
  const { account } = request;
  const { t } = useTranslation();
  const payload = useParseSubstrateRequestPayload(request.request);
  const chainInfo = useGetChainInfoByGenesisHash(((payload as ExtrinsicPayload).genesisHash || '').toString());
  const { chainStateMap } = useSelector((root: RootState) => root.chainStore);
  const onClickDetail = useOpenDetailModal();

  const isMessage = useMemo(() => isSubstrateMessage(payload), [payload]);

  useEffect(() => {
    if (!isMessage && chainInfo) {
      const chainState = chainStateMap[chainInfo.slug];

      !chainState.active && enableChain(chainInfo.slug, false)
        .then(noop)
        .catch(console.error);
    }
  }, [chainStateMap, chainInfo, isMessage]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <div className='description'>
          {t(request.metadata?.message || 'You are approving a request with the following account')}
        </div>
        <AccountItemWithName
          accountName={account.name}
          address={account.address}
          avatarSize={24}
          className='account-item'
          isSelected={true}
        />
        <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            shape={'round'}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>
      </div>
      <SubstrateSignArea
        account={account}
        id={request.id}
        request={request.request}
      />
      <BaseDetailModal
        title={isMessage ? t('Message details') : t('Transaction details')}
      >
        {isMessage
          ? (
            <SubstrateMessageDetail bytes={payload as string} />
          )
          : (
            <SubstrateExtrinsic
              account={account}
              payload={payload as ExtrinsicPayload}
              request={request.request.payload as SignerPayloadJSON}
            />
          )
        }
      </BaseDetailModal>
    </>
  );
}

const SignConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  }
}));

export default SignConfirmation;
