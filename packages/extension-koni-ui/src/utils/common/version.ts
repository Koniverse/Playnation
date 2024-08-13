// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

export function versionCompare (v1: string, v2: string) {
  if (typeof v1 !== 'string') {
    v1 = '';
  }

  if (typeof v2 !== 'string') {
    v2 = '';
  }

  const xv1 = v1.replace(/^\s+|\s+$/g, '').split('.');
  const xv2 = v2.replace(/^\s+|\s+$/g, '').split('.');
  const a = Math.max(xv1.length, xv2.length); let i; let p1; let p2;

  for (i = 0; i < a; i++) {
    p1 = parseInt(xv1[i]) || 0;
    p2 = parseInt(xv2[i]) || 0;

    if (p1 === p2) {
      continue;
    }

    if (p1 > p2) {
      return 1;
    }

    return -1;
  }

  return 0;
}
