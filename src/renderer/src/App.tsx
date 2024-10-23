import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Outlet } from 'react-router-dom';
import 'dayjs/locale/zh-cn';

const App = () => {

    return (
        <ConfigProvider locale={zhCN}>
            <Outlet />
        </ConfigProvider>
    );
};

export default App;