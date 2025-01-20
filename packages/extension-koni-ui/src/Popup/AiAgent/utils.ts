// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { MessageRequest } from '@subwallet/extension-koni-ui/Popup/AiAgent/types';

export const isDefined = <T>(value: T | undefined | null): value is NonNullable<T> => value !== undefined && value !== null;

export const sendRequest = async <ResponseData>(
  params:
  | {
    url: string;
    method: string;
    body?: Record<string, unknown> | FormData;
    type?: string;
    headers?: Record<string, any>;
    formData?: FormData;
    onRequest?: (request: RequestInit) => Promise<void>;
  }
  | string
): Promise<{ data?: ResponseData; error?: Error }> => {
  try {
    const url = typeof params === 'string' ? params : params.url;
    const headers =
      typeof params !== 'string' && isDefined(params.body)
        ? {
          'Content-Type': 'application/json',
          ...params.headers
        }
        : undefined;
    let body: string | FormData | undefined = typeof params !== 'string' && isDefined(params.body) ? JSON.stringify(params.body) : undefined;

    if (typeof params !== 'string' && params.formData) {
      body = params.formData;
    }

    const requestInfo: RequestInit = {
      method: typeof params === 'string' ? 'GET' : params.method,
      mode: 'cors',
      headers,
      body
    };

    if (typeof params !== 'string' && params.onRequest) {
      await params.onRequest(requestInfo);
    }

    const response = await fetch(url, requestInfo);

    let data: any;
    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.includes('application/json')) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data = await response.json();
    } else if (typeof params !== 'string' && params.type === 'blob') {
      data = await response.blob();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage;

      if (typeof data === 'object' && 'error' in data) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        errorMessage = data.error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        errorMessage = data || response.statusText;
      }

      throw errorMessage;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { data };
  } catch (e) {
    console.error(e);

    return { error: e as Error };
  }
};

function getChatLogsStorageKey (chatflowid: string) {
  return `AGENT_AI_${chatflowid}_CHAT_LOGS`;
}

// @ts-ignore
function getTopicsStorageKey (chatflowid: string) {
  return `AGENT_AI_${chatflowid}_TOPICS`;
}

function getCurrentChatIdStorageKey (chatflowid: string) {
  return `AGENT_AI_${chatflowid}_CURRENT_CHAT_ID`;
}

export const setCurrentChatId = (chatflowid: string, chatId: string) => {
  localStorage.setItem(getCurrentChatIdStorageKey(chatflowid), chatId);
};

export const getCurrentChatId = (chatflowid: string) => {
  return localStorage.getItem(getCurrentChatIdStorageKey(chatflowid));
};

export const setLocalStorageChatflow = (chatflowid: string, chatId: string, saveObj: Record<string, any> = {}) => {
  const chatDetails = localStorage.getItem(getChatLogsStorageKey(chatflowid));
  const obj = { ...saveObj };

  obj.chatId = chatId;

  if (!chatDetails) {
    localStorage.setItem(getChatLogsStorageKey(chatflowid), JSON.stringify({
      [chatId]: obj
    }));
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsedChatDetails = JSON.parse(chatDetails);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const targetData = parsedChatDetails[chatId] || {};

      localStorage.setItem(getChatLogsStorageKey(chatflowid), JSON.stringify({
        ...parsedChatDetails,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [chatId]: { ...targetData, ...obj }
      }));
    } catch (e) {
      const chatId = chatDetails;

      obj.chatId = chatId;
      localStorage.setItem(getChatLogsStorageKey(chatflowid), JSON.stringify(obj));
    }
  }
};

export const getLocalStorageChatflow = (chatflowid: string) => {
  const chatDetails = localStorage.getItem(getChatLogsStorageKey(chatflowid));

  if (!chatDetails) {
    return {};
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(chatDetails);
  } catch (e) {
    return {};
  }
};

export const removeLocalStorageChatHistory = (chatflowid: string) => {
  const chatDetails = localStorage.getItem(getChatLogsStorageKey(chatflowid));

  if (!chatDetails) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedChatDetails = JSON.parse(chatDetails);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (parsedChatDetails.lead) {
      // Dont remove lead when chat is cleared
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      const obj = { lead: parsedChatDetails.lead };

      localStorage.removeItem(getChatLogsStorageKey(chatflowid));
      localStorage.setItem(getChatLogsStorageKey(chatflowid), JSON.stringify(obj));
    } else {
      localStorage.removeItem(getChatLogsStorageKey(chatflowid));
    }
  } catch (e) {

  }
};

export const sendMessageQuery = ({ apiHost = 'http://localhost:3000', body, chatflowid, onRequest }: MessageRequest) =>
  sendRequest<any>({
    method: 'POST',
    url: `${apiHost}/api/v1/prediction/${chatflowid || ''}`,
    body,
    onRequest: onRequest
  });

export const isStreamAvailableQuery = ({ apiHost = 'http://localhost:3000', chatflowid, onRequest }: MessageRequest) =>
  sendRequest<any>({
    method: 'GET',
    url: `${apiHost}/api/v1/chatflows-streaming/${chatflowid || ''}`,
    onRequest: onRequest
  });
