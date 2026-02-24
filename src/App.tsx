import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Financeiro from './pages/Financeiro';
import Frota from './pages/Frota';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Chat from './pages/Chat';
import CtePage from './pages/CTE';
import { DataProvider } from './contexts/DataContext';

export default function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/cte" element={<CtePage />} />
          <Route path="/frota" element={<Frota />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}
