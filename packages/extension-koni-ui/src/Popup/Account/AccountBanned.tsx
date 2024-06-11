import React from 'react';
import styled from 'styled-components';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Props } from 'react-select';

const Component = ({ className }: Props): React.ReactElement => {
  return (
    <div className={className}>
      <h1>Account Banned</h1>
      <p>Your account has been banned due to violation of our terms of service.</p>
      <p>Please contact our support team for more information. <a href={"https://t.me/Playnation_bot"}>Playnation</a> </p>
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
