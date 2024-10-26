import { Carousel } from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import dayjs from 'dayjs';
import React, { FC, useEffect, useRef } from 'react';

export const TimeModule: FC<ITimeModuleProps> = ({
    height = 160,
    textSize = 56,
    carouselWrapStyle = {},
    colonStyle = {},
}) => {
    const { current: cache, } = useRef({
        prevTimeStr: '',
        /** 格式 */
        formatArr: '00:00:00'.split(''),
        /** 展示数值 */
        numberArr: new Array(10).fill(''),
        numberControl: [] as CarouselRef[],
    });

    /** 设置展示 */
    const setTimeContent = (time: number) => {
        const timeStr = dayjs.duration(time, 'seconds').format('HH:mm:ss');
        const arr = timeStr.split('').filter(ii => ii !== ':');

        if (cache.prevTimeStr === timeStr) return;
        cache.prevTimeStr = timeStr;

        arr.forEach((val, index) => {
            cache.numberControl[index].goTo(+val);
        });
    };

    useEffect(() => {
        window.onTimerUpdate((_, { time, status, }) => {
            setTimeContent(time);
        });
    }, []);

    return (
        <div className="flex f-justify-center f-items-center un-w100% d-select">
            {
                cache.formatArr.map((str, index) =>
                    <div
                        key={index.toString()}
                        className={`${str === '0' ? 'f-1 un-w0 un-shadow-lg m-10 un-shadow-green-500/30 un-bg-green-500 un-rounded-lg un-overflow-hidden' : ''}`}
                        style={carouselWrapStyle}
                    >
                        {
                            str === '0'
                                ?
                                <Carousel
                                    ref={(control) => {
                                        control && cache.numberControl.push(control);
                                    }}
                                    dots={false}
                                    dotPosition="left"
                                >
                                    {
                                        cache.numberArr.map((_, index) =>
                                            <div key={index.toString()} className="text-center un-text-white">
                                                <div style={{ lineHeight: height + 'px', fontSize: textSize, }}>{index}</div>
                                            </div>
                                        )
                                    }
                                </Carousel>
                                : <div className="text-center p-10 un-text-gray-200 un-text-46px" style={colonStyle}>:</div>
                        }
                    </div>
                )
            }
        </div>
    );
};

interface ITimeModuleProps {
    /**
     * 高度
     * @default 160
     */
    height?: number;
    /**
     * 文字大小
     * @default 56
     */
    textSize?: number;
    carouselWrapStyle?: React.CSSProperties;
    colonStyle?: React.CSSProperties;
}
