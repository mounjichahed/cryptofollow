import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TransactionsPage from './pages/TransactionsPage';
import AlertsPage from './pages/AlertsPage';
import LoginPage from './pages/LoginPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RequireAuth from './components/RequireAuth';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<App />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
            <Route path="/transactions" element={<RequireAuth><TransactionsPage /></RequireAuth>} />
            <Route path="/alerts" element={<RequireAuth><AlertsPage /></RequireAuth>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
