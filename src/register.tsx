import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";

import axios from "axios";

const REGISTER_URL = "http://localhost:3000/auth/register";

interface RegisterForm {
  username: string;
  senha: string;
  confirmSenha: string;
}

interface RegisterProps {
  onclose?: (success: boolean) => void;
}

const RegisterPage: React.FC<RegisterProps> = ({ onclose }) => {
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    senha: "",
    confirmSenha: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
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
      setError("Preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    if (form.senha !== form.confirmSenha) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    try {
      const data = {
        username: form.username,
        senha: form.senha,
      };
      await axios.post(REGISTER_URL, data);

      setSuccess(true);

      onclose?.(false);
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Criar Conta
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Conta criada com sucesso!
            </Alert>
          )}

          <TextField
            label="Nome de Usuário"
            name="username"
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

          <TextField
            label="Confirmar Senha"
            name="confirmSenha"
            type="password"
            value={form.confirmSenha}
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
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Criar Conta"
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterPage;
