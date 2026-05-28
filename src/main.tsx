import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
);
