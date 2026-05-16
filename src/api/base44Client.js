import { callMistralAI } from "../services/mistralService";

// Mock do SDK do Base44 para rodar 100% local no LocalStorage e usando Mistral API

const getLocalPosts = () => JSON.parse(localStorage.getItem("local_posts") || "[]");
const setLocalPosts = (posts) => localStorage.setItem("local_posts", JSON.stringify(posts));

export const base44 = {
  auth: {
    me: async () => ({ id: "1", name: "Usuário Local", email: "local@example.com" }),
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Post: {
      create: async (data) => {
        const posts = getLocalPosts();
        const newPost = { ...data, id: Date.now().toString(), created_date: new Date().toISOString() };
        posts.push(newPost);
        setLocalPosts(posts);
        return newPost;
      },
      update: async (id, data) => {
        const posts = getLocalPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index > -1) {
          posts[index] = { ...posts[index], ...data };
          setLocalPosts(posts);
          return posts[index];
        }
        throw new Error("Post not found");
      },
      delete: async (id) => {
        const posts = getLocalPosts();
        const newPosts = posts.filter(p => p.id !== id);
        setLocalPosts(newPosts);
        return true;
      },
      list: async () => {
        const posts = getLocalPosts();
        return posts.reverse(); // Retorna o array diretamente como AllPosts e Dashboard esperam
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
