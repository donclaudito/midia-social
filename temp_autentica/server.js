require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const AuthModule = require('./index');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que seus outros apps acessem esta API
app.use(express.static('public')); // Serve a página de demonstração/preview

// Instancia o módulo de autenticação usando Variáveis de Ambiente (Segurança)
const auth = new AuthModule({
  jwtSecret: process.env.JWT_SECRET || 'chave_secreta_fallback',
  tokenExpiration: '1h',
  emailUser: process.env.EMAIL_USER || 'seuemail@gmail.com',
  emailPass: process.env.EMAIL_PASS || 'sua_senha_de_app_aqui',
  siteUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
});

const usuariosFilePath = path.join(__dirname, 'usuarios.json');

// Carrega usuários do arquivo ou inicializa com o administrador principal
let usuarios = [];
try {
  if (fs.existsSync(usuariosFilePath)) {
    usuarios = JSON.parse(fs.readFileSync(usuariosFilePath, 'utf8'));
  } else {
    usuarios = [
      { id: 1, nome: "Clau Orenstein", email: "clauorenstein@gmail.com", senha: "password123", ativo: true }
    ];
    fs.writeFileSync(usuariosFilePath, JSON.stringify(usuarios, null, 2), 'utf8');
  }
} catch (err) {
  console.error('Erro ao carregar usuarios.json, usando padrão na memória:', err);
  usuarios = [
    { id: 1, nome: "Clau Orenstein", email: "clauorenstein@gmail.com", senha: "password123", ativo: true }
  ];
}

const salvarUsuarios = () => {
  try {
    fs.writeFileSync(usuariosFilePath, JSON.stringify(usuarios, null, 2), 'utf8');
  } catch (err) {
    console.error('Erro ao salvar usuarios.json:', err);
  }
};

// Set para rastrear usuários online (IDs) em tempo real
const onlineUsers = new Set();

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// 1. Rota de Cadastro / Confirmação
app.post('/api/auth/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  try {
    const novoUsuario = { id: Date.now(), nome, email, senha, ativo: true };
    usuarios.push(novoUsuario);
    salvarUsuarios(); // Persiste no arquivo

    const token = await auth.registrarEEnviarConfirmacao(email, { id: novoUsuario.id });
    
    res.status(201).json({ 
      mensagem: 'Usuário registrado com sucesso! Verifique seu e-mail.', 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Falha ao registrar ou enviar e-mail de confirmação' });
  }
});

// 1.5. Rota de Login
app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
  }

  let usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
  if (!usuario) {
    usuario = { id: Date.now(), nome: email.split('@')[0], email, senha, ativo: true };
    usuarios.push(usuario);
    salvarUsuarios(); // Persiste no arquivo
  }

  if (usuario.ativo === false) {
    return res.status(403).json({ erro: 'Sua conta foi desabilitada pelo administrador do sistema.' });
  }

  try {
    const token = auth.gerarToken({ email: usuario.email, id: usuario.id });
    onlineUsers.add(usuario.id);

    res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao gerar token de login' });
  }
});

// 1.6. Rota de Logout (limpa a sessão online)
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });
  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);
  if (payload && payload.id) {
    onlineUsers.delete(payload.id);
  }
  res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
});

// 2. Rota para solicitar redefinição de senha
app.post('/api/auth/recover-password', async (req, res) => {
  const { email } = req.body;

  const usuarioExistente = usuarios.find(u => u.email === email);
  if (!usuarioExistente) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  try {
    await auth.solicitarRedefinicaoSenha(email, { id: usuarioExistente.id });
    res.status(200).json({ mensagem: 'E-mail de recuperação enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Falha ao enviar e-mail de recuperação' });
  }
});

// 3. Rota protegida de exemplo (Verificar Token e Atualizar Status Online)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);

  if (!payload) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }

  if (payload.id) {
    onlineUsers.add(payload.id);
  }

  res.status(200).json({
    mensagem: 'Token válido',
    dadosUsuario: payload
  });
});

// 4. Rota de Administração (Listar todos os usuários) - Apenas clauorenstein@gmail.com
app.get('/api/auth/users', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);

  if (!payload) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
  }

  if (payload.email !== 'clauorenstein@gmail.com') {
    return res.status(403).json({ erro: 'Acesso negado: Apenas o administrador clauorenstein@gmail.com pode visualizar esta lista.' });
  }

  const listaLimpa = usuarios.map(u => ({ 
    id: u.id, 
    nome: u.nome, 
    email: u.email, 
    ativo: u.ativo !== false,
    online: onlineUsers.has(u.id)
  }));
  res.status(200).json(listaLimpa);
});

// 5. Rota de Administração (Alternar status ativo/inativo de um usuário) - Apenas clauorenstein@gmail.com
app.patch('/api/auth/users/:id/toggle-status', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);

  if (!payload || payload.email !== 'clauorenstein@gmail.com') {
    return res.status(403).json({ erro: 'Acesso negado: Apenas o administrador clauorenstein@gmail.com pode realizar esta ação.' });
  }

  const usuario = usuarios.find(u => u.id.toString() === req.params.id.toString());

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  if (usuario.email === 'clauorenstein@gmail.com') {
    return res.status(400).json({ erro: 'Não é possível desabilitar a conta do administrador principal.' });
  }

  usuario.ativo = usuario.ativo === false ? true : false;
  if (!usuario.ativo) {
    onlineUsers.delete(usuario.id); // Se desativado, remove dos online
  }
  salvarUsuarios(); // Persiste no arquivo

  res.status(200).json({ mensagem: `Status do usuário ${usuario.email} alterado para ${usuario.ativo ? 'Ativo' : 'Inativo'}.`, ativo: usuario.ativo });
});

// 6. Rota de Administração (Excluir usuário) - Apenas clauorenstein@gmail.com
app.delete('/api/auth/users/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);

  if (!payload || payload.email !== 'clauorenstein@gmail.com') {
    return res.status(403).json({ erro: 'Acesso negado: Apenas o administrador clauorenstein@gmail.com pode realizar esta ação.' });
  }

  const index = usuarios.findIndex(u => u.id.toString() === req.params.id.toString());

  if (index === -1) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  if (usuarios[index].email === 'clauorenstein@gmail.com') {
    return res.status(400).json({ erro: 'Não é possível excluir a conta do administrador principal.' });
  }

  const usuarioRemovido = usuarios.splice(index, 1)[0];
  onlineUsers.delete(usuarioRemovido.id);
  salvarUsuarios(); // Persiste no arquivo

  res.status(200).json({ mensagem: `Usuário ${usuarioRemovido.email} excluído com sucesso.` });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Autenticação rodando em http://localhost:${PORT}`);
  console.log(`💾 Persistência ativada: usuarios.json`);
});
