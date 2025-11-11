import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import type { Pedido } from "../../home";
import api from "../auth/axiosConfig";

interface Props {
  open: number | null;
  onClose: (value: number | null) => void;
}

export default function DialogEditarPedido({ open, onClose }: Props) {
  const [form, setForm] = useState<Pedido>();

  useEffect(() => {
    if (open == null) {
      setForm(undefined);
      return;
    }
    api
      .get(`api/pedidos/${open}`)
      .then((res) => {
        setForm(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (form) {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const close = () => {
    onClose(null);
  };

  const handleSubmit = () => {
    api.patch(`api/pedidos/${open}`, form).then(() => {
      onClose(null);
    });
  };

  if (!form) return null;
  return (
    <Dialog open={open != null} onClose={close} fullWidth>
      <DialogTitle>Editar Pedido</DialogTitle>
      <Divider />
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          name="nomeProduto"
          label="Produto"
          value={form?.nomeProduto}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          select
          name="status"
          label="Status"
          value={form?.status}
          onChange={handleChange}
        >
          <MenuItem value="orcamento">Orçamento</MenuItem>
          <MenuItem value="producao">Produção</MenuItem>
          <MenuItem value="finalizado">Finalizado</MenuItem>
          <MenuItem value="entregue">Entregue</MenuItem>
        </TextField>
        <TextField
          name="descricao"
          label="Descrição"
          value={form?.descricao || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          name="quantidade"
          label="Quantidade"
          type="number"
          value={form?.quantidade}
          onChange={handleChange}
        />
        <TextField
          name="precoUnt"
          label="Preço Unitário (R$)"
          type="number"
          value={form?.precoUnt}
          onChange={handleChange}
        />
        <TextField
          name="dataEntrega"
          label="Entrega"
          type="date"
          value={
            form?.dataEntrega ? String(form.dataEntrega).split("T")[0] : ""
          }
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          name="formaPagamento"
          label="Forma de Pagamento"
          value={form?.formaPagamento}
          onChange={handleChange}
        >
          <MenuItem value="pix">Pix</MenuItem>
          <MenuItem value="credito">Crédito</MenuItem>
          <MenuItem value="debito">Débito</MenuItem>
          <MenuItem value="dinheiro">Dinheiro</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch checked={form?.pago} name="pago" onChange={handleChange} />
          }
          label="Pago"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
