import { MenuOutlined, MoreOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { TimeModule } from '@web/components/TimeModule';
import { useStateExtend } from '@web/hooks';
import { useBaseDataStore } from '@web/store';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';

const FloatWin = () => {
    const [status, setStatus,] = useStateExtend(false);
    const [autoStart, setAutoStart,] = useStateExtend(false);

    useEffect(() => {
        window.onTimerUpdate((_, { time, status, autoStart, }) => {
            void setStatus(status);
            void setAutoStart(autoStart);
        });
    }, []);

    return (
        <div className="p-4 un-box-border" style={{ width: 210, height: 50, } as never}>
            <div
                className="un-overflow-hidden rel un-box-border p-x-6 p-y-4 un-h100% un-w100% flex f-justify-center f-items-center un-m-auto un-gap6px"
                style={{ background: '#fff', boxShadow: '0 0 2px 1px #bfbfbf9e', borderRadius: 6, }}
            >
                <div className="un-w18px"></div>
                <Button
                    className="abs un-top-0 un-left-0 un-h100% color-gray"
                    icon={<MoreOutlined />}
                    size="small"
                    style={{ WebkitAppRegion: 'drag', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderWidth: 0, borderRightWidth: 1, width: 20, } as never}
                />
                {
                    useMemo(() =>
                        <TimeModule
                            height={26}
                            textSize={14}
                            carouselWrapStyle={{
                                margin: 1,
                            }}
                            colonStyle={{
                                padding: 2,
                                fontSize: 12,
                            }}
                        />, [])
                }
                {/* <Button>开始</Button> */}
                {
                    !autoStart &&
                    <Button
                        shape="circle"
                        type="primary"
                        size="small"
                        danger={status}
                        icon={status ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={() => {
                            status ? window.timerStop() : window.timerStart();
                        }}
                    />
                }
            </div>
        </div>
    );
};

export default FloatWin;
