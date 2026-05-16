import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, PowerOff, CheckCircle2, Circle } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moduleEnabled, setModuleEnabled] = useState(() => {
    return localStorage.getItem('admin_module_enabled') !== 'false';
  });
  const [filter, setFilter] = useState('all'); // all | active | inactive | online | offline

  const toggleModule = () => {
    const newState = !moduleEnabled;
    setModuleEnabled(newState);
    localStorage.setItem('admin_module_enabled', newState.toString());
    if (!newState) {
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const toggleUserStatus = (userId) => {
    const token = localStorage.getItem('authToken');
    fetch(`http://localhost:3000/api/auth/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao alterar status do usuário.');
        return res.json();
      })
      .then((data) => {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ativo: data.ativo } : u))
        );
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (moduleEnabled && user?.email === 'clauorenstein@gmail.com') {
      const token = localStorage.getItem('authToken');
      fetch('http://localhost:3000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Acesso negado ou token expirado.');
          return res.json();
        })
        .then((data) => {
          setUsersList(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, moduleEnabled]);

  // Restrição: somente admin
  if (user?.email !== 'clauorenstein@gmail.com') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-rose-400 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-300 mb-6">
            Esta página é exclusiva para o administrador (<span className="font-semibold text-white">clauorenstein@gmail.com</span>).
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3 font-semibold text-slate-200 transition border border-slate-700 active:scale-95"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Módulo desativado
  if (!moduleEnabled) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <PowerOff className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">Módulo Desabilitado</h2>
          <p className="text-sm text-slate-300 mb-6">
            A visualização de usuários foi desabilitada.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={toggleModule}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition active:scale-95"
            >
              Reabilitar Módulo Admin
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3 font-semibold text-slate-200 transition border border-slate-700 active:scale-95"
            >
              Ir ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtragem de usuários
  const filteredUsers = usersList.filter((u) => {
    switch (filter) {
      case 'active':
        return u.ativo === true;
      case 'inactive':
        return u.ativo === false;
      case 'online':
        return u.online === true;
      case 'offline':
        return u.online === false;
      default:
        return true;
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Administração de Usuários
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Acesso exclusivo: <span className="text-indigo-300 font-medium">{user.email}</span>
            </p>
          </div>
        </div>
        <button
          onClick={toggleModule}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10 font-semibold text-sm group active:scale-95"
        >
          <PowerOff className="w-4 h-4 transition-transform group-hover:rotate-12" />
          Desabilitar Módulo Admin
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-400 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1 rounded ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-1 rounded ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          Ativos
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-1 rounded ${filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          Inativos
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`px-4 py-1 rounded ${filter === 'online' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          Online
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={`px-4 py-1 rounded ${filter === 'offline' ? 'bg-gray-600 text-white' : 'bg-slate-700 text-slate-200'}`}
        >
          Offline
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Usuários Cadastrados ({filteredUsers.length})
          </h2>
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Atualizado em tempo real
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Carregando lista...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Nenhum usuário encontrado com o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Nome</th>
                  <th className="py-4 px-6">E-mail</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Conexão</th>
                  <th className="py-4 px-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-slate-500">{u.id}</td>
                    <td className="py-4 px-6 font-medium text-white">{u.nome || '—'}</td>
                    <td className="py-4 px-6 text-indigo-300">{u.email}</td>
                    <td className="py-4 px-6">
                      {u.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          Desabilitado
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.online ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.email !== 'clauorenstein@gmail.com' ? (
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all border shadow-sm active:scale-95 ${
                            u.ativo
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {u.ativo ? 'Desabilitar Acesso' : 'Habilitar Acesso'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Admin Principal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
