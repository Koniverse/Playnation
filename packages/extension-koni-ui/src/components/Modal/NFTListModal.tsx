// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CloseIcon } from '@subwallet/extension-koni-ui/components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon, ModalContext, SwModal } from '@subwallet/react-ui';
import CN from 'classnames';
import { XCircle } from 'phosphor-react';
import { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps;
const nftListModalId = 'nft-list-modal';

function Component ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const onClose = useCallback(() => {
    inactiveModal(nftListModalId);
  }, [inactiveModal]);
  const footerModal = useMemo(() => {
    return (
      <>
        <Button
          block={true}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight={'fill'}
            />
          )}
          onClick={onClose}
        >
          {t('Close')}
        </Button>
      </>
    );
  }, [onClose, t]);

  const onSelectNftItem = useCallback(() => {

  }, []);

  const fakeData = ['ABC collection', 'XSD collection', 'Koni cartoon 5', 'Koni cartoon 2', 'Koni cartoon 1'];

  return (
    <>
      <SwModal
        className={CN(className)}
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
          {fakeData.map((item, index) => (
            <div
              className='nft-list-item'
              key={index}
              onClick={onSelectNftItem}
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

    '.empty-list-label': {

    }
  };
});

export default NFTListModal;
