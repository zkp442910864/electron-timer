import { Spin } from 'antd';

export const Loading = () => {
    return (
        <div className="un-w100vw un-h100vh flex f-items-center f-justify-center">
            <Spin size="large" />
        </div>
    );
};
