import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { CustomRouter } from './router';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';

void (() => {

    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <RouterProvider router={CustomRouter.getInstance().router!}/>
        </StrictMode>
    );
})();
