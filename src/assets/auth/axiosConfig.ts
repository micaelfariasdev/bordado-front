import axios from 'axios';

// 1. Crie uma instância do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL! , // Defina o URL base
});

// 2. Adicione um interceptor de requisições
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token do LocalStorage
    const token = localStorage.getItem('authToken');

    // Se o token existir, anexa o cabeçalho de Autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;