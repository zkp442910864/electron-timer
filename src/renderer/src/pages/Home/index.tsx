import { useStateExtend } from '@web/hooks';
import { Button, Carousel, Checkbox, DatePicker, Input, InputNumber } from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import dayjs from 'dayjs';
import { useMemo, useRef } from 'react';

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
    const [, update,] = useStateExtend({});
    const { current: config, } = useRef({
        numberArr: new Array(10).fill(''),
        numberControl: [] as CarouselRef[],
        formatArr: '00:00:00'.split(''),
    });

    const { current: data, } = useRef({
        // 秒
        time: 0,
        timeId: null as null | ReturnType<typeof setInterval>,
        /** 超时x后，停止 */
        timeoutVal: 5 as number | null,
        autoStopTimeId: null as null | ReturnType<typeof setTimeout>,
        /** 每达到x后，通知 */
        reachVal: 45 as number | null,
        /** 用来计算是否达到"reachVal"的值 */
        reachCountVal: 0,
        /** 自动开始 */
        autoStart: false,
        /** 显示悬浮窗口 */
        showFloatWindow: false,
        status: false,
    });

    /** 设置展示 */
    const setTimeContent = () => {
        const arr = dayjs.duration(data.time, 'seconds').format('HH:mm:ss').split('').filter(ii => ii !== ':');
        arr.forEach((val, index) => {
            config.numberControl[index].goTo(+val);
        });
    };

    /** 自动停止(需要鼠标或键盘的操作，来不断执行该函数) */
    const autoStop = () => {
        data.autoStopTimeId && clearTimeout(data.autoStopTimeId);
        if (!data.status || data.timeoutVal === 0) return;

        const timeoutVal = (data.timeoutVal ?? 5) * 60;
        data.autoStopTimeId = setTimeout(() => {
            stop();
            setTimeout(() => {
                data.time -= timeoutVal;
                setTimeContent();
                console.log('自动停止');
            }, 1000);
        }, timeoutVal * 1000);
    };

    /** 通知 */
    const notification = () => {
        const minute = data.reachCountVal / 60;
        const targetVal = data.reachVal ?? 45;
        if (targetVal === 0) return;
        if (minute % targetVal === 0) {
            // 通知
            console.log('该休息了');
        }
    };

    /** 统计当天的时间 */
    const statisticsCurrentDay = () => {
        if (dayjs().format('HH:mm:ss') !== '00:00:00') return;
        const val = data.time;
        // 按天存储起来 dayjs().format('yyyy-MM-DD HH:mm:ss') val
        reset();
        start();
    };

    /** 开始(需要鼠标或键盘的操作，来不断执行该函数)(开始后会自动附带自动停止函数) */
    const start = () => {
        if (data.status) {
            autoStop();
            return;
        }
        data.status = true;
        data.timeId = setInterval(() => {
            data.time++;
            data.reachCountVal++;
            statisticsCurrentDay();
            setTimeContent();
            notification();
        }, 1000);

        autoStop();
    };

    const stop = () => {
        data.status = false;
        data.reachCountVal = 0;
        data.timeId && clearInterval(data.timeId);
    };

    const reset = () => {
        data.timeId && clearInterval(data.timeId);
        data.status = false;
        data.time = 0;
        data.reachCountVal = 0;
        setTimeContent();
    };

    return (
        <div className="flex f-col f-justify-center f-items-center un-h100vh un-overflow-hidden un-w90% un-m-auto">
            {
                useMemo(() =>
                    <div className="flex f-justify-center f-items-center un-w100% d-select">
                        {
                            config.formatArr.map((str, index) =>
                                <div key={index.toString()} className={`${str === '0' ? 'f-1 un-w0 un-shadow-lg un-shadow-green-500/30 un-bg-green-500 m-10 un-rounded-lg un-overflow-hidden' : ''}`}>
                                    {
                                        str === '0'
                                            ?
                                            <Carousel
                                                ref={(control) => {
                                                    control && config.numberControl.push(control);
                                                }}
                                                dots={false}
                                                dotPosition="left"
                                            >
                                                {
                                                    config.numberArr.map((_, index) =>
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
                    <div>{data.timeoutVal}分钟不操作后，自定停止计时(设置为0不执行该操作)</div>
                    <InputNumber
                        className="un-w150px"
                        value={data.timeoutVal}
                        precision={0}
                        max={15}
                        addonAfter="分钟"
                        onBlur={() => {
                            if (!data.timeoutVal) {
                                data.timeoutVal = 5;
                                void update({});
                            }
                        }}
                        onChange={(e) => {
                            data.timeoutVal = e;
                            void update({});
                        }}
                    />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>计时{data.reachVal}分钟后, 通知休息(只要停止后, 将重新计算)(设置为0不执行该操作)</div>
                    <InputNumber
                        className="un-w150px"
                        value={data.reachVal}
                        precision={0}
                        max={1440}
                        addonAfter="分钟"
                        onBlur={() => {
                            if (!data.reachVal) {
                                data.reachVal = 45;
                                void update({});
                            }
                        }}
                        onChange={(e) => {
                            data.reachVal = e;
                            void update({});
                        }}
                    />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>开机自动计时</div>
                    <Checkbox checked={data.autoStart} onChange={(e) => {
                        data.autoStart = e.target.checked;
                        void update({});
                    }} />
                </div>

                <div className=" flex f-justify-between f-items-center p-t-15">
                    <div>显示悬浮窗</div>
                    <Checkbox checked={data.showFloatWindow} onChange={(e) => {
                        data.showFloatWindow = e.target.checked;
                        void update({});
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