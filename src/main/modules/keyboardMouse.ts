import treeKill from 'tree-kill';
import pyExe from '../../../resources/keyboard_mouse.exe?asset';
import { spawn } from 'child_process';


export class KeyboardMouse {
    private static instance: KeyboardMouse;

    private callback: () => void;
    private count = 0;
    private pythonProcess: ReturnType<typeof spawn> | null = null;

    static getInstance(cb?: () => void) {
        if (!KeyboardMouse.instance) {
            if (!cb) {
                throw new Error('第一次实例化，需要传入参数');
            }
            KeyboardMouse.instance = new KeyboardMouse(cb);
        }

        return KeyboardMouse.instance;
    }

    private constructor(cb: () => void) {
        this.callback = cb;
    }

    start() {
        if (this.pythonProcess) return;
        this.pythonProcess = spawn(pyExe);

        // 监听 Python 进程的输出，获取键盘事件
        this.pythonProcess.stdout!.on('data', (data) => {
            // const event = JSON.parse(data.toString());
            console.log('keyboard_mouse: ' + ++this.count);
            this.callback();
        });
    }

    kill() {
        if (this.pythonProcess) {
            // process.kill(this.pythonProcess.pid!, 'SIGTERM');
            treeKill(this.pythonProcess.pid!, 'SIGKILL', (err) => {
                if (err) {
                    console.error('Failed to kill process:', err);
                }
                else {
                    console.log('Process killed successfully');
                    this.pythonProcess = null;
                }
            });
        }
    }

    restart() {
        this.kill();
        this.start();
    }
}
