// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EventStreamContentType, fetchEventSource } from '@microsoft/fetch-event-source';
import { ExtrinsicStatus, RequestTransfer } from '@subwallet/extension-base/background/KoniTypes';
import { SWTransactionBrief, SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { getExplorerLink } from '@subwallet/extension-base/services/transaction-service/utils';
import { GameAccountAvatar, Layout } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { BookaAccount } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useSelector } from '@subwallet/extension-koni-ui/hooks';
import { makeTransfer, subscribeTransactionById } from '@subwallet/extension-koni-ui/messaging';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { AiTransactionData, transformAiMessageData } from '@subwallet/extension-koni-ui/utils';
import CN from 'classnames';
import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import useDefaultNavigate from '../../hooks/router/useDefaultNavigate';
import { ChatInputArea } from './parts/ChatInputArea';
import { ChatMessagesArea, ChatMessagesAreaRef } from './parts/ChatMessagesArea';
import { FileUpload, IAction, IAgentReasoning, IncomingInput, MessageType, messageType } from './types';
import { getCurrentChatId, getLocalStorageChatflow, isStreamAvailableQuery, sendMessageQuery, setCurrentChatId, setLocalStorageChatflow } from './utils';

type Props = ThemeProps & {
  apiHost: string;
  chatflowid: string;
  chatId: string;
  errorMessage?: string;
  welcomeMessage?: string;
  chatflowConfig?: Record<string, unknown>;
  onRequest?: (request: RequestInit) => Promise<void>;
}

const defaultWelcomeMessage = 'Hi there! How can I help?';
const apiSDK = BookaSdk.instance;

interface AiTransactionInfo extends AiTransactionData {
  aiMessageId?: string;
  transactionId?: string;
}

