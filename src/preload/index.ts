import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

const funData = {
    onKeyboardMouse: (cb: () => void) => electronAPI.ipcRenderer.on('KeyboardMouse', cb),
    storeGet: (key: keyof IGlobalAppCacheData) => electronAPI.ipcRenderer.invoke('storeGet', key),
    storeSet: (key: keyof IGlobalAppCacheData, value: IGlobalAppCacheData[keyof IGlobalAppCacheData]) => electronAPI.ipcRenderer.invoke('storeSet', key, value),
    storeGetAll: () => electronAPI.ipcRenderer.invoke('storeGetAll'),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
        contextBridge.exposeInMainWorld('onKeyboardMouse', funData.onKeyboardMouse);
        contextBridge.exposeInMainWorld('storeGet', funData.storeGet);
        contextBridge.exposeInMainWorld('storeSet', funData.storeSet);
        contextBridge.exposeInMainWorld('storeGetAll', funData.storeGetAll);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    window.electron = electronAPI;
    window.api = api;
    window.onKeyboardMouse = funData.onKeyboardMouse;
    window.storeGet = funData.storeGet;
    window.storeSet = funData.storeSet;
    window.storeGetAll = funData.storeGetAll;
}