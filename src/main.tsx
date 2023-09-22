import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './limited.css';

import 'mana-font/css/mana.min.css';

import { ThemeProvider } from '@emotion/react';
import materialUITheme from './materialUITheme';
import CustomBrowserRouter from './CustomBrowserRouter.tsx';
import AuthProvider from './AuthContext.tsx';
import { Analytics } from '@vercel/analytics/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={materialUITheme}>
      <AuthProvider>
        <Analytics />
        <Suspense fallback={null}>
          <CustomBrowserRouter />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
