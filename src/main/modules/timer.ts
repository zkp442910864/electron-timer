import dayjs from 'dayjs';
import { GlobalDataStore } from './globalDataStore';
import { BrowserWindow, ipcMain, Notification } from 'electron';


export class Timer {
    storeInstance = GlobalDataStore.getInstance();

    /** 秒 */
    time = 0;
    /** 计时器执行 setInterval id */
    timeId: null | ReturnType<typeof setInterval> = null;
    /** 自动停止 setTimeout id */
    autoStopTimeId: null | ReturnType<typeof setTimeout> = null;
    /** 用来计算是否达到"reachVal"的值 */
    reachCountVal = 0;
    /** 是否开启中 */
    status = false;

    constructor() {
        ipcMain.on('timerReset', this.reset);
        ipcMain.on('timerStop', this.stop);
        ipcMain.on('timerStart', this.start);
    }

    /** 给win窗口，绑定推送事件 */
    sendTime(win: BrowserWindow) {
        const timeId = setInterval(() => {
            if (win.isDestroyed()) {
                clearInterval(timeId);
                return;
            }
            win.webContents.send('TimerUpdate', {
                time: this.time,
                status: this.status,
                autoStart: this.storeInstance.storeGet('autoStart'),
            });
        }, 100);

        return timeId;
    }

    /** 自动停止(需要鼠标或键盘的操作，来不断执行该函数) */
    autoStop = () => {
        this.autoStopTimeId && clearTimeout(this.autoStopTimeId);
        if (!this.storeInstance.storeGet('autoStart')) return;
        if (!this.status || this.storeInstance.storeGet('timeoutVal') === 0) return;

        const timeoutVal = (this.storeInstance.storeGet('timeoutVal') ?? 5) * 60;
        this.autoStopTimeId = setTimeout(() => {
            this.stop();
            setTimeout(() => {
                this.time -= timeoutVal;
                console.log('自动停止');
            }, 1000);
        }, timeoutVal * 1000);
    };

    /** 通知 */
    notification = () => {
        const minute = this.reachCountVal / 60;
        const targetVal = this.storeInstance.storeGet('reachVal') ?? 45;
        if (targetVal === 0) return;
        if (minute % targetVal === 0) {
            // 通知
            console.log('该休息了');
            new Notification({
                title: '计时器',
                body: '休息个5分钟吧！！！',
            }).show();
        }
    };

    /** TODO:统计当天的时间 */
    statisticsCurrentDay = () => {
        if (dayjs().format('HH:mm:ss') !== '00:00:00') return;
        const val = this.time;
        // 按天存储起来 dayjs().format('yyyy-MM-DD HH:mm:ss') val
        this.reset();
        this.start();
    };

    /** TODO:开始(需要鼠标或键盘的操作，来不断执行该函数)(开始后会自动附带自动停止函数) */
    start = () => {
        if (this.status) {
            this.autoStop();
            return;
        }
        this.status = true;
        this.timeId = setInterval(() => {
            this.time++;
            this.reachCountVal++;
            this.statisticsCurrentDay();
            this.notification();
        }, 1000);

        this.autoStop();
    };

    /** 停止 */
    stop = () => {
        this.timeId && clearInterval(this.timeId);
        this.autoStopTimeId && clearTimeout(this.autoStopTimeId);

        this.status = false;
        this.reachCountVal = 0;
        this.timeId = null;
        this.autoStopTimeId = null;
    };

    /** 重置 */
    reset = () => {
        this.stop();
        this.time = 0;
    };
}
