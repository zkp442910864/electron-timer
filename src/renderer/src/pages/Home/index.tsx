import { useBaseDataStore, useTimerDataStore } from '@web/store';
import { Button, Carousel, Checkbox, InputNumber } from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';

// 00:00:00
// 1 - 9
// 820*820

// 操作
// 开始 重置

// 设置
// x分钟不操作后，自定停止计时
// 计时x分钟后，通知休息
// 开机自动计时
// 显示悬浮窗

// 统计
// 每天 23:59:59 后自动进行重置，并记录当天总时间
const Home = () => {
    const stateStore = useBaseDataStore();
    const stateTimerStore = useTimerDataStore();
    const { current: numberControl, } = useRef<CarouselRef[]>([]);

    /** 设置展示 */
    const setTimeContent = () => {
        const arr = dayjs.duration(stateTimerStore.time, 'seconds').format('HH:mm:ss').split('').filter(ii => ii !== ':');
        arr.forEach((val, index) => {
            numberControl[index].goTo(+val);
        });
    };

    /** 自动停止(需要鼠标或键盘的操作，来不断执行该函数) */
    const autoStop = () => {
        stateTimerStore.autoStopTimeId && clearTimeout(stateTimerStore.autoStopTimeId);
        if (!stateTimerStore.status || stateStore.data.timeoutVal === 0) return;

        const timeoutVal = (stateStore.data.timeoutVal ?? 5) * 60;
        stateTimerStore.autoStopTimeId = setTimeout(() => {
            stop();
            setTimeout(() => {
                stateTimerStore.time -= timeoutVal;
                setTimeContent();
                console.log('自动停止');
            }, 1000);
        }, timeoutVal * 1000);
    };

    /** 通知 */
    const notification = () => {
        const minute = stateTimerStore.reachCountVal / 60;
        const targetVal = stateStore.data.reachVal ?? 45;
        if (targetVal === 0) return;
        if (minute % targetVal === 0) {
            // 通知
            console.log('该休息了');
        }
    };

    /** 统计当天的时间 */
    const statisticsCurrentDay = () => {
        if (dayjs().format('HH:mm:ss') !== '00:00:00') return;
        const val = stateTimerStore.time;
        // 按天存储起来 dayjs().format('yyyy-MM-DD HH:mm:ss') val
        reset();
        start();
    };

    /** TODO:开始(需要鼠标或键盘的操作，来不断执行该函数)(开始后会自动附带自动停止函数) */
    const start = () => {
        if (stateTimerStore.status) {
            autoStop();
            return;
        }
        stateTimerStore.status = true;
        stateTimerStore.timeId = setInterval(() => {
            stateTimerStore.time++;
            stateTimerStore.reachCountVal++;
            statisticsCurrentDay();
            setTimeContent();
            notification();
        }, 1000);

        autoStop();
    };

    const stop = () => {
        stateTimerStore.timeId && clearInterval(stateTimerStore.timeId);
        stateTimerStore.autoStopTimeId && clearTimeout(stateTimerStore.autoStopTimeId);

        stateTimerStore.status = false;
        stateTimerStore.reachCountVal = 0;
        stateTimerStore.timeId = null;
        stateTimerStore.autoStopTimeId = null;
    };

    const reset = () => {
        stop();
        stateTimerStore.time = 0;
        setTimeContent();
    };

    useEffect(() => {
        window.onKeyboardMouse(() => {
            console.log('全局事件触发');
            start();
        });
    }, []);

    return (
        <div className="flex f-col f-justify-center f-items-center un-h100vh un-w90% un-m-auto">
            {
                useMemo(() =>
                    <div className="flex f-justify-center f-items-center un-w100% d-select">
                        {
                            stateTimerStore.formatArr.map((str, index) =>
                                <div key={index.toString()} className={`${str === '0' ? 'f-1 un-w0 un-shadow-lg un-shadow-green-500/30 un-bg-green-500 m-10 un-rounded-lg un-overflow-hidden' : ''}`}>
                                    {
                                        str === '0'
                                            ?
                                            <Carousel
                                                ref={(control) => {
                                                    control && numberControl.push(control);
                                                }}
                                                dots={false}
                                                dotPosition="left"
                                            >
                                                {
                                                    stateTimerStore.numberArr.map((_, index) =>
                                                        <div key={index.toString()} className="un-leading-160px text-center un-text-white un-text-56px">
                                                            {index}
                                                        </div>
                                                    )
                                                }
                                            </Carousel>
                                            : <div className="text-center p-10  un-text-46px un-text-gray-200">:</div>
                                    }
                                </div>
                            )
                        }
                    </div>
                , [])
            }
            <div className="un-w100% p-10 flex f-justify-between f-items-center m-y-30">
                <div className="un-text-26px un-font-bold">操作</div>
                <div className="flex un-gap10px">
                    <Button onClick={reset}>重置</Button>
                    <Button color="default" variant="solid" onClick={stop}>停止</Button>
                    <Button type="primary" onClick={start}>开始</Button>
                </div>
            </div>
            <div className="un-w100% p-10 m-y-30">
                <div className="un-text-26px un-font-bold">设置</div>
                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>{stateStore.data.timeoutVal}分钟不操作后，自定停止计时(设置为0不执行该操作)</div>
                    <InputNumber
                        className="un-w150px"
                        value={stateStore.data.timeoutVal}
                        precision={0}
                        max={15}
                        addonAfter="分钟"
                        onBlur={() => {
                            if (!stateStore.data.timeoutVal) {
                                stateStore.updateAssignKey('timeoutVal', 5);
                            }
                        }}
                        onChange={(e) => {
                            stateStore.updateAssignKey('timeoutVal', e);
                        }}
                    />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>计时{stateStore.data.reachVal}分钟后, 通知休息(只要停止后, 将重新计算)(设置为0不执行该操作)</div>
                    <InputNumber
                        className="un-w150px"
                        value={stateStore.data.reachVal}
                        precision={0}
                        max={1440}
                        addonAfter="分钟"
                        onBlur={() => {
                            if (!stateStore.data.reachVal) {
                                stateStore.updateAssignKey('reachVal', 45);
                            }
                        }}
                        onChange={(e) => {
                            stateStore.updateAssignKey('reachVal', e);
                        }}
                    />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>显示悬浮窗</div>
                    <Checkbox checked={stateStore.data.showFloatWindow} onChange={(e) => {
                        stateStore.updateAssignKey('showFloatWindow', e.target.checked);
                    }} />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>开启自动计时(开启后,禁止操作)</div>
                    <Checkbox checked={stateStore.data.autoStart} onChange={(e) => {
                        stateStore.updateAssignKey('autoStart', e.target.checked);
                    }} />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>开机启动</div>
                    <Checkbox checked={stateStore.data.autoLaunch} onChange={(e) => {
                        stateStore.updateAssignKey('autoLaunch', e.target.checked);
                    }} />
                </div>
            </div>
            <div className="un-w100% p-10 flex f-justify-between f-items-center m-y-30">
                <div className="un-text-26px un-font-bold">统计</div>
                <Button color="default" variant="solid">待开发</Button>
                {/* <Button color="default" variant="solid">查看</Button> */}
            </div>
        </div>
    );
};

export default Home;