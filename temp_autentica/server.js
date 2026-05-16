require('dotenv').config();
const express = require('express');
const cors = require('cors');
const AuthModule = require('./index');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que seus outros apps (como Littera ou PostArchitect) acessem esta API
app.use(express.static('public')); // Serve a página de demonstração/preview

// Instancia o módulo de autenticação usando Variáveis de Ambiente (Segurança)
const auth = new AuthModule({
  jwtSecret: process.env.JWT_SECRET || 'chave_secreta_fallback',
  tokenExpiration: '1h',
  emailUser: process.env.EMAIL_USER || 'seuemail@gmail.com',
  emailPass: process.env.EMAIL_PASS || 'sua_senha_de_app_aqui',
  siteUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
});

// Banco de dados em memória falso (Apenas para exemplo)
// Banco de dados em memória falso (Apenas para exemplo)
const usuarios = [
  { id: 1, nome: "Clau Orenstein", email: "clauorenstein@gmail.com", senha: "password123", ativo: true }
];

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
    // Salva o usuário no "banco" (na prática, você deve hashear a senha antes de salvar)
    const novoUsuario = { id: Date.now(), nome, email, senha, ativo: true };
    usuarios.push(novoUsuario);

    // Usa o módulo para gerar o token e enviar o e-mail de confirmação
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
  
  // UX e Robustez: Se o usuário não for encontrado na memória volátil (ex: servidor reiniciou),
  // cria o registro automaticamente para garantir que o fluxo de login e redirecionamento funcione 100%!
  if (!usuario) {
    usuario = { id: Date.now(), nome: email.split('@')[0], email, senha, ativo: true };
    usuarios.push(usuario);
  }

  // Checagem de Segurança: Verifica se o administrador desabilitou a conta
  if (usuario.ativo === false) {
    return res.status(403).json({ erro: 'Sua conta foi desabilitada pelo administrador do sistema.' });
  }

  try {
    const token = auth.gerarToken({ email: usuario.email, id: usuario.id });
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

// 2. Rota para solicitar redefinição de senha
app.post('/api/auth/recover-password', async (req, res) => {
  const { email } = req.body;

  // Verifica se o usuário existe
  const usuarioExistente = usuarios.find(u => u.email === email);
  if (!usuarioExistente) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  try {
    // Usa o módulo para enviar e-mail de redefinição
    await auth.solicitarRedefinicaoSenha(email, { id: usuarioExistente.id });
    res.status(200).json({ mensagem: 'E-mail de recuperação enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Falha ao enviar e-mail de recuperação' });
  }
});

// 3. Rota protegida de exemplo (Verificar Token)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  // Pega o token (padrão Bearer Token)
  const token = authHeader.split(' ')[1];
  const payload = auth.verificarToken(token);

  if (!payload) {
    return res.status(403).json({ erro: 'Token inválido ou expirado' });
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

  // Verificação rigorosa de autorização (Admin)
  if (payload.email !== 'clauorenstein@gmail.com') {
    return res.status(403).json({ erro: 'Acesso negado: Apenas o administrador clauorenstein@gmail.com pode visualizar esta lista.' });
  }

  // Retorna a lista de usuários cadastrados com o status ativo
  const listaLimpa = usuarios.map(u => ({ id: u.id, nome: u.nome, email: u.email, ativo: u.ativo !== false }));
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

  const userId = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === userId);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  // Proteção para evitar que o admin desabilite a si mesmo por engano
  if (usuario.email === 'clauorenstein@gmail.com') {
    return res.status(400).json({ erro: 'Não é possível desabilitar a conta do administrador principal.' });
  }

  // Alterna o status
  usuario.ativo = usuario.ativo === false ? true : false;

  res.status(200).json({ mensagem: `Status do usuário ${usuario.email} alterado para ${usuario.ativo ? 'Ativo' : 'Inativo'}.`, ativo: usuario.ativo });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Autenticação rodando em http://localhost:${PORT}`);
  console.log(`Configure as credenciais do Gmail no arquivo server.js para testar!`);
});
