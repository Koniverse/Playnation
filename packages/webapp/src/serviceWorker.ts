// Copyright 2017-2022 @subwallet/webapp authors & contributors
// SPDX-License-Identifier: Apache-2.0

function notifyMe () {
  self?.registration?.showNotification('ServiceWorker Cookbook', {
    body: 'OK man!'
  }).catch(console.error);
}

// setTimeout(notifyMe, 5000);
