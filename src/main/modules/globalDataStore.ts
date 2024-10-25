import { ipcMain } from 'electron';
import Store from 'electron-store';
import yaml from 'js-yaml';
import { KeyboardMouse } from './keyboardMouse';

export class GlobalDataStore {
    private static instance: GlobalDataStore;

    store: InstanceType<typeof Store> | null = null;

    static getInstance() {
        if (!GlobalDataStore.instance) {
            GlobalDataStore.instance = new GlobalDataStore();
        }

        return GlobalDataStore.instance;
    }

    private constructor() {
        this.init();

    }

    init() {
        this.store = new Store({
            fileExtension: 'yaml',
            serialize: yaml.dump,
            deserialize: yaml.load,
        });

        if (this.store.size === 0) {
            const initData: IGlobalAppCacheData = {
                timeoutVal: 5,
                reachVal: 45,
                autoStart: false,
                showFloatWindow: false,
                autoLaunch: false,
                dayData: [],
            };

            this.store.store = initData;
        }
    }

    register() {
        ipcMain.handle('storeGet', (event, key: keyof IGlobalAppCacheData) => {
            return this.storeGet(key);
        });

        ipcMain.handle('storeSet', (event, key: keyof IGlobalAppCacheData, value: IGlobalAppCacheData[keyof IGlobalAppCacheData]) => {
            if (key === 'autoStart') {
                value ? KeyboardMouse.getInstance().start() : KeyboardMouse.getInstance().kill();
            }
            this.storeSet(key, value);
        });

        ipcMain.handle('storeGetAll', () => {
            return this.storeGetAll();
        });
    }

    storeGet = <T extends keyof IGlobalAppCacheData>(key: T) => {
        return this.store!.get(key) as IGlobalAppCacheData[T];
    };

    storeGetAll = () => {
        return this.store!.store as IGlobalAppCacheData;
    };

    storeSet = <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => {
        this.store!.set(key, value);
    };
}
