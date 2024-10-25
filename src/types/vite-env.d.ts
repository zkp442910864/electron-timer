/// <reference types="vite/client" />

import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
    interface Window {
        electron: ElectronAPI
        api: unknown
        onKeyboardMouse: (cb: () => void) => void;
        storeGet: <T extends keyof IGlobalAppCacheData>(key: T) => Promise<IGlobalAppCacheData[T]>;
        storeGetAll: () => Promise<IGlobalAppCacheData>;
        storeSet: <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => Promise<void>;
    }
}
