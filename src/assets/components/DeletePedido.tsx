import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  DialogContentText,
} from "@mui/material";
import type { Pedido } from "../../home";
import api from "../auth/axiosConfig";

interface Props {
  open: Pedido | null;
  onClose: (value: number | null) => void;
}

export default function DialogExcluirPedido({ open, onClose }: Props) {
  const close = () => {
    onClose(null);
  };


  const handleSubmit = () => {
    api.delete(`api/pedidos/${open?.id}`).then(() => {
      onClose(null);
    });
  };

  return (
    <Dialog open={open != null} onClose={close} fullWidth>
      <DialogTitle id="responsive-dialog-title">{"Excluir Pedido"}</DialogTitle>
      <Divider />
      <DialogContent>
        <DialogContentText>
          Você está prestes a excluir o pedido do produto
          <strong> {open?.nomeProduto}</strong>. Esta ação é{" "}
          <strong>irreversível</strong>. Você confirma a exclusão?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={close}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} autoFocus color="error">
          Deletar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
