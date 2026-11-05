import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { Router } from 'wouter';
import { App } from './App';

const container = document.getElementById('root');
if (!container) throw new Error('falta #root en el documento');

const app = (
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);

if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
