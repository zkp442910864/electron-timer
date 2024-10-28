/// <reference types="vite/client" />

import { IpcRendererEvent } from 'electron';
import { ElectronAPI } from '@electron-toolkit/preload';

declare global {

    type TTimerUpdateCallback = (event: IpcRendererEvent, data: {time: number, status: boolean, autoStart: false, logArr: string[]}) => void;

    interface Window {
        electron: ElectronAPI
        api: unknown

        storeGet: <T extends keyof IGlobalAppCacheData>(key: T) => Promise<IGlobalAppCacheData[T]>;
        storeGetAll: () => Promise<IGlobalAppCacheData>;
        storeSet: <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => Promise<void>;

        // timerReset: () => void;
        // timerStop: () => void;
        // timerStart: () => void;
        timerResetZero: () => void;
        onTimerUpdate: (cb: TTimerUpdateCallback) => () => void;

        mainWindowMinimize: () => void;

        setIgnoreMouseEvents: (val: boolean) => void;
        moverFloatWindow: (x: number, y: number) => void;
    }
}
