import { app, shell, BrowserWindow, ipcMain, Menu, Tray, screen } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/logo-ico.ico?asset';
import { KeyboardMouse } from './modules/keyboardMouse';
import { GlobalDataStore } from './modules/globalDataStore';
import { Timer } from './modules/timer';


class Main {

    isBoxDev = is.dev;
    // isBoxDev = false;
    mainWindow: InstanceType<typeof BrowserWindow> | null = null;
    floatWindow: InstanceType<typeof BrowserWindow> | null = null;
    keyboardMouseInstance = KeyboardMouse.getInstance(() => {
        this.timer.start();
    });
    storeInstance = GlobalDataStore.getInstance((key, value) => {
        if (key === 'autoStart') {
            value ? this.keyboardMouseInstance.start() : this.keyboardMouseInstance.kill();
        }
        else if (key === 'autoLaunch') {
            app.setLoginItemSettings({
                openAtLogin: value as boolean,
            });
        }
        else if (key === 'showFloatWindow') {
            if (value) {
                this.createFloatWindow();
            }
            else {
                if (this.floatWindow) {
                    this.floatWindow.close();
                    this.floatWindow = null;
                }
            }
        }
    });
    timer = new Timer();


    constructor() {
        // 这段程序将会在 Electron 结束初始化
        // 和创建浏览器窗口的时候调用
        // 部分 API 在 ready 事件触发后才能使用。
        void app.whenReady().then(() => {
            // 为windows设置应用用户模型id
            electronApp.setAppUserModelId('com.electron.timer');

            this.storeInstance.register();

            this.createMainWindow();

            this.appEvent();
        });


        // 在当前文件中你可以引入所有的主进程代码
        // 也可以拆分成几个文件，然后用 require 导入。
    }

    createMainWindow() {
        // 创建浏览器窗口。
        const mainWindow = this.mainWindow = new BrowserWindow({
            ...this.isBoxDev
                ? { width: 1430, height: 1000, autoHideMenuBar: false, }
                : { width: 900, height: 800, resizable: false, autoHideMenuBar: true, frame: false, transparent: true, },
            show: false,
            title: '计时器',
            icon,
            webPreferences: {
                preload: join(__dirname, '../preload/index.mjs'),
                sandbox: false,
                // contextIsolation: true,
                // nodeIntegration: false,
            },
        });

        this.createTray();
        this.disableTitleBarMenu(mainWindow);
        this.timer.sendTime(mainWindow);

        mainWindow.on('ready-to-show', () => {
            // mainWindow.show();

            ipcMain.on('mainWindowMinimize', () => {
                mainWindow?.minimize();
            });

            if (this.storeInstance.storeGet('autoStart')) {
                this.keyboardMouseInstance.start();
            }

            if (this.storeInstance.storeGet('showFloatWindow')) {
                this.createFloatWindow();
            }
        });

        // mainWindow.webContents.setWindowOpenHandler((details) => {
        //     void shell.openExternal(details.url);
        //     return { action: 'deny', };
        // });

        // 基于electron-vite cli的渲染器的HMR。
        // 加载用于开发的远程URL或用于生产的本地html文件。
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
            mainWindow.webContents.openDevTools();
        }
        else {
            void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
            // 指定路由
            // void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: 'home' })
        }
    }

    createFloatWindow() {
        const floatWindow = this.floatWindow = new BrowserWindow({
            ...this.isBoxDev
                ? { width: 240, height: 126, autoHideMenuBar: false, }
                : { width: 210, height: 50, resizable: false, autoHideMenuBar: true, frame: false, transparent: true, alwaysOnTop: true, },
            show: false,
            title: '计时器浮窗',
            icon,
            // trafficLightPosition: {
            //     x: 0,
            //     y: 0,
            // },
            webPreferences: {
                preload: join(__dirname, '../preload/index.mjs'),
                sandbox: false,
                // contextIsolation: true,
                // nodeIntegration: false,
            },
        });

        this.timer.sendTime(floatWindow);
        this.disableTitleBarMenu(floatWindow);
        floatWindow.setSkipTaskbar(true);

        floatWindow.setPosition(screen.getPrimaryDisplay().workAreaSize.width / 2 - 120, 50);


        floatWindow.on('ready-to-show', () => {
            floatWindow.show();
        });

        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            void floatWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/FloatWin');
            // floatWindow.webContents.openDevTools();
        }
        else {
            // void floatWindow.loadFile(join(__dirname, '../renderer/index.html'));
            // 指定路由
            void floatWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'FloatWin', });
        }
    }

    /** app 的监听事件 */
    appEvent() {
        // 默认在开发中由F12打开或关闭DevTools
        // 并忽略生产中的CommandOrControl R。
        // 参见 https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
        app.on('browser-window-created', (_, window) => {
            optimizer.watchWindowShortcuts(window);
        });


        // 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
        // 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
        // 直到用户使用 Cmd + Q 明确退出
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.keyboardMouseInstance.kill();
                app.quit();
            }
        });

        app.on('activate', () => {
            // 在 macOS 系统内, 如果没有已开启的应用窗口
            // 点击托盘图标时通常会重新创建一个新窗口
            if (BrowserWindow.getAllWindows().length === 0) this.createMainWindow();
        });
    }

    /** 创建任务栏托盘 */
    createTray() {
        const mainWindow = this.mainWindow!;
        if (process.platform === 'win32') {
            let isExit = false;

            //系统托盘图标
            const appTray = new Tray(icon);
            //设置托盘图标和菜单
            const trayMenuTemplate = [
                {
                    label: '打开',
                    click: () => {
                        mainWindow.setSkipTaskbar(false);
                        mainWindow.show();
                    },
                },
                {
                    label: '退出',
                    click: () => {
                        isExit = true;
                        this.keyboardMouseInstance.kill();
                        mainWindow.close();
                        if (this.floatWindow) {
                            this.floatWindow.close();
                            this.floatWindow = null;
                        }
                    },
                },
            ];

            // 设置此托盘图标的悬停提示内容
            appTray.setToolTip('计时器');

            // 设置此图标的上下文菜单
            appTray.setContextMenu(Menu.buildFromTemplate(trayMenuTemplate));

            // 单击右下角小图标显示应用左键
            appTray.on('click', function () {
                mainWindow.setSkipTaskbar(false);
                mainWindow.show();
            });

            //右键
            appTray.on('right-click', () => {
                appTray.popUpContextMenu();
            });

            mainWindow.on('minimize', () => {
                mainWindow.setSkipTaskbar(true); // 取消任务栏显示
            });

            mainWindow.on('close', (e) => {
                if (!isExit) {
                    e.preventDefault(); // 阻止退出程序
                    mainWindow.setSkipTaskbar(true); // 取消任务栏显示
                    mainWindow.hide(); // 隐藏主程序窗口
                }
            });
        };
    }

    /** 禁止标题栏右键菜单 */
    disableTitleBarMenu(win: BrowserWindow) {
        win.hookWindowMessage(278, (e) => {
            win.setEnabled(false);
            setTimeout(() => {
                win.setEnabled(true);
            }, 100);
            return true;
        });
    }
}


new Main();