const Component = (props: Props): React.ReactElement => {
  const { className } = props;
  const [account, setAccount] = useState<BookaAccount | undefined>(apiSDK.account);

  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const { goBack } = useDefaultNavigate();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [pendingMessages, setPendingMessages] = useState<MessageType[]>([]);

  const [chatId, setChatId] = useState(props.chatId);
  const [isMessageStopping, setIsMessageStopping] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatFlowAvailableToStream, setIsChatFlowAvailableToStream] = useState(false);

  const [leadEmail, setLeadEmail] = useState('');
  const [isLeadSaved, setIsLeadSaved] = useState(false);

  // follow-up prompts
  const [followUpPromptsStatus, setFollowUpPromptsStatus] = useState<boolean>(false);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([]);
  const [endStreamTrigger, setEndStreamTrigger] = useState<string | undefined>();
  const startChat = useMemo(() => !!endStreamTrigger, [endStreamTrigger]);

  const [aiTransactionInfo, setAiTransactionInfo] = useState<AiTransactionInfo | undefined>(undefined);

  const { wcAccount } = useSelector((state) => state.accountState);

  const submitTxRef = useRef(false);

  const chatMessagesAreaRef = useRef<ChatMessagesAreaRef>(null);
  const chatMessagesAreaRefCurrent = chatMessagesAreaRef.current;

  const scrollToBottom = useCallback((delay?: number) => {
    chatMessagesAreaRefCurrent?.scrollToBottom(delay);
  }, [chatMessagesAreaRefCurrent]);

  /**
   * Add each chat message into localStorage
   */
  const addChatMessage = useCallback((allMessage: MessageType[]) => {
    const messages = allMessage.map((item) => {
      if (item.fileUploads) {
        const fileUploads = item?.fileUploads.map((file) => ({
          type: file.type,
          name: file.name,
          mime: file.mime
        }));

        return { ...item, fileUploads };
      }

      return item;
    });

    setLocalStorageChatflow(props.chatflowid, chatId, { chatHistory: messages });
  }, [chatId, props.chatflowid]);

  const addPendingMessage = useCallback((message: MessageType) => {
    setPendingMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { ...message, isManualMessage: true }];

      return messages;
    });
  }, []);

  const abortMessage = useCallback(() => {
    setIsMessageStopping(false);
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];

      if (allMessages[allMessages.length - 1].type === 'userMessage') {
        return allMessages;
      }

      const lastAgentReasoning = allMessages[allMessages.length - 1].agentReasoning;

      if (lastAgentReasoning && lastAgentReasoning.length > 0) {
        // @ts-ignore
        allMessages[allMessages.length - 1].agentReasoning = lastAgentReasoning.filter((reasoning) => !reasoning.nextAgent);
      }

      return allMessages;
    });
  }, []);

  const updateMetadata = useCallback((data: any, input: string) => {
    if (data.chatId) {
      setChatId(data.chatId);
    }

    // set message id that is needed for feedback
    if (data.chatMessageId) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];

        if (allMessages[allMessages.length - 1].type === 'apiMessage') {
          allMessages[allMessages.length - 1].messageId = data.chatMessageId;
        }

        addChatMessage(allMessages);

        return allMessages;
      });
    }

    if (input === '' && data.question) {
      // the response contains the question even if it was in an audio format
      // so if input is empty but the response contains the question, update the user message to show the question
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];

        if (allMessages[allMessages.length - 2].type === 'apiMessage') {
          return allMessages;
        }

        allMessages[allMessages.length - 2].message = data.question;
        addChatMessage(allMessages);

        return allMessages;
      });
    }

    if (data.followUpPrompts) {
      setMessages((prevMessages) => {
        const allMessages = [...cloneDeep(prevMessages)];

        if (allMessages[allMessages.length - 1].type === 'userMessage') {
          return allMessages;
        }

        allMessages[allMessages.length - 1].followUpPrompts = data.followUpPrompts;
        addChatMessage(allMessages);

        return allMessages;
      });
      setFollowUpPrompts(JSON.parse(data.followUpPrompts));
    }
  }, [addChatMessage]);

  const handleError = useCallback((message = 'Oops! There seems to be an error. Please try again.') => {
    setMessages((prevMessages: MessageType[]) => {
      const messages: MessageType[] = [...prevMessages, {
        message: props.errorMessage || message,
        type: 'apiMessage'
      }];

      addChatMessage(messages);

      return messages;
    });
    setLoading(false);
    setUserInput('');
    scrollToBottom();
  }, [addChatMessage, props.errorMessage, scrollToBottom]);

  const closeResponse = useCallback(() => {
    setLoading(false);
    setUserInput('');
    // setUploadedFiles([]);
    // hasSoundPlayed = false;
    scrollToBottom(100);
  }, [scrollToBottom]);

  const updateErrorMessage = useCallback((errorMessage: string) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];

      allMessages.push({ message: props.errorMessage || errorMessage, type: 'apiMessage' });
      addChatMessage(allMessages);

      return allMessages;
    });
  }, [addChatMessage, props.errorMessage]);

  const updateLastMessage = useCallback((text: string) => {
    setMessages((prevMessages) => {
      console.debug('updateLastMessage');
      const allMessages = [...cloneDeep(prevMessages)];

      if (allMessages[allMessages.length - 1].type === 'userMessage') {
        return allMessages;
      }

      if (!text) {
        return allMessages;
      }

      allMessages[allMessages.length - 1].message += text;
      allMessages[allMessages.length - 1].rating = undefined;
      allMessages[allMessages.length - 1].dateTime = new Date().toISOString();
      // if (!hasSoundPlayed) {
      //     playReceiveSound();
      //     hasSoundPlayed = true;
      // }
      addChatMessage(allMessages);

      return allMessages;
    });
  }, [addChatMessage]);

  const updateLastMessageSourceDocuments = useCallback((sourceDocuments: any) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, sourceDocuments };
        }

        return item;
      });

      addChatMessage(updated);

      return [...updated];
    });
  }, [addChatMessage]);

  const updateLastMessageUsedTools = useCallback((usedTools: any[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];

      if (allMessages[allMessages.length - 1].type === 'userMessage') {
        return allMessages;
      }

      allMessages[allMessages.length - 1].usedTools = usedTools;
      addChatMessage(allMessages);

      return allMessages;
    });
  }, [addChatMessage]);

  const updateLastMessageFileAnnotations = useCallback((fileAnnotations: any) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];

      if (allMessages[allMessages.length - 1].type === 'userMessage') {
        return allMessages;
      }

      allMessages[allMessages.length - 1].fileAnnotations = fileAnnotations;
      addChatMessage(allMessages);

      return allMessages;
    });
  }, [addChatMessage]);

  const updateLastMessageAgentReasoning = useCallback((agentReasoning: string | IAgentReasoning[]) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return {
            ...item,
            agentReasoning: typeof agentReasoning === 'string' ? JSON.parse(agentReasoning) : agentReasoning
          };
        }

        return item;
      });

      addChatMessage(updated);

      return [...updated];
    });
  }, [addChatMessage]);

  const updateLastMessageArtifacts = useCallback((artifacts: FileUpload[]) => {
    setMessages((prevMessages) => {
      const allMessages = [...cloneDeep(prevMessages)];

      if (allMessages[allMessages.length - 1].type === 'userMessage') {
        return allMessages;
      }

      allMessages[allMessages.length - 1].artifacts = artifacts;
      addChatMessage(allMessages);

      return allMessages;
    });
  }, [addChatMessage]);

  const updateLastMessageAction = useCallback((action: IAction) => {
    setMessages((data) => {
      const updated = data.map((item, i) => {
        if (i === data.length - 1) {
          return { ...item, action: typeof action === 'string' ? JSON.parse(action) : action };
        }

        return item;
      });

      addChatMessage(updated);

      return [...updated];
    });
  }, [addChatMessage]);

  const fetchResponseFromEventStream = useCallback(async (chatflowid: string, params: any) => {
    const chatId = params.chatId;
    const input = params.question;

    params.streaming = true;
    fetchEventSource(`${props.apiHost}/api/v1/prediction/${chatflowid}`, {
      openWhenHidden: true,
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      },
      async onopen (response) {
        if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
          // everything's good
        } else if (response.status === 429) {
          const errMessage = (await response.text()) ?? 'Too many requests. Please try again later.';

          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 403) {
          const errMessage = (await response.text()) ?? 'Unauthorized';

          handleError(errMessage);
          throw new Error(errMessage);
        } else if (response.status === 401) {
          const errMessage = (await response.text()) ?? 'Unauthenticated';

          handleError(errMessage);
          throw new Error(errMessage);
        } else {
          throw new Error();
        }
      },
      async onmessage (ev) {
        const payload = JSON.parse(ev.data);

        console.log('---Payload from Flowise', payload);

        switch (payload.event) {
          case 'start':
            setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }]);
            break;
          case 'token':
            updateLastMessage(payload.data);
            break;
          case 'sourceDocuments':
            updateLastMessageSourceDocuments(payload.data);
            break;
          case 'usedTools':
            updateLastMessageUsedTools(payload.data);
            break;
          case 'fileAnnotations':
            updateLastMessageFileAnnotations(payload.data);
            break;
          case 'agentReasoning':
            updateLastMessageAgentReasoning(payload.data);
            break;
          case 'action':
            updateLastMessageAction(payload.data);
            break;
          case 'artifacts':
            updateLastMessageArtifacts(payload.data);
            break;
          case 'metadata':
            updateMetadata(payload.data, input);
            break;
          case 'error':
            updateErrorMessage(payload.data);
            break;
          case 'abort':
            abortMessage();
            closeResponse();
            break;
          case 'end':
            setLocalStorageChatflow(chatflowid, chatId);
            closeResponse();
            break;
        }
      },
      async onclose () {
        setEndStreamTrigger(`${Date.now()}`);
        closeResponse();
        scrollToBottom(150);
      },
      onerror (err) {
        console.error('EventSource Error: ', err);
        closeResponse();
        throw err;
      }
    });
  }, [abortMessage, closeResponse, handleError, props.apiHost, scrollToBottom, updateErrorMessage, updateLastMessage, updateLastMessageAction, updateLastMessageAgentReasoning, updateLastMessageArtifacts, updateLastMessageFileAnnotations, updateLastMessageSourceDocuments, updateLastMessageUsedTools, updateMetadata]);

  const handleSubmit = useCallback(async (value: string, action?: IAction | undefined | null) => {
    setLoading(true);
    setUserInput('');
    scrollToBottom();

    setMessages((prevMessages) => {
      const messages: MessageType[] = [...prevMessages, { message: value, type: 'userMessage' }];

      addChatMessage(messages);

      return messages;
    });

    const body: IncomingInput = {
      question: value,
      chatId: chatId
    };

    if (props.chatflowConfig) {
      body.overrideConfig = props.chatflowConfig;
    }

    if (leadEmail) {
      body.leadEmail = leadEmail;
    }

    if (action) {
      body.action = action;
    }

    if (isChatFlowAvailableToStream) {
      fetchResponseFromEventStream(props.chatflowid, body);
    } else {
      const result = await sendMessageQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        body,
        onRequest: props.onRequest
      });

      if (result.data) {
        const data = result.data;

        let text = '';

        if (data.text) {
          text = data.text;
        } else if (data.json) {
          text = JSON.stringify(data.json, null, 2);
        } else {
          text = JSON.stringify(data, null, 2);
        }

        if (data?.chatId) {
          setChatId(data.chatId);
        }

        // playReceiveSound();

        setMessages((prevMessages) => {
          const allMessages = [...cloneDeep(prevMessages)];
          const newMessage = {
            message: text,
            id: data?.chatMessageId,
            sourceDocuments: data?.sourceDocuments,
            usedTools: data?.usedTools,
            fileAnnotations: data?.fileAnnotations,
            agentReasoning: data?.agentReasoning,
            action: data?.action,
            artifacts: data?.artifacts,
            type: 'apiMessage' as messageType,
            feedback: null,
            dateTime: new Date().toISOString()
          };

          allMessages.push(newMessage);
          addChatMessage(allMessages);

          return allMessages;
        });

        updateMetadata(data, value);

        setLoading(false);
        // setUserInput('');
        // setUploadedFiles([]);
        scrollToBottom();
      }

      if (result.error) {
        const error = result.error;

        console.error(error);

        if (typeof error === 'object') {
          handleError(`Error: ${error?.message.replaceAll('Error:', ' ')}`);

          return;
        }

        if (typeof error === 'string') {
          handleError(error);

          return;
        }

        handleError();
      }
    }
  }, [addChatMessage, chatId, fetchResponseFromEventStream, handleError, isChatFlowAvailableToStream, leadEmail, props.apiHost, props.chatflowConfig, props.chatflowid, props.onRequest, scrollToBottom, updateMetadata]);

  // // Auto scroll chat to bottom
  // createEffect(() => {
  //     if (messages()) {
  //         if (messages().length > 1) {
  //             setTimeout(() => {
  //                 chatContainer?.scrollTo(0, chatContainer.scrollHeight);
  //             }, 400);
  //         }
  //     }
  // });

  const getExplorerUrl = useCallback((txHash: string) => {
    const chainInfo = chainInfoMap.storyOdyssey_testnet;

    return chainInfo ? getExplorerLink(chainInfo, txHash, 'tx') || '' : '';
  }, [chainInfoMap]);

  const onSubmitTransferTx = useCallback(async (aiTransactionInfo: AiTransactionInfo) => {
    if (wcAccount) {
      if (aiTransactionInfo.type === 'transfer') {
        submitTxRef.current = true;

        // Handle message when create transaction
        addPendingMessage({
          message: 'Your transfer is being processed...', type: 'apiMessage'
        });
      }

      let submitFunc: Promise<SWTransactionResponse> | undefined;

      if (aiTransactionInfo.type === 'transfer') {
        submitFunc = makeTransfer({
          from: wcAccount.address,
          ...aiTransactionInfo.data as Omit<RequestTransfer, 'from'>
        });
      }

      if (submitFunc) {
        submitFunc
          .then((rs) => {
            if (rs.errors.length) {
              // Handle error
              // addPendingMessage({ message: rs.errors[0].message, type: 'apiMessage' });
            }

            if (rs.id) {
              const handleResult = (data: SWTransactionBrief) => {
                let messageToResponse: string | undefined;

                if (data.status === ExtrinsicStatus.SUBMITTING) {
                  // Handle on submit
                  messageToResponse = 'Your transaction has been submitted! Let’s give it a moment for the network to process...';
                } else if (data.status === ExtrinsicStatus.SUCCESS) {
                  // Handle on success
                  const explorerUrl = getExplorerUrl(data.extrinsicHash);

                  messageToResponse = `All done! Your transaction is completed, and here’s the link for you to view on the explorer: <a href='${explorerUrl}' target='_blank'>${explorerUrl}</a>`;
                } else if (data.status === ExtrinsicStatus.FAIL) {
                  const explorerUrl = getExplorerUrl(data.extrinsicHash);

                  messageToResponse = `Oops, the transaction has failed. You can view it on the explorer: <a href='${explorerUrl}' target='_blank'>${explorerUrl}</a>. Would you like to try again?`;
                } else if (data.status === ExtrinsicStatus.UNKNOWN) {
                  messageToResponse = 'Hmmm, there seems to be some unknown errors that get in the way. I’d suggest you come back at a later time and try again!';
                } else if (data.status === ExtrinsicStatus.TIMEOUT) {
                  const explorerUrl = getExplorerUrl(data.extrinsicHash);

                  messageToResponse = `Uh oh, the transaction has timed out. This is due to the transaction taking much longer than expected. You can check your address on the explorer to see if the transaction is completed or not: <a href='${explorerUrl}' target='_blank'>${explorerUrl}</a>`;
                }

                if (messageToResponse) {
                  addPendingMessage({ message: messageToResponse, type: 'apiMessage' });
                }
              };

              subscribeTransactionById({ id: rs.id }, handleResult)
                .then(handleResult)
                .catch(console.error);
            }
          })
          .catch((err: Error) => {
            // Handle error
            addPendingMessage({ message: 'Oops, the transaction has failed. Seems like the network is having some connection issues. Would you like to try again?', type: 'apiMessage' });
            console.log('Tx error', err);
          })
          .finally(() => {
            submitTxRef.current = false;
          });
      }
    }

    return Promise.resolve(undefined);
  }, [addPendingMessage, getExplorerUrl, wcAccount]);

  const onSubmitMintTx = useCallback(async (aiTransactionInfo: AiTransactionInfo) => {
    return Promise.resolve(undefined);
  }, []);

  useEffect(() => {
    const chatflowData = getLocalStorageChatflow(props.chatflowid);
    const chatMessage = (() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return Object.values(chatflowData)[0];
    })();

    if (chatMessage && Object.keys(chatMessage).length) {
      if (chatMessage.chatId) {
        setChatId(chatMessage.chatId);
      }

      const savedLead = chatMessage.lead;

      if (savedLead) {
        setIsLeadSaved(!!savedLead);
        setLeadEmail(savedLead.email);
      }

      const loadedMessages: MessageType[] =
        chatMessage?.chatHistory?.length > 0
          ? chatMessage.chatHistory?.map((message: MessageType) => {
            const chatHistory: MessageType = {
              messageId: message?.messageId,
              message: message.message,
              type: message.type,
              rating: message.rating,
              dateTime: message.dateTime
            };

            if (message.sourceDocuments) {
              chatHistory.sourceDocuments = message.sourceDocuments;
            }

            if (message.fileAnnotations) {
              chatHistory.fileAnnotations = message.fileAnnotations;
            }

            if (message.fileUploads) {
              chatHistory.fileUploads = message.fileUploads;
            }

            if (message.agentReasoning) {
              chatHistory.agentReasoning = message.agentReasoning;
            }

            if (message.action) {
              chatHistory.action = message.action;
            }

            if (message.artifacts) {
              chatHistory.artifacts = message.artifacts;
            }

            if (message.followUpPrompts) {
              chatHistory.followUpPrompts = message.followUpPrompts;
            }

            return chatHistory;
          })
          : [{ message: props.welcomeMessage ?? defaultWelcomeMessage, type: 'apiMessage' }];

      const filteredMessages = loadedMessages.filter((message) => message.type !== 'leadCaptureMessage');

      setMessages([...filteredMessages]);
    }
  }, [props.chatflowid, props.welcomeMessage]);

  const onClickConnectWallet = useCallback(() => {
    // todo: add logic to connect wallet here
    alert('Connect Wallet');
  }, []);

  const welcomeMessagesNode = useMemo(() => {
    const userName = `${account?.info?.firstName || ''} ${account?.info?.lastName || ''}`.trim();

    return (
      <>
        <div className={'__welcome-first-line'}>
          Hi {userName},
        </div>

        <div className={'__welcome-second-line'}>
          How can I help? <br />
          Anything, tell me your wish...
        </div>
      </>
    );
  }, [account?.info?.firstName, account?.info?.lastName]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    (async () => {
      // Determine if particular chatflow is available for streaming
      const { data } = await isStreamAvailableQuery({
        chatflowid: props.chatflowid,
        apiHost: props.apiHost,
        onRequest: props.onRequest
      });

      if (data) {
        setIsChatFlowAvailableToStream(data?.isStreaming ?? false);
      }
    })().catch(console.error);

    return () => {
      setUserInput('');
      // setUploadedFiles([]);
      setLoading(false);
      setMessages([
        {
          message: props.welcomeMessage ?? defaultWelcomeMessage,
          type: 'apiMessage'
        }
      ]);
    };
  }, [props.apiHost, props.chatflowid, props.onRequest, props.welcomeMessage]);

  useEffect(() => {
    if (endStreamTrigger) {
      // do some logic after stream end

      const updateAiTransactionInfo = () => {
        if (messages.length) {
          const lastMessage = messages[messages.length - 1];

          if (lastMessage.type === 'apiMessage') {
            const converted = transformAiMessageData(lastMessage.message);

            setAiTransactionInfo({ ...converted, aiMessageId: lastMessage.messageId });
          } else {
            setAiTransactionInfo(undefined);
          }
        } else {
          setAiTransactionInfo(undefined);
        }
      };

      updateAiTransactionInfo();
    }

    // note: check the dependency carefully
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endStreamTrigger]);

  useEffect(() => {
    if (aiTransactionInfo && aiTransactionInfo.type !== 'unknown' && !submitTxRef.current && startChat) {
      if (aiTransactionInfo.type === 'transfer') {
        onSubmitTransferTx(aiTransactionInfo).catch(console.error);
      } else if (aiTransactionInfo.type === 'mint') {
        onSubmitMintTx(aiTransactionInfo).catch(console.error);
      }
    }
  }, [aiTransactionInfo, onSubmitMintTx, onSubmitTransferTx, startChat]);

  // if not loading and have pendingMessages, update messages to show
  useEffect(() => {
    const timeOut = setTimeout(() => {
      if (!loading && pendingMessages.length) {
        setPendingMessages([]);
        setMessages((prevMessages) => {
          const allMessages = [...cloneDeep(prevMessages), ...pendingMessages];

          addChatMessage(allMessages);

          return allMessages;
        });
        scrollToBottom(150);
      }
    }, 500);

    return () => {
      clearTimeout(timeOut);
    };
  }, [addChatMessage, loading, pendingMessages, scrollToBottom]);

  return (
    <Layout.WithSubHeaderOnly
      backgroundStyle={'primary'}
      className={CN(className)}
      onBack={goBack}
      title={'Tell Me Agent'}
    >
      <div className={CN('__message-area-wrapper', {
        '-no-message': !messages.length
      })}
      >
        {
          !messages.length && (
            <div className='__welcome-block'>
              <GameAccountAvatar
                avatarPath={account?.info.photoUrl || undefined}
                className={'__user-avatar'}
                hasBoxShadow
                size={7}
              />

              {welcomeMessagesNode}
            </div>
          )
        }

        <ChatMessagesArea
          className={'__message-area'}
          loading={loading}
          messages={messages}
          onClickConnectWallet={onClickConnectWallet}
          ref={chatMessagesAreaRef}
        />
      </div>

      <ChatInputArea
        className={'__input-area'}
        disabled={loading}
        inputValue={userInput}
        onInputChange={setUserInput}
        onSubmit={handleSubmit}
      />
    </Layout.WithSubHeaderOnly>
  );
};

