// Copyright 2019-2022 @subwallet/extension-koni authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BaseMigrationJob from '@subwallet/extension-base/services/migration-service/Base';

export default class BeforeKaruraCampaign extends BaseMigrationJob {
  public override async run (): Promise<void> {
    const state = this.state;

    state.chainService.disableChain('goldberg_testnet');
    await state.chainService.updateAssetSetting('karura-NATIVE-KAR', { visible: true });
  }
}
