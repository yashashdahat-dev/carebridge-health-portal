/**
 * CareBridge — React Application Entry Point
 * File: src/main.jsx
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CareBridgeProvider } from './context/CareBridgeContext.jsx';
import './styles.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CareBridgeProvider>
        <App />
      </CareBridgeProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to locate root element #root in document.');
}
