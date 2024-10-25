
declare global {
    interface IGlobalAppCacheData {
        /** 超时x后，停止 */
        timeoutVal: number | null;
        /** 每达到x后，通知 */
        reachVal: number | null;
        /** 自动开始 */
        autoStart: boolean;
        /** 显示悬浮窗口 */
        showFloatWindow: boolean;
        /** 开机启动 */
        autoLaunch: boolean;
        dayData: Array<{title: string, value: string}>;
    }
}

