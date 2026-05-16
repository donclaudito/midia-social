# Módulo de Autenticação

Este é um módulo base de autenticação configurado com **Nodemailer** para envio de e-mails via Gmail e **jsonwebtoken (JWT)** para geração de tokens de acesso. 

## Como instalar

Nesta pasta, execute:
```bash
npm install
```

Isso instalará as dependências `nodemailer` e `jsonwebtoken`.

## Como usar

No seu aplicativo, importe o módulo e crie uma instância com suas configurações:

```javascript
const AuthModule = require('./caminho/para/modulo-autenticacao');

const auth = new AuthModule({
  jwtSecret: 'sua_chave_secreta', // Chave para assinar o token
  tokenExpiration: '1h',          // Tempo de expiração
  emailUser: 'seuemail@gmail.com',// Seu email do Gmail
  emailPass: 'sua.senha.de.app',  // Sua senha de app gerada no Google
  siteUrl: 'http://seusite.com'   // URL do seu site para o link
});

// Fluxo 1: Gerar e enviar tudo de uma vez para confirmação de e-mail
auth.registrarEEnviarConfirmacao('cliente@email.com', { id: 123 })
  .then(token => console.log('Token de confirmação gerado e e-mail enviado:', token))
  .catch(err => console.error('Erro:', err));

// Fluxo de Redefinição de Senha
auth.solicitarRedefinicaoSenha('cliente@email.com')
  .then(token => console.log('E-mail de recuperação enviado! Token:', token))
  .catch(err => console.error('Erro:', err));

// Verificar Token (usado tanto na confirmação quanto na redefinição)
const token = auth.gerarToken({ email: 'cliente@email.com', id: 123 });
auth.enviarEmailConfirmacao('cliente@email.com', token);

// Verificar Token
const payload = auth.verificarToken(token);
if (payload) {
  console.log('Token válido!', payload);
} else {
  console.log('Token inválido ou expirado.');
}
```

## Importante sobre o Gmail
Para usar o Gmail, lembre-se que você não pode usar sua senha normal. Você deve:
1. Ativar a "Verificação em duas etapas" na sua conta do Google.
2. Gerar uma "Senha de App" (App Password) e usá-la no campo `emailPass`.
