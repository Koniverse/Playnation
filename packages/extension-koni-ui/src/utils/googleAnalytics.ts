// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
export const sendEventGA = (category: string): void => {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  gtag('event', category);
};
