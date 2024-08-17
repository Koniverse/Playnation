// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { deepCopy } from '@playnation/game-sdk';
import EventEmitter from 'eventemitter3';
import {BehaviorSubject} from "rxjs";

export interface RecordVersionInfo {
  id: number
  slug: string,
  version: number
  minVersion?: number
  updateMessage?: string
}

export interface VersionInfo {
  version: number
  minVersion?: number,
  updateMessage?: string
}

export interface MaintenanceInfo {
  startTime: string // ISO 8601
  endTime: string // ISO 8601
  title: string,
  message: string,
  isMaintenance: boolean
}

export enum VersionType {
  APPLICATION = 'application',
  GAME = 'game',
  LEADERBOARD = 'leaderboard',
  TASK = 'task',
  ACHIEVEMENT = 'achievement',
  AIRDROP = 'airdrop'
}

export enum RecordVersionType {
  GAME = 'game'
}

export interface AppMetadata {
  lastUpdated: number
  maintenanceInfo?: MaintenanceInfo
  versions: {
    [VersionType.APPLICATION]: VersionInfo
    [VersionType.GAME]?: VersionInfo
    [VersionType.LEADERBOARD]?: VersionInfo
    [VersionType.TASK]?: VersionInfo
    [VersionType.ACHIEVEMENT]?: VersionInfo
    [VersionType.AIRDROP]?: VersionInfo
  },
  recordVersions?: {
    [RecordVersionType.GAME]?: RecordVersionInfo[]
  }
}

interface _VersionUpdateInfo {
  current?: VersionInfo
  newVersion: VersionInfo
  updateMessage?: string
}

export type UpdateVersionPayload = Record<VersionType, _VersionUpdateInfo>
interface _RecordUpdateInfo {
  current?: RecordVersionInfo
  newVersion: RecordVersionInfo
  updateMessage?: string
}

export type UpdateRecordPayload = Record<RecordVersionType, _RecordUpdateInfo[]>
export interface MetadataEvents {
  updateVersion: (payload: UpdateVersionPayload) => void
  onUpdateRecordVersion: (payload: UpdateRecordPayload) => void
}

// Handle action with app metadata
export class MetadataHandler extends EventEmitter<MetadataEvents> {
  private metadata?: AppMetadata;
  readonly maintenanceSubject = new BehaviorSubject({} as MaintenanceInfo);

  updateMetadata (newMetadata: AppMetadata): void {
    const dataLoaded = !!this.metadata;

    if (!dataLoaded) {
      this.metadata = newMetadata;
    }

    const currentMetadata = deepCopy(this.metadata) as AppMetadata;

    if (newMetadata.maintenanceInfo) {
      const now = new Date().getTime();
      const startTime = new Date(newMetadata.maintenanceInfo.startTime).getTime();
      const endTime = new Date(newMetadata.maintenanceInfo.endTime).getTime();

      newMetadata.maintenanceInfo.isMaintenance = now >= startTime && now <= endTime;

      this.maintenanceSubject.next(newMetadata.maintenanceInfo);
    }

    if (newMetadata.versions && newMetadata.versions && dataLoaded) {
      // Compare versions
      Object.entries(newMetadata.versions).forEach(([k, newVersion]) => {
        const key = k as VersionType;
        const currentVersion = currentMetadata.versions[key];
        const cv = currentVersion?.version || 0;
        const cmv = currentVersion?.minVersion || 0;
        const nv = newVersion.version || 0;
        const nmv = newVersion.minVersion || 0;

        const emitPayload = {} as UpdateVersionPayload;

        if (cv < nv || cmv < nmv) {
          emitPayload[key] = {
            current: currentVersion,
            newVersion,
            updateMessage: newVersion.updateMessage
          };
        }

        if (Object.keys(emitPayload).length) {
          this.emit('updateVersion', emitPayload);
        }
      });
    }

    if (newMetadata.recordVersions && newMetadata.recordVersions) {
      // Compare record versions
      Object.entries(newMetadata.recordVersions).forEach(([k, newRecordVersions]) => {
        const key = k as RecordVersionType;
        const currentRecordVersions = currentMetadata.recordVersions?.[key] || [];
        const emitPayload = {} as UpdateRecordPayload;

        newRecordVersions.forEach((newRecordVersion) => {
          const currentRecordVersion = currentRecordVersions.find((crv) => crv.slug === newRecordVersion.slug);

          if (!currentRecordVersion || currentRecordVersion.version < newRecordVersion.version) {
            if (!emitPayload[key]) {
              emitPayload[key] = [];
            }

            emitPayload[key].push({
              current: currentRecordVersion,
              newVersion: newRecordVersion,
              updateMessage: newRecordVersion.updateMessage
            });
          }
        });

        if (Object.keys(emitPayload).length) {
          this.emit('onUpdateRecordVersion', emitPayload);
        }
      });
    }

    this.metadata = newMetadata;
  }

  // Singleton
  private static _instance: MetadataHandler;
  public static get instance () {
    if (!MetadataHandler._instance) {
      MetadataHandler._instance = new MetadataHandler();
    }

    return MetadataHandler._instance;
  }
}
