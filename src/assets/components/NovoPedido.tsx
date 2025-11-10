import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Checkbox,
  Box,
  FormControlLabel,
  Alert,
  CircularProgress,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useEffect } from "react";
import api from "../auth/axiosConfig";

// Definição da interface para o estado do formulário (tipagem segura)
interface PedidoForm {
  clienteId: number;
  nomeProduto: string;
  dataEntrega: string;
  descricao: string;
  quantidade: number;
  precoUnt: number;
  pago: boolean;
  formaPagamento: "pix" | "credito" | "debito" | "dinheiro";
}

const FORMAS_PAGAMENTO = ["pix", "credito", "debito", "dinheiro"];

// Props para receber a função de fechar do Dialog
interface NovoPedidoFormProps {
  onClose: () => void;
}

export const NovoPedidoForm: React.FC<NovoPedidoFormProps> = ({ onClose }) => {
  const [form, setForm] = useState<PedidoForm>({
    clienteId: 0,
    nomeProduto: "Produto desconhecido",
    dataEntrega: "",
    descricao: "",
    quantidade: 0,
    precoUnt: 0,
    pago: false,
    formaPagamento: "dinheiro",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [clientes, setClientes] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    let newValue: string | number | boolean = value;

    if (name === "quantidade" || name === "precoUnt") {
      newValue = parseFloat(value) || 0;
    } else if (name === "clienteId") {
      newValue = parseInt(value, 10) || 0;
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setError(null);
    setSuccess(false);
  };

  useEffect(() => {
    api.get("api/clientes").then((response) => {
    setClientes(response.data.data);
    });
  }, []);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      pago: e.target.checked,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!form.dataEntrega) {
      setError("A Data de Entrega é obrigatória.");
      setLoading(false);
      return;
    }

    try {
      api.post("api/pedidos", form);

      setSuccess(true);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro desconhecido ao enviar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ width: 600 }} // Define uma largura para o formulário dentro do Dialog
    >
      <DialogContent dividers>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Pedido criado com sucesso!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={1} direction="column">
          <Grid item xs={12}>
            <TextField
              select
              label="Cliente ID"
              name="clienteId"
              value={form.clienteId}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              {clientes &&
                clientes.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.nomeCliente}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Nome do Produto"
              name="nomeProduto"
              value={form.nomeProduto}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Data de Entrega"
              name="dataEntrega"
              type="date"
              value={form.dataEntrega}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descrição"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Quantidade"
              name="quantidade"
              type="number"
              value={form.quantidade}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Preço Unitário (R$)"
              name="precoUnt"
              type="number"
              value={form.precoUnt}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{ inputProps: { min: 0, step: "0.01" } }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              label="Forma de Pagamento"
              name="formaPagamento"
              value={form.formaPagamento}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              {FORMAS_PAGAMENTO.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.pago}
                  onChange={handleCheckboxChange}
                  name="pago"
                />
              }
              label="Pago"
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
          {loading ? <CircularProgress size={24} /> : "Criar Pedido"}
        </Button>
      </DialogActions>
    </Box>
  );
};
