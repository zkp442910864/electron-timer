import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import UnoCSS from 'unocss/vite';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

// https://cn.electron-vite.org/guide/
export default defineConfig(({ command, mode, }) => ({
    renderer: {
        plugins: [
            react(),
            UnoCSS(),
        ],
        resolve: {
            alias: [
                { find: '@', replacement: resolve('./src/renderer/src'), },
            ],
        },
        server: {
            host: true,
            port: 6573,
        },
    },
    main: {
        plugins: [externalizeDepsPlugin(),],
    },
    preload: {
        plugins: [externalizeDepsPlugin(),],
    },
}));
