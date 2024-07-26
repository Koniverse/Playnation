// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createPromiseHandler } from '@subwallet/extension-base/utils';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BehaviorSubject } from 'rxjs';

import { AirlyftWidget, AirlyftWidgetModal } from './types';

const apiSDK = BookaSdk.instance;

export class AirlyftConnector {
  public readonly openingModal = new BehaviorSubject<AirlyftWidgetModal | null>(null);
  private widgetInfoMap: Record<string, AirlyftWidget> = {};
  private widgetModalMaps: Record<string, AirlyftWidgetModal> = {};
  private readyHandler = createPromiseHandler<boolean>();

  constructor () {
    const script = document.createElement('script');

    script.src = 'https://assets.airlyft.one/widget/widget.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      this.readyHandler.resolve(true);
    };

    // Listen for close modal event
    window.addEventListener('message', (event: MessageEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (event.data?.type === 'AIR_WIDGET_CLOSE') {
        this.openingModal.next(null);
      }
    });
  }

  async getWidget (widgetId: string): Promise<AirlyftWidget | null> {
    if (this.widgetInfoMap[widgetId]) {
      return this.widgetInfoMap[widgetId];
    }

    await this.readyHandler.promise;

    // @ts-ignore
    if (window.AirlyftWidget) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const widget = await window.AirlyftWidget(widgetId) as AirlyftWidget;

      this.widgetInfoMap[widgetId] = widget;

      return widget;
    }

    return null;
  }

  async getModal (widgetId: string): Promise<AirlyftWidgetModal | null> {
    if (this.widgetModalMaps[widgetId]) {
      return this.widgetModalMaps[widgetId];
    }

    const widget = await this.getWidget(widgetId);

    if (!widget) {
      return null;
    }

    const modal = await widget.createModal();

    const widgetRef = modal.ref;

    const triggerButton = widgetRef.querySelector('a');

    if (triggerButton) {
      triggerButton.style.display = 'none';
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      triggerButton.parentNode.style.height = 'auto';
    }

    const dataToken = await apiSDK.getAirlyftToken();

    // Login with token
    if (dataToken && dataToken.success) {
      widget.authWithToken(
        modal,
        dataToken.token
      );
    }

    // Cache modal
    this.widgetModalMaps[widgetId] = modal;

    return modal;
  }

  async openTask (widgetId: string, taskId: string) {
    const widget = await this.getWidget(widgetId);
    const modal = await this.getModal(widgetId);

    if (!modal || !widget) {
      return;
    }

    modal.open();
    this.openingModal.next(modal);

    widget.openSpecificTask(modal, taskId);
  }

  onClose (callback: () => void) {
    callback();
  }

  // Singleton instance
  private static _instance: AirlyftConnector;

  // Singleton instance getter
  static get instance (): AirlyftConnector {
    if (!AirlyftConnector._instance) {
      AirlyftConnector._instance = new AirlyftConnector();
    }

    return AirlyftConnector._instance;
  }
}
