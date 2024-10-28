import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

const funData = {

    storeGet: (key: keyof IGlobalAppCacheData) => electronAPI.ipcRenderer.invoke('storeGet', key),
    storeSet: (key: keyof IGlobalAppCacheData, value: IGlobalAppCacheData[keyof IGlobalAppCacheData]) => electronAPI.ipcRenderer.invoke('storeSet', key, value),
    storeGetAll: () => electronAPI.ipcRenderer.invoke('storeGetAll'),

    // timerReset: () => electronAPI.ipcRenderer.send('timerReset'),
    // timerStop: () => electronAPI.ipcRenderer.send('timerStop'),
    // timerStart: () => electronAPI.ipcRenderer.send('timerStart'),
    timerResetZero: () => electronAPI.ipcRenderer.send('timerResetZero'),
    onTimerUpdate: (cb: TTimerUpdateCallback) => electronAPI.ipcRenderer.on('TimerUpdate', cb),

    mainWindowMinimize: () => electronAPI.ipcRenderer.send('mainWindowMinimize'),

    setIgnoreMouseEvents: (val: boolean) => electronAPI.ipcRenderer.send('setIgnoreMouseEvents', val),

    moverFloatWindow: (x: number, y: number) => electronAPI.ipcRenderer.send('moverFloatWindow', x, y),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);

        contextBridge.exposeInMainWorld('storeGet', funData.storeGet);
        contextBridge.exposeInMainWorld('storeSet', funData.storeSet);
        contextBridge.exposeInMainWorld('storeGetAll', funData.storeGetAll);

        // contextBridge.exposeInMainWorld('timerReset', funData.timerReset);
        // contextBridge.exposeInMainWorld('timerStop', funData.timerStop);
        // contextBridge.exposeInMainWorld('timerStart', funData.timerStart);
        contextBridge.exposeInMainWorld('timerResetZero', funData.timerResetZero);
        contextBridge.exposeInMainWorld('onTimerUpdate', funData.onTimerUpdate);

        contextBridge.exposeInMainWorld('mainWindowMinimize', funData.mainWindowMinimize);

        contextBridge.exposeInMainWorld('setIgnoreMouseEvents', funData.setIgnoreMouseEvents);
        contextBridge.exposeInMainWorld('moverFloatWindow', funData.moverFloatWindow);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    window.electron = electronAPI;
    window.api = api;

    window.storeGet = funData.storeGet;
    window.storeSet = funData.storeSet;
    window.storeGetAll = funData.storeGetAll;

    // window.timerReset = funData.timerReset;
    // window.timerStop = funData.timerStop;
    // window.timerStart = funData.timerStart;
    window.timerResetZero = funData.timerResetZero;
    window.onTimerUpdate = funData.onTimerUpdate;

    window.mainWindowMinimize = funData.mainWindowMinimize;

    window.setIgnoreMouseEvents = funData.setIgnoreMouseEvents;
    window.moverFloatWindow = funData.moverFloatWindow;
}