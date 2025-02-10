// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SWTransactionResponse } from '@subwallet/extension-base/services/transaction-service/types';
import { WC_DEFAULT_CHAIN_ID } from '@subwallet/extension-base/services/wallet-connect-service/constants';
import { createPromiseHandler, isSameAddress } from '@subwallet/extension-base/utils';
import { GamePoint } from '@subwallet/extension-koni-ui/components';
import { BookaSdk } from '@subwallet/extension-koni-ui/connector/booka/sdk';
import { ShareLeaderboard, Task } from '@subwallet/extension-koni-ui/connector/booka/types';
import { TelegramConnector } from '@subwallet/extension-koni-ui/connector/telegram';
import { WalletConnectContext } from '@subwallet/extension-koni-ui/contexts/WalletConnectContext';
import { useConfirmModal, useNotification, useSelector, useSetCurrentPage, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { wcSignMessageRequest } from '@subwallet/extension-koni-ui/messaging';
import { Theme, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, noop, toDisplayNumber, validateSignature } from '@subwallet/extension-koni-ui/utils';
import { actionTaskOnChain } from '@subwallet/extension-koni-ui/utils/game/task';
import { Button, Icon, Image, SwModalFuncProps } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, SmileySad } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';

import { stringToHex } from '@polkadot/util';

type Props = {
  task: Task,
  actionReloadPoint: VoidFunction;
  openWidget: (widgetId: string, taskId: string) => Promise<void>;
  reloadTask: number;
} & ThemeProps;

const apiSDK = BookaSdk.instance;
const telegramConnector = TelegramConnector.instance;

