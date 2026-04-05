import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { SpeedInsights } from "@vercel/speed-insights/react"
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <SpeedInsights />
  </StrictMode>,
);
