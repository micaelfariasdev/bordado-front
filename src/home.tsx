import React, { useState, useEffect, useRef } from 'react';
import { Stack } from '@mui/material';
import UserMenu from './assets/components/MenuAvatar';
import DialogEditarPedido from './assets/components/DialogEditarPedido';
import { NovoPedidoForm } from './assets/components/NovoPedido';
import { Button, Dialog, DialogTitle, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { NovoClienteForm } from './assets/components/NovoCliente';
import api from './assets/auth/axiosConfig';
import ListaPedidos from './assets/components/ListarFiltrar';
import DialogExcluirPedido from './assets/components/DeletePedido';

export type Cliente = {
  id?: number;
  nomeCliente: string;
  numeroCliente?: string | null;
  dataCreate?: string | null;
};

export type Pedido = {
  id?: number;
  nomeProduto?: string;
  dataRecebimento?: string | Date | null;
  dataEntrega?: string | Date | null;
  descricao?: string | null;
  pago?: boolean;
  formaPagamento?: 'pix' | 'credito' | 'debito' | 'dinheiro';
  precoUnt?: number | null;
  quantidade?: number | null;
  clienteId?: number | null;
  cliente?: Cliente | null;
  status?: 'orcamento' | 'producao' | 'finalizado' | 'entregue' | null;
};

export type Profile = {
  success: boolean;
  logged: boolean;
  user: string;
  Número: string;
  profilePic: string;
};

export type Mensagem = {
  body: string;
  me: boolean;
  timestamp: number;
  src?: string | null;
  hasMedia?: string | boolean;
  data?: string;
};

export type HistoricoChat = {
  chat: string;
  chatId: string;
  pictureContact?: string;
  mensagens: Mensagem[];
};

export type MensegerWs = {
  type: string;
  from: string;
  body: string;
  me: boolean;
  timestamp: number;
  hasMedia?: boolean;
  mimetype?: string;
  data?: string;
};

const Home: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mensagens, setMensagens] = useState<HistoricoChat[]>([]);
  const [newMensagem, setNewMensagem] = useState<MensegerWs>();
  const wsRef = useRef<WebSocket | null>(null);
  const [editarPedido, setEditarPedido] = useState<number | null>(null);
  const [excluirPedido, setExcluirPedido] = useState<Pedido | null>(null);

  const [open, setOpen] = useState<string | boolean>(false);
  const handleClickOpen = (e: string | boolean) => {
    setOpen(e);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get('api/pedidos');
        setPedidos(response.data.data);
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as any).response &&
          (error as any).response.data &&
          (error as any).response.data.error === 'Token ausente'
        ) {
          window.location.href = '/login';
        }
        console.error('Erro ao buscar pedidos:', error);
      }
    };
    if (editarPedido == null && open === false && excluirPedido == null) {
      fetchPedidos();
    }
  }, [editarPedido, open, excluirPedido]);

  useEffect(() => {
    let retries = 0;

    const connect = () => {
      if (wsRef.current) wsRef.current.close();
      const token = localStorage.getItem('authToken');

      const ws = new WebSocket(
        `${import.meta.env.VITE_WS_URL!}?token=${token}`
      );

      wsRef.current = ws;

      ws.onopen = () => {
        retries = 0;

        const pedidosIds = pedidos?.map((p) => p.cliente?.numeroCliente) || [];
        ws.send(JSON.stringify({ type: 'get-history', numeros: pedidosIds }));
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          if (data.type === 'history') {
            setMensagens(data.data); // atualiza o estado
          }

          if (data.type === 'message') {
            setNewMensagem(data);
          }
        } catch (e) {
          console.warn('Mensagem não JSON:', msg.data);
        }
      };

      ws.onclose = () => {
        retries++;
        setTimeout(connect, Math.min(5000, retries * 1000));
      };

      ws.onerror = () => ws.close();
    };
    if (profile?.logged) {
      connect();
    }

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [profile]);

  useEffect(() => {
    document.title = `Central de Pedidos`;
  }, []);

  useEffect(() => {
    if (pedidos?.length > 0 && profile?.logged) {
      const pedidosIds = pedidos.map((p) => p.cliente?.numeroCliente);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'get-history', numeros: pedidosIds })
        );
      }
      // api.post("api/whatsapp/historico", {
      //   numeros: pedidosIds,
      // });
    }
  }, [pedidos, profile, wsRef.current]);

  useEffect(() => {
    const clientInit = async () => {
      try {
        await api.get('api/whatsapp/initclient');
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    const fetchMe = async () => {
      try {
        const resp = await api.get('api/whatsapp/me');
        setProfile(resp.data);

        if (resp.data.logged === false) {
          await api.get('api/whatsapp/login');
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    fetchMe();
    clientInit();
  }, []);

  return (
    <>
      <DialogExcluirPedido
        open={excluirPedido}
        onClose={() => setExcluirPedido(null)}
      />

      <DialogEditarPedido open={editarPedido} onClose={setEditarPedido} />
      <Dialog
        open={open === 'pedido'}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Criar Novo Pedido
          <IconButton
            aria-label="fechar"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <NovoPedidoForm onClose={handleClose} />
      </Dialog>
      <Dialog
        open={open === 'cliente'}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Criar Novo Cliente
          <IconButton
            aria-label="fechar"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <NovoClienteForm onClose={handleClose} ws={wsRef.current} />
      </Dialog>

      <div className="flex flex-col h-screen">
        <header className="bg-blue-950 h-24 flex items-center justify-center py-5">
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            width="90%"
          >
            <Stack direction="row" spacing={2}>
              {profile?.logged && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleClickOpen('pedido')}
                  >
                    Novo Pedido
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleClickOpen('cliente')}
                  >
                    Novo Cliente
                  </Button>
                </>
              )}
            </Stack>
            <UserMenu onProfile={setProfile} profile={profile ?? null} />
          </Stack>
        </header>
        <main className="bg-gray-900 flex-1 flex items-start justify-start p-5 gap-5 wrap">
          <ListaPedidos
            pedidos={pedidos}
            mensagens={mensagens}
            newMensagem={newMensagem}
            setExcluirPedido={setExcluirPedido}
            setEditarPedido={setEditarPedido}
            wsRef={wsRef}
          />
        </main>
      </div>
    </>
  );
};

export default Home;
