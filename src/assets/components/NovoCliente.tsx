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


// Definição da interface para o estado do formulário (tipagem segura)
interface ClienteForm {
  nomeCliente: string;
  // O número do WhatsApp deve ser tratado como STRING no estado
  // para preservar zeros à esquerda e evitar problemas com números grandes (BigInt).
  numeroCliente: string; 
}

// Props para receber a função de fechar do Dialog
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

    // Apenas atribui o valor diretamente. Se o campo for 'numeroCliente',
    // ele será tratado como string no estado.
    const newValue: string = value;

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError(null);
    setSuccess(false);
  };

  // Funções handleCheckboxChange e referências a "pago" e "dataEntrega" foram removidas,
  // pois são específicas de "Pedido".

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
      // Endpoint ATUALIZADO para /api/clientes
      await api.post("api/clientes", form);

      setSuccess(true);
      // Opcional: Resetar o formulário após o sucesso
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
          <Grid item xs={12}>
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

          <Grid item xs={12}>
            <TextField
              label="Número WhatsApp"
              name="numeroCliente"
              // Usar 'tel' melhora a experiência no celular, mas o valor é uma string
              type="tel" 
              value={form.numeroCliente}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>
          
          {/* Outros campos relacionados a cliente (e-mail, endereço) iriam aqui */}

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