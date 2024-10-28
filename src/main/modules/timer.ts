import dayjs from 'dayjs';
import { GlobalDataStore } from './globalDataStore';
import { BrowserWindow, ipcMain, Notification } from 'electron';

export class Timer {
    storeInstance = GlobalDataStore.getInstance();

    /** 秒 */
    time = 0;
    /** 每次置0后，都把现有的时间推入 */
    timeArr = [] as number[];
    /** 日志信息 */
    logArr = [] as string[];
    /** 计时器执行 setInterval id */
    timeId: null | ReturnType<typeof setInterval> = null;
    /** 自动停止 setTimeout id */
    autoStopTimeId: null | ReturnType<typeof setTimeout> = null;
    /** 用来计算是否达到"reachVal"的值 */
    reachCountVal = 0;
    /** 是否开启中 */
    status = false;
    /** 记录跨天的情况 */
    disabled = false;

    constructor() {
        ipcMain.on('timerResetZero', this.resetZero);
        this.pushLog('程序启动');
        this.recoveryData();
    }

    /** 如果存在记录过的恢复，进行恢复 */
    recoveryData() {
        const dayData = this.storeInstance.storeGet('dayData');
        const title = dayjs().format('YYYY-MM-DD');
        const item = dayData.find(ii => ii.title === title);
        if (item) {
            const arr = item.value.split('\n');
            const first = arr.shift();
            let match;
            // eslint-disable-next-line no-cond-assign
            if (match = first?.match(/\(\d+\)/)) {
                const time = +match[0].replace(/\(|\)/g, '');
                !Number.isNaN(time) && (this.time = time);
            }
            this.logArr = arr;
        }
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
                // autoStart: this.storeInstance.storeGet('autoStart'),
                logArr: this.computeDayTimeLog(),
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
            this.pushLog('停止');
            this.stop();
            setTimeout(() => {
                this.time -= timeoutVal;
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
            this.pushLog('通知');
            new Notification({
                title: '计时器',
                body: '休息个5分钟吧！！！',
            }).show();
        }
    };

    /** 一天结束 */
    dayEnd() {
        if (dayjs().format('HH:mm:ss') !== '23:59:59') return;

        this.disabled = false;
        this.computeDayTimeLog();
        this.resetAll();
        /** 确保开始的时间是第二天 */
        setTimeout(() => {
            this.disabled = true;
            this.play();
        }, 1000);
    }

    /** 开始 */
    start = () => {
        if (this.status) return;
        this.pushLog('开始');
        this.status = true;
        this.timeId = setInterval(() => {
            this.time++;
            this.reachCountVal++;
            this.dayEnd();
            this.notification();
        }, 1000);
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

    /** 重置所有内容 */
    resetAll() {
        this.stop();
        this.time = 0;
        this.timeArr = [];
        this.logArr = [];
    };

    /** 重置为0 */
    resetZero = () => {
        this.stop();
        this.pushLog('置0');
        this.timeArr.push(this.time);
        this.time = 0;
    };

    /** 计算今天总耗时 */
    computeDayTimeLog() {
        const logArr = this.logArr.slice();
        const totalTime = this.timeArr.reduce((total, a) => total += a, 0) + this.time;
        logArr.unshift(`今天: 总计时 ${dayjs.duration(totalTime, 'seconds').format('HH:mm:ss')}(${totalTime})`);

        this.storeInstance.storeSetDayData(dayjs().format('YYYY-MM-DD'), logArr.join('\n'));

        return logArr;
    }

    pushLog(msg: string) {
        this.logArr.unshift(`[${dayjs().format('YYYY-MM-DD HH:mm:ss')}]: ` + msg);
    }

    /** 执行(需要鼠标或键盘的操作，来不断执行该函数)(开始后会自动附带自动停止函数) */
    play() {
        if (this.disabled) return;

        if (this.status) {
            this.autoStop();
        }
        else {
            this.start();
            this.autoStop();
        }
    }
}