const WrapperComponent = (props: ThemeProps) => {
  const chatflowid = 'dfcf9c3f-0f99-4bb9-8872-cac2329a5393';

  const chatId = useMemo(() => {
    let result = getCurrentChatId(chatflowid);

    if (!result) {
      result = uuidv4();
      setCurrentChatId(chatflowid, result);
    }

    return result;
  }, []);

  return (
    <Component
      apiHost='https://flowise-demo.koni.studio'
      chatId={chatId}
      chatflowid={chatflowid}
      {...props}
    />
  );
};

const AiAgent = styled(WrapperComponent)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    '.ant-sw-screen-layout-body-inner': {
      display: 'flex',
      flexDirection: 'column'
    },

    '.ant-sw-sub-header-container': {
      paddingTop: 12,
      paddingBottom: 16
    },

    '.__message-area-wrapper': {
      flex: 1,
      overflow: 'auto'
    },

    '.__message-area': {
      height: '100%'
    },

    '.__message-area-wrapper.-no-message': {
      position: 'relative',

      '.__message-area': {
        opacity: 0,
        pointerEvents: 'none'
      }
    },

    '.__welcome-block': {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      textAlign: 'center',
      paddingLeft: 16,
      paddingRight: 16
    },

    '.__user-avatar': {
      borderWidth: 2,
      width: 92,
      height: 92,
      minWidth: 92,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: 24,

      '.__inner': {
        borderWidth: 4
      },

      '.__avatar-image': {
        borderWidth: 2
      }
    },

    '.__welcome-first-line': {
      fontSize: 20,
      lineHeight: '26px',
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark1,
      marginBottom: 8
    },

    '.__welcome-second-line': {
      fontSize: 14,
      lineHeight: '22px',
      color: token.colorTextDark2
    },

    '.__input-area': {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0
    }
  };
});

export default AiAgent;
