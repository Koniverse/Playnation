// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const CLIENT_ID = process.env.AUTHENTICATE_CLIENT_ID || '...';
export const AUTHORIZATION_ENDPOINT = 'https://auth.mythicalgames.com/oauth2/authorize';
export const TOKEN_ENDPOINT = 'https://auth.mythicalgames.com/oauth2/token';
export const LOGOUT_ENDPOINT = 'https://auth.mythicalgames.com/oauth2/logout';
export const AUTHENTICATE_REDIRECT_URI = process.env.AUTHENTICATE_REDIRECT_URI || 'https://mythical-login.playnation.app';
export const AUTHENTICATE_LOGOUT_REDIRECT = AUTHENTICATE_REDIRECT_URI;
export const AUTHENTICATE_LINKING_URL = process.env.LINKING_URL || 'https://mythical-cms-dev.playnation.app';
export const AUTHENTICATE_LINKING_SERVICE = process.env.LINKING_SERVICE || 'mythical';
export const AUTHENTICATE_LINKING_BOT = process.env.LINKING_BOT || 'mythical_dev1_bot';
export const AUTHENTICATE_LINKING_TOKEN = process.env.LINKING_TOKEN || '...';
