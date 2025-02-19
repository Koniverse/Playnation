// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createView, Popup } from '@subwallet/extension-koni-ui';

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js?v=6').then((registration) => {
//       console.log('SW registered: ', registration);
//     }).catch((registrationError) => {
//       console.log('SW registration failed: ', registrationError);
//     });
//   });
// }
//
// await Notification.requestPermission().then((result) => {
//   if (result === 'granted') {
//     // const x = new Notification('Hello, world!');
//   }
// });

createView(Popup);
