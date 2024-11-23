// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function shortenString (str: string, startLength = 5, endLength = 5) {
  if (str.length <= startLength + endLength) {
    return str;
  }

  const start = str.substring(0, startLength);
  const end = str.substring(str.length - endLength);

  return `${start}...${end}`;
}
