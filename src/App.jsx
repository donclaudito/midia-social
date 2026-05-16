import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import AllPosts from '@/pages/AllPosts';
import AIPostGenerator from '@/pages/AIPostGenerator';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ConfirmarEmail from '@/pages/ConfirmarEmail';

const LoadingFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirmar" element={<ConfirmarEmail />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute fallback={<LoadingFallback />} unauthenticatedElement={<Navigate to="/login" replace />} />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/posts" element={<AllPosts />} />
                <Route path="/gerar" element={<AIPostGenerator />} />
              </Route>
            </Route>

            {/* Página não encontrada */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;