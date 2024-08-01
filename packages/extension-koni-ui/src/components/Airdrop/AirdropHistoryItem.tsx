// Copyright 2019-2022 @subwallet/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GamePoint } from '@subwallet/extension-koni-ui/components';
import { AirdropRewardHistoryLog } from '@subwallet/extension-koni-ui/connector/booka/types';
import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { customFormatDate, toDisplayNumber } from '@subwallet/extension-koni-ui/utils';
import { Button, Icon, Squircle } from '@subwallet/react-ui';
import CN from 'classnames';
import { CheckCircle, Gift } from 'phosphor-react';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

type Props = {
  item: AirdropRewardHistoryLog,
  onClaim: (airdrop_record_id: number) => void;
} & ThemeProps;

const Component = ({ className, item, onClaim }: Props): React.ReactElement => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const logoMaps = useSelector((state: RootState) => state.settings.logoMaps).assetLogoMap;

  const _onClaim = useCallback(async (airdropRcordId: number) => {
    setIsLoading(true);

    try {
      await onClaim(airdropRcordId);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }, [onClaim]);

  const renderDate = () => {
    let content: string;

    if (item.status === 'PENDING') {
      content = `${t('Ends at')} ${customFormatDate(item.endTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    } else if (item.status === 'MISSED') {
      content = t('Expired');
    } else {
      content = `${customFormatDate(item.endTime, '#hhhh#:#mm# - #DD#/#MM#/#YYYY#')}`;
    }

    return (
      <div className='__item-date'>
        {content}
      </div>
    );
  };

  return (
    <div className={CN(className, {
      '-received': item.status === 'RECEIVED',
      '-missed': item.status === 'MISSED'
    })}
    >
      <div className='__left-part'>
        <Squircle
          className='__gift-icon'
          customSize={40}
        >
          <Icon
            customSize={'20px'}
            phosphorIcon={Gift}
            weight={'fill'}
          />
        </Squircle>
      </div>

      <div className='__mid-part'>
        <div className='__min-part-line-1'>
          <div className='__item-name'>
            {item.name}
          </div>
        </div>
        <div className='__min-part-line-2'>
          <GamePoint
            className={'__reward-value'}
            point={`${toDisplayNumber(item.rewardValue || 0)}`}
            tokenSrc={item.type === 'TOKEN' ? logoMaps[(item.tokenSlug || '').toLowerCase()] : undefined}
          />

          {renderDate()}
        </div>
      </div>

      <div className='__right-part'>
        {item.status !== 'RECEIVED' && (
          <Button
            className={'-primary-2'}
            loading={isLoading}
            onClick={() => _onClaim(item.id)}
            shape={'round'}
            size={'xs'}
          >
            {t('Claim')}
          </Button>
        )}

        {
          item.status === 'RECEIVED' && (
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

const AirdropHistoryItem = styled(Component)<ThemeProps>(({ theme: { extendToken, token } }: ThemeProps) => {
  return {
    alignItems: 'center',
    display: 'flex',
    padding: token.paddingSM,
    borderRadius: token.borderRadius,

    '.__gift-icon': {
      backgroundColor: token.colorPrimary
    },

    '.__left-part': {
      paddingRight: token.paddingXS
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

    '.__item-name': {
      color: token.colorTextDark2,
      fontWeight: token.headingFontWeight,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight
    },

    '.__item-date': {
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
    },

    '&.-missed': {
      opacity: 0.4,

      '.__item-date': {
        color: token.colorError
      }
    },

    '&.-received': {
      '.__gift-icon': {
        backgroundColor: extendToken.colorBgTranslucent
      }
    }
  };
});

export default AirdropHistoryItem;
