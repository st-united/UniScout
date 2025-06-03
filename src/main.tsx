import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AuthProvider } from '@app/contexts/AuthContext';
import { UniversityProvider } from './components/contexts/UniversityContext';
import './main.scss';
import { I18nextProvider } from 'react-i18next';
import i18n from '@app/config/i18n';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);

  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <UniversityProvider>
            <RouterProvider router={router} />
          </UniversityProvider>
        </AuthProvider>
      </I18nextProvider>
    </StrictMode>,
  );
} else {
  console.error("Root element with ID 'root' not found!");
}
