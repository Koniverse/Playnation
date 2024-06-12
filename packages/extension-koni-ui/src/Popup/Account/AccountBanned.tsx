import React from 'react';
import styled from 'styled-components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Props } from 'react-select';
import { useTranslation } from 'react-i18next';

const Component = ({ className }: Props): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <h1>{t('Account suspended')}</h1>
      <p>{t('Your account has been suspended due to unusual activities.')}</p>
      <p>{t('If you think this is a mistake, contact our support team')} <a href={"https://t.me/playnation_globalchat"}>Playnation Suport</a> </p>
    </div>
  );
};

const AccountBanned = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: token.colorBgContainer,
    color: token.colorText,

    h1: {
      fontSize: token.fontSizeLG,
      fontWeight: 'bold',
      marginBottom: token.marginMD,
    },
    p: {
      fontSize: 14,
      marginBottom: token.marginSM,
      textAlign: 'center',
      maxWidth: '80%',
    },
  };
});

export default AccountBanned;
