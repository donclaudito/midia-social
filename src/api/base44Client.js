import { callMistralAI } from "../services/mistralService";

// Mock do SDK do Base44 para rodar 100% local no LocalStorage e usando Mistral API

const getLocalPosts = () => JSON.parse(localStorage.getItem("local_posts") || "[]");
const setLocalPosts = (posts) => localStorage.setItem("local_posts", JSON.stringify(posts));

export const base44 = {
  auth: {
    me: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Token de autenticação não encontrado');
      
      const res = await fetch('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        localStorage.removeItem('authToken');
        throw new Error('Sessão expirada ou token inválido');
      }
      
      const data = await res.json();
      return {
        id: data.dadosUsuario.id || "1",
        name: data.dadosUsuario.nome || data.dadosUsuario.email.split('@')[0],
        email: data.dadosUsuario.email,
        full_name: data.dadosUsuario.nome || data.dadosUsuario.email.split('@')[0],
      };
    },
    logout: () => {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    },
    redirectToLogin: () => {
      window.location.href = '/login';
    },
  },
  entities: {
    Post: {
      create: async (data) => {
        const currentUser = await base44.auth.me();
        const posts = getLocalPosts();
        const newPost = { 
          ...data, 
          id: Date.now().toString(), 
          created_date: new Date().toISOString(),
          user_email: currentUser.email // Vínculo de segurança com o e-mail do usuário
        };
        posts.push(newPost);
        setLocalPosts(posts);
        return newPost;
      },
      update: async (id, data) => {
        const currentUser = await base44.auth.me();
        const posts = getLocalPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index > -1) {
          // Verificação de segurança: garante que o post pertence ao usuário autenticado
          if (posts[index].user_email && posts[index].user_email !== currentUser.email) {
            throw new Error("Acesso negado: Você não tem permissão para alterar dados de outro usuário.");
          }
          posts[index] = { ...posts[index], ...data, user_email: currentUser.email };
          setLocalPosts(posts);
          return posts[index];
        }
        throw new Error("Post not found");
      },
      delete: async (id) => {
        const currentUser = await base44.auth.me();
        const posts = getLocalPosts();
        const post = posts.find(p => p.id === id);
        if (!post) throw new Error("Post not found");
        
        // Verificação de segurança: garante que o post pertence ao usuário autenticado
        if (post.user_email && post.user_email !== currentUser.email) {
          throw new Error("Acesso negado: Você não tem permissão para excluir dados de outro usuário.");
        }
        
        const newPosts = posts.filter(p => p.id !== id);
        setLocalPosts(newPosts);
        return true;
      },
      list: async () => {
        const currentUser = await base44.auth.me();
        const posts = getLocalPosts();
        
        // Migração automática de segurança: vincula posts sem dono ao e-mail do usuário atual
        let modified = false;
        const updatedPosts = posts.map(p => {
          if (!p.user_email) {
            modified = true;
            return { ...p, user_email: currentUser.email };
          }
          return p;
        });
        
        if (modified) {
          setLocalPosts(updatedPosts);
        }

        // Filtro de segurança rigoroso: retorna apenas os posts vinculados ao e-mail do usuário atual
        const userPosts = updatedPosts.filter(p => p.user_email === currentUser.email);
        return userPosts.reverse();
      }
    }
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        try {
          return await callMistralAI(prompt);
        } catch (e) {
          console.error("Mistral API Error (Mock Fallback)", e);
          throw new Error("Falha na geração de IA. Verifique sua Mistral API Key nas configurações.");
        }
      },
      UploadFile: async ({ file }) => {
        // Simular upload de arquivo lendo como base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ file_url: reader.result });
          reader.readAsDataURL(file);
        });
      }
    }
  }
};
