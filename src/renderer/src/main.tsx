import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { CustomRouter } from './router';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import '@unocss/reset/eric-meyer.css';
import 'virtual:uno.css';

void (() => {
    dayjs.extend(duration);
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <RouterProvider router={CustomRouter.getInstance().router!}/>
        </StrictMode>
    );
})();
