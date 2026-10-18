import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import './styles/components.css';
import './styles/phase4.css';
import App from './app/App.jsx';
import { SmoothScroll } from './app/SmoothScroll.jsx';
import { CompareProvider, EnquiryProvider } from './app/stores.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <EnquiryProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </EnquiryProvider>
      </SmoothScroll>
    </BrowserRouter>
  </StrictMode>,
);
