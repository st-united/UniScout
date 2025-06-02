import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { UniversityProvider } from './contexts/UniversityContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UniversityProvider>
          <App />
        </UniversityProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);