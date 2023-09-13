// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { YieldStepDetail } from '@subwallet/extension-base/background/KoniTypes';
import EarningProcessItem from '@subwallet/extension-koni-ui/components/EarningProcessItem';
import { BaseModal } from '@subwallet/extension-koni-ui/components/Modal/BaseModal';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Divider, ModalContext, Typography } from '@subwallet/react-ui';
import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  currentStep: number;
  yieldSteps?: YieldStepDetail[];
}

export const STAKING_PROCESS_MODAL_ID = 'staking-process-modal-id';

const Component = ({ className, currentStep, yieldSteps }: Props) => {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const { token } = useTheme() as Theme;
  const onCloseModal = useCallback(() => {
    inactiveModal(STAKING_PROCESS_MODAL_ID);
  }, [inactiveModal]);

  return (
    <BaseModal
      className={className}
      closable
      id={STAKING_PROCESS_MODAL_ID}
      maskClosable
      onCancel={onCloseModal}
      title={t('Staking process')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: token.paddingSM, paddingTop: token.paddingXS }}>

        <Typography.Text className={'earning-calculator-message'}>{t('Staking process:')}</Typography.Text>

        {yieldSteps && yieldSteps.map((item, index) => {
          const isSelected = currentStep === index;

          return <EarningProcessItem
            index={index}
            isSelected={isSelected}
            key={index}
            stepName={item.name}
          />;
        })}
      </div>
      <Divider style={{ backgroundColor: token.colorBgDivider, marginTop: token.marginSM, marginBottom: token.marginSM }} />

      <Typography.Text style={{ color: token.colorTextLight4 }}>
        {t('This content is for informational purposes only and does not constitute a guarantee. All rates are annualized and are subject to change.')}
      </Typography.Text>
    </BaseModal>
  );
};

const StakingProcessModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {};
});

export default StakingProcessModal;