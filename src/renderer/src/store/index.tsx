import { createCustom } from './modules/config';

export const [baseDataStore, useBaseDataStore,] = createCustom<IBaseData>((cache, set) => cache({
    data: {
        timeoutVal: null,
        reachVal: null,
        autoStart: true,
        showFloatWindow: false,
        autoLaunch: false,
        dayData: [],
    },
    updateBaseData: (data: IGlobalAppCacheData) => set((state) => ({ ...state, data, })),
    updateAssignKey: (key, value) => set((state) => {
        void window.storeSet(key, value);
        state.data[key] = value;
        return { ...state, };
    }),
}));

const timerData = {
    // 秒
    time: 0,
    /** 计时器执行 setInterval id */
    timeId: null as null | ReturnType<typeof setInterval>,
    /** 自动停止 setTimeout id */
    autoStopTimeId: null as null | ReturnType<typeof setTimeout>,
    /** 用来计算是否达到"reachVal"的值 */
    reachCountVal: 0,
    /** 是否开启中 */
    status: false,
};
export const [, useTimerDataStore,] = createCustom<typeof timerData>((cache, set) => cache(timerData));

interface IBaseData {
    data: IGlobalAppCacheData;
    updateBaseData: (data: IGlobalAppCacheData) => void;
    updateAssignKey: <T extends keyof IGlobalAppCacheData>(key: T, value: IGlobalAppCacheData[T]) => void;
}
