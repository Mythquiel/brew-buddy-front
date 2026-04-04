import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './route/App'
import "./style/base.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./i18n";

import { LoginModalProvider } from "./auth/LoginModalContext";
import { AuthProvider } from "./auth/AuthContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoginModalProvider>
          <App />
        </LoginModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)