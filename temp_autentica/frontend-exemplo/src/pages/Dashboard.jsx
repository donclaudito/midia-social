import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login');
      return;
    }

    // Valida o token e busca os dados do usuário na API protegida
    fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token inválido ou expirado');
        return res.json();
      })
      .then((data) => {
        if (data.dadosUsuario) {
          setUsuario(data.dadosUsuario);
        } else {
          throw new Error('Dados do usuário não encontrados');
        }
      })
      .catch((err) => {
        localStorage.removeItem('authToken');
        setErro('Sua sessão expirou. Por favor, faça login novamente.');
        setTimeout(() => navigate('/login'), 3000);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-slate-400 font-medium">Carregando seu Dashboard...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-400 backdrop-blur-xl">
          <p className="text-lg font-semibold">{erro}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho do Dashboard */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/50 border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Painel de <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Controle</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Você está autenticado em uma rota protegida por JWT
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 px-6 py-3 text-sm font-semibold text-slate-300 border border-slate-700 transition-all shadow-lg active:scale-95"
          >
            Sair (Logout)
          </button>
        </header>

        {/* Conteúdo Principal (Cartões) */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Cartão do Usuário */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-3xl backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/30">
                {usuario?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Perfil do Usuário</h3>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ativo / Verificado
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/60 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>E-mail cadastrado:</span>
                <span className="font-medium text-slate-200">{usuario?.email}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>ID de Sessão:</span>
                <span className="font-mono text-xs text-cyan-400">{usuario?.id}</span>
              </div>
            </div>
          </div>

          {/* Cartão de Segurança (Token) */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-3xl backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
              Status de Segurança
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O seu Token JWT está armazenado de forma segura no navegador. Todas as requisições futuras para a API utilizarão este token no cabeçalho <code className="text-cyan-300 font-mono">Authorization: Bearer</code>.
            </p>
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 font-mono text-xs text-slate-500 truncate">
              {localStorage.getItem('authToken')}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
