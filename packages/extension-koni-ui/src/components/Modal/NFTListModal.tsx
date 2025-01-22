// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CloseIcon } from '@subwallet/extension-koni-ui/components';
import { NFTTokenData } from '@subwallet/extension-koni-ui/connector/booka/types';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { XCircle } from 'phosphor-react';
import { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  erc721ContractList?: NFTTokenData[]
};
const nftListModalId = 'nft-list-modal';

function Component ({ className, erc721ContractList }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);

  const onClose = useCallback(() => {
    inactiveModal(nftListModalId);
  }, [inactiveModal]);

  const sortContractNames = useMemo(() => {
    if (!erc721ContractList) {
      return [];
    }

    const contractNames = erc721ContractList?.map((item) => item.erc721_contract.name);

    contractNames?.sort((a, b) => {
      // Kiểm tra nếu tên chứa "Koni Story Badge"
      if (a.includes('Koni Story Badge') && !b.includes('Koni Story Badge')) {
        return -1;
      }

      if (!a.includes('Koni Story Badge') && b.includes('Koni Story Badge')) {
        return 1;
      }

      return a.localeCompare(b);
    });

    return contractNames;
  }, [erc721ContractList]);

  console.log('erc721ContractList', erc721ContractList);

  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          className={'footer-close-button'}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight={'fill'}
            />
          )}
          onClick={onClose}
          shape={'circle'}
          size={'sm'}
        >
          {t('Close')}
        </Button>
      </>
    );
  }, [onClose, t]);

  return (
    <>
      <SwModal
        className={CN(className, 'nft-modal')}
        closable={false}
        footer={footerModal}
        id={nftListModalId}
        maskClosable={false}
        // onCancel={onClose}
        rightIconProps={{
          icon: <CloseIcon />,
          onClick: onClose
        }}
        title={t('NFT list')}
      >
        <div className={'nft-list-wrapper'}>
          {sortContractNames?.map((item, index) => (
            <div
              className='nft-list-item'
              key={index}
            >
              <div className={'nft-list-item-label'}>{item}</div>
            </div>
          ))}
        </div>
      </SwModal>
    </>
  );
}

const NFTListModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.nft-list-wrapper': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },

    '&.nft-modal': {
      '.ant-sw-modal-content.ant-sw-modal-content': {
        maxHeight: 470
      }
    },

    '.nft-list-item': {
      display: 'flex',
      height: 52,
      width: '100%',
      padding: '12px 20px',
      borderRadius: 40,
      backgroundColor: token.colorBgSecondary,
      alignItems: 'center'
    },

    '.nft-list-item-label': {
      color: token.colorTextDark2,
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
      lineHeight: token.lineHeightHeading3
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.ant-btn-content-wrapper': {
      fontSize: token.fontSize,
      fontWeight: token.bodyFontWeight,
      lineHeight: token.lineHeightSM
    },

    '.footer-close-button': {
      '.anticon': {
        fontSize: 20
      }

    },

    '.empty-list-label': {

    }
  };
});

export default NFTListModal;
