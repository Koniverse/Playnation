// Copyright 2019-2022 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { addLazy } from '@subwallet/extension-base/utils';
import { createPromiseHandler } from '@subwallet/extension-base/utils/promise';
import WebApp from '@twa-dev/sdk';

import { xglobal } from '@polkadot/x-global';

const sdkVersion = WebApp.version.split('.').map((v) => parseInt(v, 10));
const useLocal = sdkVersion[0] < 7;
const KEY_REPLACE_SYMBOL = '__--__';

function cloudToStorageKey (key: string) {
  return key.includes(KEY_REPLACE_SYMBOL) ? key.replace(KEY_REPLACE_SYMBOL, ':') : key;
}

function storageToCloudKey (key: string) {
  return key.includes(':') ? key.replace(':', KEY_REPLACE_SYMBOL) : key;
}

// Create localStorage adaptor
export class SWStorage {
  private _storage = {} as Record<string, string>;
  private localStorage = useLocal ? localStorage : undefined;
  private cloudStorage = WebApp.CloudStorage;
  private isReady = false;
  private waitReadyHandler = createPromiseHandler<SWStorage>();

  public get waitReady () {
    return this.waitReadyHandler.promise;
  }

  cloudSetItem (key: string, value: string) {
    // Avoid set item too fast
    addLazy(`__cloudSetItem:${key}`, () => {
      this.cloudStorage.setItem(storageToCloudKey(key), value, (err, success) => {
        if (err) {
          console.error('cloudSetItem error', key, err);
        }
      });
    });
  }

  cloudRemoveItem (key: string) {
    this.cloudStorage.removeItem(storageToCloudKey(key), (err, success) => {
      if (err) {
        console.error('cloudRemoveItem error', key, err);
      }
    });
  }

  cloudRemoveItems (keys: string[]) {
    this.cloudStorage.removeItems(keys.map(storageToCloudKey), (err, success) => {
      if (err) {
        console.error('cloudRemoveItem error', keys, err);
      }
    });
  }

  constructor () {
    this.sync()
      .then(() => {
        this.isReady = true;
        this.waitReadyHandler.resolve(this);
      })
      .catch(console.error);
  }

  async setItem (key: string, value: string) {
    !this.isReady && await this.waitReady;
    this._storage[key] = value;

    if (this.localStorage) {
      this.localStorage?.setItem(key, value);
    } else {
      this.cloudSetItem(key, value);
    }
  }

  async getEntries () {
    !this.isReady && await this.waitReady;

    return Object.entries(this._storage);
  }

  async setMap (map: Record<string, string>) {
    !this.isReady && await this.waitReady;
    this._storage = { ...this._storage, ...map };

    if (this.localStorage) {
      Object.entries(map).forEach(([key, value]) => {
        this.localStorage?.setItem(key, value);
      });
    } else {
      Object.entries(map).forEach(([key, value]) => {
        this.cloudSetItem(key, value);
      });
    }
  }

  async getItem (key: string): Promise<string | null> {
    !this.isReady && await this.waitReady;

    return this._storage[key] || null;
  }

  async getItems (keys: string[]): Promise<Array<string | null>> {
    !this.isReady && await this.waitReady;

    return keys.map((key) => this._storage[key] || null);
  }

  async getMap (keys: string[]): Promise<Record<string, string | null>> {
    !this.isReady && await this.waitReady;

    return keys.reduce((result, key) => {
      result[key] = this._storage[key] || null;

      return result;
    }, {} as Record<string, string | null>);
  }

  async removeItem (key: string) {
    !this.isReady && await this.waitReady;
    this._storage[key] && delete this._storage[key];

    if (this.localStorage) {
      this.localStorage.removeItem(key);
    } else {
      this.cloudRemoveItem(key);
    }
  }

  async removeItems (keys: string[]) {
    !this.isReady && await this.waitReady;

    keys.forEach((key) => {
      this._storage[key] && delete this._storage[key];
    });

    if (this.localStorage) {
      keys.forEach((key) => {
        this.localStorage && this.localStorage.removeItem(key);
      });
    } else {
      this.cloudRemoveItems(keys);
    }
  }

  async clear () {
    !this.isReady && await this.waitReady;
    this._storage = {};

    if (this.localStorage) {
      this.localStorage.clear();
    } else {
      this.cloudStorage.getKeys((err, keys) => {
        err && console.error(err);
        keys && this.cloudRemoveItems(keys);
      });
    }
  }

  async key (index: number): Promise<string | null> {
    !this.isReady && await this.waitReady;

    return Object.keys(this._storage)[index] || null;
  }

  async length (index: number): Promise<string | null> {
    !this.isReady && await this.waitReady;

    return Object.keys(this._storage)[index] || null;
  }

  // Additional methods
  async keys (): Promise<string[]> {
    !this.isReady && await this.waitReady;

    return Object.keys(this._storage) || [];
  }

  async copy (): Promise<Record<string, string>> {
    !this.isReady && await this.waitReady;

    return this._storage;
  }

  async sync () {
    if (this.localStorage) {
      this._storage = JSON.parse(JSON.stringify(this.localStorage)) as Record<string, string>;
    } else {
      await new Promise((resolve) => {
        this._storage = {};
        this.cloudStorage.getKeys((err, keys) => {
          err && console.error('Storage sync errors', err);

          if (!keys || keys.length === 0) {
            return resolve(true);
          }

          this.cloudStorage.getItems(keys, (err2, items) => {
            err2 && console.error('Storage sync errors', err2);

            if (items) {
              Object.entries(items).forEach(([key, value]) => {
                this._storage[cloudToStorageKey(key)] = value;
              });
            }

            resolve(true);
          });
        });
      });
    }
  }

  static get instance () {
    if (!xglobal.SWStorage) {
      xglobal.SWStorage = new SWStorage();
    }

    return xglobal.SWStorage as SWStorage;
  }
}
