import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import * as serviceWorkerRegistration from '../serviceWorkerRegistration';  // Импорт регистрации Service Worker
// import reportWebVitals from './reportWebVitals';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
// Зарегистрировать Service Worker для PWA
serviceWorkerRegistration.register();

// Отслеживание производительности
// reportWebVitals();