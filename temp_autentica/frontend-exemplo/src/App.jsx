import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterForm from '../RegisterForm.jsx';
import ConfirmarEmail from './pages/ConfirmarEmail.jsx';
import LoginForm from './pages/LoginForm.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterForm />} />
        <Route path="/confirmar" element={<ConfirmarEmail />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
