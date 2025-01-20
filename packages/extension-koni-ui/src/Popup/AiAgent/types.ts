// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

export type BaseRequest = {
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
};

export type MessageRequest = BaseRequest & {
  chatflowid?: string;
  body?: IncomingInput;
};

export type FilePreviewData = string | ArrayBuffer;

export type FilePreview = {
  data: FilePreviewData;
  mime: string;
  name: string;
  preview: string;
  type: string;
};

export type IAgentReasoning = {
  agentName?: string;
  messages?: string[];
  usedTools?: any[];
  artifacts?: FileUpload[];
  sourceDocuments?: any[];
  instructions?: string;
  nextAgent?: string;
};

export type IncomingInput = {
  question: string;
  uploads?: FileUpload[];
  overrideConfig?: Record<string, unknown>;
  socketIOClientId?: string;
  chatId?: string;
  fileName?: string; // Only for assistant
  leadEmail?: string;
  action?: IAction;
};

export type FileUpload = Omit<FilePreview, 'preview'>;
export type messageType = 'apiMessage' | 'userMessage' | 'usermessagewaiting' | 'leadCaptureMessage';
export type FeedbackRatingType = 'THUMBS_UP' | 'THUMBS_DOWN';
export type IAction = {
  id?: string;
  elements?: Array<{
    type: string;
    label: string;
  }>;
  mapping?: {
    approve: string;
    reject: string;
    toolCalls: any[];
  };
};

export type MessageType = {
  messageId?: string;
  message: string;
  type: messageType;
  sourceDocuments?: any;
  fileAnnotations?: any;
  fileUploads?: Partial<FileUpload>[];
  artifacts?: Partial<FileUpload>[];
  agentReasoning?: IAgentReasoning[];
  usedTools?: any[];
  action?: IAction | null;
  rating?: FeedbackRatingType;
  id?: string;
  followUpPrompts?: string;
  dateTime?: string;
};
