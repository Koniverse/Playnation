// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class BeforeCreditcoinCampaign extends BaseMigrationJob {
  public override async run (): Promise<void> {
    const state = this.state;

    await state.chainService.updateAssetSetting('creditcoinTest-NATIVE-CTC', { visible: true });
  }
}
