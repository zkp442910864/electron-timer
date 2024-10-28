import { RedoOutlined } from '@ant-design/icons';
import { TimeModule } from '@web/components/TimeModule';
import { Button } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import logo from '../../../../../resources/logo.svg?asset';
import { LogButton } from '@web/components/LogButton';

const FloatWin = () => {

    // useEffect(() => {
    //     window.onTimerUpdate((_, { time, status, autoStart, }) => {
    //     });
    // }, []);

    return (
        <div className="">
            <div
                className="p-4 un-box-border un-m-auto"
                style={{ width: 230, height: 50, } as never}
                // onMouseEnter={() => {
                //     // console.log('onMouseEnter');
                //     window.setIgnoreMouseEvents(false);
                // }}
                // onMouseLeave={() => {
                //     // console.log('onMouseLeave');
                //     window.setIgnoreMouseEvents(true);
                // }}
            >
                <div
                    className="un-overflow-hidden rel un-box-border p-x-6 p-y-4 un-h100% un-w100% flex f-justify-center f-items-center un-m-auto un-gap6px"
                    style={{ background: '#fff', boxShadow: '0 0 2px 1px #bfbfbf9e', borderRadius: 6, }}
                >
                    <div className="un-w32px"></div>
                    <Button
                        className="abs un-top-0 un-left-0 un-h100% color-gray"
                        size="small"
                        style={{ WebkitAppRegion: 'drag', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderWidth: 0, borderRightWidth: 1, width: 30, } as never}
                    >
                        <img src={logo}/>
                    </Button>
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
                    <Button
                        shape="circle"
                        type="primary"
                        size="small"
                        danger={true}
                        title="置零"
                        icon={<RedoOutlined />}
                        onClick={() => {
                            window.timerResetZero();
                        }}
                    />
                    {/* <LogButton>
                        <Button
                            shape="circle"
                            type="primary"
                            size="small"
                            danger={true}
                            title="置零"
                            icon={<RedoOutlined />}
                            onClick={() => {
                                window.timerResetZero();
                            }}
                        />
                    </LogButton> */}

                </div>
            </div>
        </div>
    );
};

export default FloatWin;
