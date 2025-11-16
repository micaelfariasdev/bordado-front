import React, { useEffect, useState, useMemo } from 'react';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  DialogActions,
  Box,
  Paper,
} from '@mui/material';

import api from '../auth/axiosConfig';

interface ClienteForm {
  nomeCliente: string;
  numeroCliente: string;
}

interface NovoClienteFormProps {
  onClose: () => void;
  ws: WebSocket | null;
}

interface ClienteData {
  id: string;
  name: string;
  number: string;
  photo: string | null;
}

const stringToInitials = (name: string | undefined | null) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const NovoClienteForm: React.FC<NovoClienteFormProps> = ({ onClose, ws }) => {
  const [form, setForm] = useState<ClienteForm>({ nomeCliente: '', numeroCliente: '' });
  const [loading, setLoading] = useState(false);
  const [wsLoading, setWsLoading] = useState(true);

  const [clients, setClients] = useState<ClienteData[]>(() => {
    const saved = localStorage.getItem("clientes_cache");
    return saved ? JSON.parse(saved) : [];
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogListOpen, setDialogListOpen] = useState(true);
  const [dialogFormOpen, setDialogFormOpen] = useState(false);

  const clientsMemo = useMemo(() => clients, [clients]);

  useEffect(() => {
    localStorage.setItem("clientes_cache", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    if (!ws) return;

    ws.send(JSON.stringify({ type: 'get-clients' }));

    ws.onmessage = (msg: MessageEvent) => {
      try {
        const receivedData = JSON.parse(msg.data);
        if (receivedData.type === 'clients') {
          setClients(receivedData.chats || []);
          setWsLoading(false);
        }
      } catch {}
    };

    return () => {
      ws.onmessage = null;
    };
  }, [ws]);

  const handleClientSelect = (client: ClienteData) => {
    const numeroFormatado = client.number.startsWith('55')
      ? client.number.slice(2)
      : client.number;

    setForm({
      nomeCliente: client.name.startsWith('+55') ? '' : client.name,
      numeroCliente: numeroFormatado,
    });

    setError(null);
    setSuccess(false);

    setDialogListOpen(false);
    setDialogFormOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!form.nomeCliente.trim()) {
      setError('O Nome do Cliente é obrigatório.');
      setLoading(false);
      return;
    }

    if (!form.numeroCliente.trim() || form.numeroCliente.length < 8) {
      setError('O Número do WhatsApp é obrigatório e deve ser válido.');
      setLoading(false);
      return;
    }

    const dataToSend = {
      ...form,
      numeroCliente: `55${form.numeroCliente.replace(/\D/g, '')}`,
    };

    try {
      await api.post('api/clientes', dataToSend);

      const newClient = {
        id: String(Date.now()),
        name: form.nomeCliente,
        number: dataToSend.numeroCliente,
        photo: null,
      };

      setClients(prev => [...prev, newClient]);

      setSuccess(true);
      setForm({ nomeCliente: '', numeroCliente: '' });

      if (ws) ws.send(JSON.stringify({ type: 'get-clients' }));
    } catch {
      setError('Falha ao cadastrar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={dialogListOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Clientes Ativos</DialogTitle>

        <DialogContent dividers>
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {wsLoading && clientsMemo.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : clientsMemo.length === 0 ? (
              <ListItem>
                <ListItemText primary="Nenhum cliente encontrado." />
              </ListItem>
            ) : (
              clientsMemo.map((client, index) => (
                <React.Fragment key={client.id}>
                  <ListItem className="cursor-pointer hover:bg-blue-100" onClick={() => handleClientSelect(client)}>
                    <ListItemAvatar>
                      <Avatar
                        alt={client.name}
                        src={client.photo || undefined}
                        sx={!client.photo ? { bgcolor: '#4caf50' } : {}}
                      >
                        {!client.photo && stringToInitials(client.name)}
                      </Avatar>
                    </ListItemAvatar>

                    <ListItemText
                      primary={client.name}
                      secondary={client.number}
                    />
                  </ListItem>

                  {index < clientsMemo.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setDialogListOpen(false);
              setDialogFormOpen(true);
            }}
          >
            Novo Cliente
          </Button>

          <Button onClick={onClose} color="error">Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogFormOpen} onClose={() => setDialogFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Cliente</DialogTitle>

        <DialogContent dividers>
          <Paper elevation={0}>
            {success && <Alert severity="success" sx={{ mb: 2 }}>Cliente criado com sucesso!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TextField
              label="Nome do Cliente"
              name="nomeCliente"
              value={form.nomeCliente}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Número WhatsApp"
              name="numeroCliente"
              type="tel"
              value={form.numeroCliente}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setDialogFormOpen(false);
              setDialogListOpen(true);
            }}
          >
            Voltar
          </Button>

          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Salvar'}
          </Button>

          <Button onClick={onClose} color="error">Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