const _TaskItem = ({ actionReloadPoint, className, openWidget, reloadTask, task }: Props): React.ReactElement => {
  useSetCurrentPage('/home/mission');
  const notify = useNotification();

  const { connectWC, requireWC, waitingSigningModal: { close: closeWaiting, open: openWaiting } } = useContext(WalletConnectContext);

  const { wcAccount } = useSelector((state) => state.accountState);

  const [, setAccount] = useState(apiSDK.account);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  const { t } = useTranslation();
  const [completed, setCompleted] = useState(!!task.completedAt);
  const { token } = useTheme() as Theme;

  const [checking, setChecking] = useState(task && task.airlyftType && !completed);

  useEffect(() => {
    if (checking && reloadTask > 0) {
      apiSDK.completeTask(task.id)
        .then((data: { completed: boolean, isSubmitting: boolean }) => {
          if (data.completed) {
            setCompleted(true);
            setChecking(false);
            actionReloadPoint();
          }
        })
        .catch(console.error);
    }

    return () => {
      //
    };
  }, [actionReloadPoint, checking, reloadTask, task.id]);

  useEffect(() => {
    const accountSub = apiSDK.subscribeAccount().subscribe((data) => {
      setAccount(data);
    });

    return () => {
      accountSub.unsubscribe();
    };
  }, []);

  const noNftFoundModalProps = useMemo((): Partial<SwModalFuncProps> => ({
    id: 'no_nft_found',
    className: CN('general-confirmation-modal', className),
    title: t('Your NFT'),
    okCancel: false,
    okText: t('Got it'),
    content: (
      <div className={'__description-modal'}>
        <div className={'__title-modal'}>{t('Uh oh, no NFT found')}</div>
        <div className={'__sub-title-modal'}>{t('We couldn’t find the NFT in your account. Connect to another account and try again')}</div>
      </div>
    ),
    icon: (
      <div className={'__icon-modal'}>
        <Icon
          customSize={'60px'}
          iconColor={token.colorIconHover}
          phosphorIcon={SmileySad}
          size='md'
          weight={'fill'}
        />
      </div>
    ),
    closable: true,
    maskClosable: true,
    okButtonProps: {
      icon: (
        <Icon
          phosphorIcon={CheckCircle}
          size='md'
          weight={'fill'}
        />
      ),
      shape: 'round'
    }
  }), [className, t, token.colorIconHover]);

  const getWcAddress = useCallback(async (): Promise<string | null> => {
    if (wcAccount && isSameAddress(wcAccount.address, apiSDK.addressLinked || '')) {
      return wcAccount.address;
    } else {
      try {
        await requireWC();
        const address = await connectWC();

        const message = `Approve use this address to set linked address: ${address}`;

        openWaiting();

        const { signature } = await wcSignMessageRequest({
          address: address,
          chainId: WC_DEFAULT_CHAIN_ID,
          payload: stringToHex(message),
          method: 'personal_sign'
        });

        if (!validateSignature(address, message, signature)) {
          throw new Error('Invalid signature');
        }

        closeWaiting();

        if (apiSDK.addressLinked) {
          if (apiSDK.addressLinked !== address) {
            notify({
              message: t('This address is different from the linked address'),
              type: 'error',
              duration: 8
            });

            return null;
          } else {
            return address;
          }
        } else {
          apiSDK.setAddressLinking(address);

          const { promise, resolve } = createPromiseHandler<string>();

          const accountLinkedSub = apiSDK.subscribeAddressLinked().subscribe((data) => {
            if (data) {
              resolve(data);
            }
          });

          const accountLinkingSub = apiSDK.subscribeAddressLinking().subscribe((data) => {
            if (data === undefined) {
              resolve('');
            }
          });

          return promise.then((data) => {
            accountLinkedSub.unsubscribe();
            accountLinkingSub.unsubscribe();

            return data;
          });
        }
      } catch (e) {
        closeWaiting();
        const error = e as Error;

        setTaskLoading(false);

        if (error.message.toLowerCase().includes('user rejected'.toLowerCase())) {
          notify({
            message: t('You’ve rejected this request'),
            type: 'error',
            duration: null
          });
        }

        if (error.message.toLowerCase().includes('Invalid signature'.toLowerCase())) {
          notify({
            message: t('Invalid signature'),
            type: 'error',
            duration: null
          });
        }

        if (error.message?.toLowerCase().includes('Unsupported chains'.toLowerCase())) {
          telegramConnector.showPopup({
            message: t('Your chosen wallet hasn’t supported Story Odyssey Testnet. Add network to your wallet or change to another wallet'),
            buttons: [{ type: 'ok', text: t('Got it') }]
          }, noop);
        }

        return null;
      }
    }
  }, [closeWaiting, connectWC, notify, openWaiting, requireWC, t, wcAccount]);

  const { handleSimpleConfirmModal: handleNoNftFoundModalProps } = useConfirmModal(noNftFoundModalProps);

  const finishTask = useCallback(() => {
    (async () => {
      const taskId = task.id;
      const onChainType = task.onChainType;

      setTaskLoading(true);
      let res: SWTransactionResponse | null = null;
      const payload: Record<string, unknown> = {};
      const networkKey = task.network || 'storyOdyssey_testnet';
      const isNftTask = !!task.metadata?.contractAddress;

      payload.network = networkKey;

      if (onChainType) {
        const wcAddress = await getWcAddress();

        if (!wcAddress) {
          setTaskLoading(false);

          return;
        }

        const now = new Date();
        const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
        const data = JSON.stringify({ address: wcAddress, type: onChainType, date });

        const checkCompleted = await apiSDK.completeTask(taskId);

        if (checkCompleted) {
          if (checkCompleted.completed) {
            setCompleted(checkCompleted.completed);
            setTaskLoading(false);

            return;
          }

          if (checkCompleted.isSubmitting) {
            setCompleted(false);
            setTaskLoading(false);

            notify({
              message: t('Mission in progress on another device. Use one device to complete it.'),
              type: 'warning'
            });

            return;
          }
        }

        try {
          res = await actionTaskOnChain(onChainType, networkKey, wcAddress, data);

          if ((res && res.errors.length > 0) || !res) {
            throw new Error(res?.errors[0].message || 'Error');
          }
        } catch (error) {
          console.error(error);
          setTaskLoading(false);
          let message = t((error as Error)?.message || '');

          if (message.toLowerCase().includes('Rejected by user'.toLowerCase())) {
            // no need to handle ''Rejected by user' here
            return;
          }

          if (message.toLowerCase().includes('Returned error: insufficient funds'.toLowerCase())) {
            message = t('You don’t have enough IP to check-in. Get faucet and try again');
          }

          notify({
            message: message,
            type: 'error',
            duration: null
          });

          return;
        }
      }

      if (res) {
        payload.extrinsicHash = res.extrinsicHash || '';
      }

      const submitTaskFinished = (taskId: number, payload: Record<string, unknown>, subErrorHandler?: () => Promise<void>) => {
        apiSDK.finishTask(taskId, payload)
          .then(async (result) => {
            if (task.airlyftWidgetId && result.isOpenUrl) {
              await openWidget(task.airlyftWidgetId, task.airlyftId ?? '');
            }

            setTaskLoading(false);
            setCompleted(result.success);

            if (result.success) {
              actionReloadPoint();
            }
          })
          .catch((e) => {
            const error = e as Error;

            if (subErrorHandler && error.message?.toLowerCase().includes('account not linked')) {
              subErrorHandler().catch(console.error);
            } else {
              throw error;
            }
          }).catch((e) => {
            const error = e as Error;

            setTaskLoading(false);

            if (error.message?.toLowerCase().includes('not the owner of NFT'.toLowerCase())) {
              handleNoNftFoundModalProps().catch(console.error);

              return;
            }

            let notifyMessage = error.message;

            if (error.message?.toLowerCase().includes('This address has been used'.toLowerCase())) {
              notifyMessage = t('Account already linked to another Telegram ID');
            }

            notify({
              message: notifyMessage,
              type: 'error',
              duration: null
            });
          });
      };

      if (isNftTask) {
        submitTaskFinished(taskId, payload, async () => {
          const wcAddress = await getWcAddress();

          if (!wcAddress) {
            setTaskLoading(false);
          } else {
            payload.address = wcAddress;
            submitTaskFinished(taskId, payload);
          }
        });
      } else {
        submitTaskFinished(taskId, payload);
      }

      if (!task.airlyftId) {
        setTimeout(() => {
          (async () => {
            let urlRedirect = task.url;

            if (task.share_leaderboard) {
              const shareLeaderboard = JSON.parse(task.share_leaderboard) as ShareLeaderboard;
              const startEnv = shareLeaderboard.start_time;
              const endEnv = shareLeaderboard.end_time;

              urlRedirect = await apiSDK.getShareTwitterURL(startEnv, endEnv, shareLeaderboard.content, task.gameId ?? 0, shareLeaderboard.url);
            }

            if (urlRedirect) {
              telegramConnector.openLink(urlRedirect);
            }
          })().catch(console.error);
        }, 100);
      }
    })().catch(console.error);
  }, [task.id, task.onChainType, task.network, task.metadata?.contractAddress, task.airlyftId, task.airlyftWidgetId, task.url, task.share_leaderboard, task.gameId, getWcAddress, notify, t, openWidget, actionReloadPoint, handleNoNftFoundModalProps]);

  const { endTime,
    isDisabled,
    isInTimeRange,
    isNotStarted,
    startTime } = (() => {
    const now = Date.now();

    const startTime = task.startTime ? new Date(task.startTime).getTime() : undefined;
    const endTime = task.endTime ? new Date(task.endTime).getTime() : undefined;
    const isNotStarted = !completed && !!startTime && startTime > now;
    const isInTimeRange = !completed && !!endTime && endTime > now;
    const isEnd = !completed && !!endTime && endTime <= now;

    return {
      startTime,
      endTime,
      isNotStarted,
      isInTimeRange,
      // @ts-ignore
      isEnd,
      isDisabled: isNotStarted || isEnd
    };
  })();

  const renderTaskDate = () => {
    const now = Date.now();

    let content: string | undefined;

    if (isNotStarted && !!startTime && startTime < now) {
      content = `${t('Begins at')} ${customFormatDate(startTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    } else if (isInTimeRange && !!endTime && endTime > now) {
      content = `${t('Ends at')} ${customFormatDate(endTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    }

    if (content) {
      return (
        <div className='__task-date'>
          {content}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={CN(className, { disabled: isDisabled })}
      key={task.id}
    >
      <div className='__left-part'>
        <Image
          className={'__task-banner'}
          src={task.icon || undefined}
          width={40}
        />
      </div>

      <div className='__mid-part'>
        <div className='__min-part-line-1'>
          <div className='__task-name'>
            {task.name}
          </div>
        </div>
        <div className='__min-part-line-2'>
          <GamePoint
            className={'__game-point'}
            point={`${toDisplayNumber(task.pointReward || 0)}`}
          />

          {renderTaskDate()}
        </div>
      </div>

      <div className='__right-part'>
        {!completed && (
          <Button
            disabled={isDisabled}
            loading={taskLoading}
            onClick={finishTask}
            shape={'round'}
            size={'xs'}
          >
            {task.achievement ? (task.buttonView ?? t('Go')) : t('Go')}
          </Button>
        )}

        {
          completed && (
            <Icon
              className={'background-icon -size-4 -primary-2'}
              phosphorIcon={CheckCircle}
              weight={'fill'}
            />
          )
        }
      </div>
    </div>
  );
};

const TaskItem = styled(_TaskItem)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    alignItems: 'center',
    display: 'flex',
    padding: token.paddingSM,
    borderRadius: token.borderRadius,

    '&.disabled': {
      opacity: 0.6
    },

    '.__mid-part': {
      flex: 1
    },

    '.__task-banner': {
      marginRight: token.marginXS
    },

    '.__min-part-line-1': {

    },

    '.__min-part-line-2': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__task-name': {
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__task-date': {
      display: 'flex',
      fontSize: 10,
      lineHeight: '16px',
      fontWeight: token.headingFontWeight,
      color: token.colorTextDark3,
      paddingLeft: token.paddingXS,
      alignItems: 'center',

      '&:before': {
        content: '""',
        marginRight: token.marginXS,
        backgroundColor: token.colorTextDark4,
        height: 12,
        width: 1
      }
    }
  };
});

export default TaskItem;
