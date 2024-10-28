import { useStateExtend } from '@web/hooks';
import { List, Popover, Tooltip } from 'antd';
import { FC, ReactNode, useEffect } from 'react';

export const LogButton: FC<ILogButtonProps> = ({
    children,
}) => {
    const [arr, setArr,] = useStateExtend<string[]>([]);
    useEffect(() => {
        window.onTimerUpdate((_, { time, status, autoStart, logArr, }) => {
            void setArr(logArr);
        });
    }, []);


    return (
        <Popover
            content={
                <List
                    className="un-h200px un-overflow-auto"
                    bordered
                    dataSource={arr}
                    renderItem={(item) =>
                        <List.Item>{item}</List.Item>
                    }
                />
            }
            placement="leftTop"
            title="计时从零开始, 但总计时间还记录着"
            arrow={false}
        >
            {children}
        </Popover>
    );
};

interface ILogButtonProps {
    children: ReactNode;
}
