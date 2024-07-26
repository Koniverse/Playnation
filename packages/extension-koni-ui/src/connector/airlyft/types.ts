// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import EventEmitter from 'eventemitter3';

// Enums
export enum MessageType {
  CLOSE = 'AIR_WIDGET_CLOSE',
  LOADED = 'AIR_WIDGET_LOADED',
  AUTH_TOKEN = 'AIR_WIDGET_AUTH_TOKEN',
  OPEN_TASK = 'AIR_WIDGET_OPEN_TASK',
}

// Interfaces
export interface WidgetOptions {
  url: string;
  onLoad?: () => void;
  onClose?: () => void;
  onAuthToken?: (token: string) => void;
  onOpenTask?: (taskId: string) => void;
}

export interface AirlyftWidgetModal {
  open: () => void;
  close: () => void;
  ref: HTMLAreaElement;
}

export interface AirlyftWidget extends EventEmitter {
  widgetId: string;
  options: WidgetOptions;
  iframe: HTMLIFrameElement;
  sendMessage(message: Message): void;
  handleIncomingMessage(event: MessageEvent): void;
  initialize(): void;
  close(): void;
  createModal(): Promise<AirlyftWidgetModal>;
  openSpecificTask(modal: AirlyftWidgetModal, taskId: string): void;
  authWithToken(modal: AirlyftWidgetModal, token: string): void;
  // Add other methods if required
}

export interface Message {
  type: MessageType;
  data?: any;
}
