import { ipcMain } from 'electron';
import Store from 'electron-store';
import yaml from 'js-yaml';

export class GlobalDataStore {
    private static instance: GlobalDataStore;

    store: InstanceType<typeof Store> | null = null;
    /** 本地保存一份，不要一直操作读 */
    inlineData: IGlobalAppCacheData = {
        timeoutVal: 5,
        reachVal: 45,
        autoStart: true,
        showFloatWindow: true,
        autoLaunch: false,
        dayData: [],
        floatWinPosition: [],
    };
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
    }

    /** 防抖 */
    debounce = <T extends unknown[], >(fn: (...arg: T) => void) => {
        let timeId = null as ReturnType<typeof setTimeout> | null;

        return (...arg: T) => {
            timeId && clearTimeout(timeId);
            timeId = setTimeout(() => {
                timeId = null;
                fn(...arg);
            }, 1000);
        };
    };

    throttle = <T extends unknown[], >(fn: (...arg: T) => void, wait = 100) => {
        let now = 0;

        return (...arg: T) => {
            if (now + wait <= Date.now()) {
                now = Date.now();
                fn(...arg);
            }
        };
    };

    init() {
        this.store = new Store({
            fileExtension: 'yaml',
            serialize: yaml.dump,
            deserialize: yaml.load,
        });

        if (this.store.size === 0) {
            this.store.store = this.inlineData;
        }
        else {
            this.inlineData = this.store.store as IGlobalAppCacheData;
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
        return this.inlineData[key];
        // return this.store!.get(key) as IGlobalAppCacheData[T];
    };

    /** 如果不是实时获取，这份数据可能是旧的 */
    storeGetAll = () => {
        return this.inlineData;
    };

    storeSet = <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => {
        this.inlineData[key] = value;
        this.store!.set(key, value);
    };

    storeSetDayData = this.throttle((title: string, value: string) => {
        const dayData = this.inlineData.dayData.slice();
        const dayItem = dayData.find(ii => ii.title === title);

        if (dayItem) {
            dayItem.value = value;
        }
        else {
            dayData.push({ title, value, });
        }

        this.storeSet('dayData', dayData);
    }, 10000);

}

type TInterceptSet = <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => void;
