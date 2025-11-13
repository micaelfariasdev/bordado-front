import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  DialogContent,
  DialogActions,
} from "@mui/material";
import api from "../auth/axiosConfig";


interface ClienteForm {
  nomeCliente: string;
  numeroCliente: string; 
}

interface NovoClienteFormProps {
  onClose: () => void;
}

export const NovoClienteForm: React.FC<NovoClienteFormProps> = ({ onClose }) => {
  const [form, setForm] = useState<ClienteForm>({
    nomeCliente: "", // Deixei vazio para obrigar a usuária a digitar
    numeroCliente: "", // Deixei vazio para obrigar a usuária a digitar
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const newValue: string = value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError(null);
    setSuccess(false);
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validação de campos obrigatórios do cliente
    if (!form.nomeCliente.trim()) {
      setError("O Nome do Cliente é obrigatório.");
      setLoading(false);
      return;
    }

    if (!form.numeroCliente.trim() || form.numeroCliente.length < 8) {
        setError("O Número do WhatsApp é obrigatório e deve ser válido.");
        setLoading(false);
        return;
    }


    try {
      await api.post("api/clientes", form);

      setSuccess(true);
      setForm({
        nomeCliente: "",
        numeroCliente: "",
      });
      onClose()

    } catch (err) {
      console.error("Erro ao criar cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: 500 }}
    >
      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cliente criado com sucesso!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid>
            <TextField
              label="Nome do Cliente"
              name="nomeCliente"
              value={form.nomeCliente}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>

          <Grid>
            <TextField
              label="Número WhatsApp"
              name="numeroCliente"
              type="tel" 
              value={form.numeroCliente}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          

        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error" disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Cadastrar Cliente"}
        </Button>
      </DialogActions>
    </Box>
  );
};