import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

import api from './assets/auth/axiosConfig';

const LOGIN_URL = "auth/login";

interface LoginForm {
  username: string;
  senha: string;
}

interface LoginResponse {
  token: string;
}


const LoginPage: React.FC = () => {
  const [form, setForm] = useState<LoginForm>({ username: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!form.username.trim() || !form.senha.trim()) {
      setError("Por favor, preencha o nome de usuário e a senha.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post<LoginResponse>(LOGIN_URL, form);

      const token = response.data.token;
      localStorage.setItem('authToken', token);

      setSuccess(true);

      window.location.href = "/login";


    } catch (err) {
      let errorMessage = "Erro desconhecido. Tente novamente.";



      setError(errorMessage);
      localStorage.removeItem('authToken'); // Garante que não há token inválido

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Acesso ao Sistema
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Login efetuado! Redirecionando...</Alert>}

          <TextField
            label="Nome de Usuário"
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            label="Senha"
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || success}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};


export default LoginPage;
