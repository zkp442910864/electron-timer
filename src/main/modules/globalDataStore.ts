import { ipcMain } from 'electron';
import Store from 'electron-store';
import yaml from 'js-yaml';

export class GlobalDataStore {
    private static instance: GlobalDataStore;

    store: InstanceType<typeof Store> | null = null;
    /** 初始化后，本地保存一份，不要一直操作读 */
    globalDataStore: IGlobalAppCacheData | null = null;
    interceptSetFn;

    static getInstance(interceptSetFn?: TInterceptSet) {
        if (!GlobalDataStore.instance) {
            if (!interceptSetFn) {
                throw new Error('第一次实例化，需要传入参数');
            }
            GlobalDataStore.instance = new GlobalDataStore(interceptSetFn);
        }

        return GlobalDataStore.instance;
    }

    private constructor(interceptSetFn: TInterceptSet) {
        this.interceptSetFn = interceptSetFn;
        this.init();
        this.globalDataStore = this.storeGetAll();
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
            this.interceptSetFn(key, value);
            this.storeSet(key, value);
        });

        ipcMain.handle('storeGetAll', () => {
            return this.storeGetAll();
        });
    }

    storeGet = <T extends keyof IGlobalAppCacheData>(key: T) => {
        if (this.globalDataStore) {
            return this.globalDataStore[key];
        }
        return this.store!.get(key) as IGlobalAppCacheData[T];
    };

    storeGetAll = () => {
        return this.store!.store as IGlobalAppCacheData;
    };

    storeSet = <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => {
        if (this.globalDataStore) {
            this.globalDataStore[key] = value;
        }
        this.store!.set(key, value);
    };
}

type TInterceptSet = <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => void;
