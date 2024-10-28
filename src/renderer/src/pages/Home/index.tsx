import { EllipsisOutlined, LineOutlined, MinusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { TimeModule } from '@web/components/TimeModule';
import { useBaseDataStore } from '@web/store';
import { Button, Checkbox, InputNumber, Tooltip } from 'antd';
import { useMemo } from 'react';
import logo from '../../../../../resources/logo.svg?asset';
import { LogButton } from '@web/components/LogButton';

const Home = () => {
    const stateStore = useBaseDataStore();

    return (
        <div className="p-10 flex f-col un-box-border">
            <div
                style={{ boxShadow: '0 0 2px 1px #bfbfbf9e', }}
                className="un-overflow-hidden rel flex f-col f-justify-center f-items-center un-h100vh un-m-auto bg-f un-rounded-lg un-h0 f-1 un-w100% p-30 un-box-border"
            >
                <div className="un-h30px"></div>
                <div className="abs un-top--1px un-w100% text-right flex">
                    <Button.Group className="un-w100%" style={{ boxShadow: '0 1px 4px 0 #cfcfcf8f', }}>
                        <Button title="拖动" style={{ borderBottomLeftRadius: 0, borderLeft: 0, WebkitAppRegion: 'drag', } as never} className="f-1 f-justify-start">
                            <img src={logo}/>
                            计时器
                        </Button>
                        <Button title="最小化" style={{ borderBottomRightRadius: 0, borderRight: 0, width: 50, }} icon={<LineOutlined />} onClick={window.mainWindowMinimize}></Button>
                    </Button.Group>
                </div>
                { useMemo(() => <TimeModule/>, []) }
                {/* <Link to="/FloatWin">FloatWin</Link> */}
                <div className="un-w100% p-10 flex f-justify-between f-items-center m-y-30">
                    <div className="un-text-26px un-font-bold">操作</div>
                    <div className="flex un-gap10px">
                        <LogButton>
                            <Button onClick={window.timerResetZero}>
                                置零
                                <QuestionCircleOutlined />
                            </Button>
                        </LogButton>
                        {/* <Button disabled={stateStore.data.autoStart} onClick={window.timerReset}>重置</Button>
                        <Button disabled={stateStore.data.autoStart} color="default" variant="solid" onClick={window.timerStop}>停止</Button>
                        <Button disabled={stateStore.data.autoStart} type="primary" onClick={window.timerStart}>开始</Button> */}
                    </div>
                </div>
                <div className="un-w100% p-10 m-y-30">
                    <div className="un-text-26px un-font-bold">设置</div>
                    {/* <div className=" flex f-justify-between f-items-center p-t-15">
                        <div>开启自动计时(开启后,禁止操作)</div>
                        <Checkbox checked={stateStore.data.autoStart} onChange={(e) => {
                            stateStore.updateAssignKey('autoStart', e.target.checked);
                        }} />
                    </div> */}
                    <div className=" flex f-justify-between f-items-center p-t-15">
                        <div>{stateStore.data.timeoutVal}分钟不操作后，自定停止计时(设置为0不执行该操作)(需要开启自动计时)</div>
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
                        <div>开机启动</div>
                        <Checkbox checked={stateStore.data.autoLaunch} onChange={(e) => {
                            stateStore.updateAssignKey('autoLaunch', e.target.checked);
                        }} />
                    </div>
                    <div className=" flex f-justify-between f-items-center p-t-15">
                        <div>显示悬浮窗</div>
                        <Checkbox checked={stateStore.data.showFloatWindow} onChange={(e) => {
                            stateStore.updateAssignKey('showFloatWindow', e.target.checked);
                        }} />
                    </div>
                </div>
                <div className="un-w100% p-10 flex f-justify-between f-items-center m-t-30">
                    <div className="un-text-26px un-font-bold">统计</div>
                    <Button color="default" variant="solid">待开发</Button>
                    {/* <Button color="default" variant="solid">查看</Button> */}
                </div>
            </div>
        </div>
    );
};

export default Home;