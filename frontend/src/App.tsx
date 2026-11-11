/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { BackendStatusProvider } from './context/BackendStatusContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <BackendStatusProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BackendStatusProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}
