import { useState, useMemo } from "react";
import { PedidoCard } from "./PedidoCar";
import type { MensegerWs, Pedido } from "../../home";
import Masonry from '@mui/lab/Masonry';


type ListaPedidosProps = {
  pedidos: Pedido[];
  mensagens: any;
  newMensagem?: MensegerWs;
  setExcluirPedido: (pedido: Pedido) => void;
  setEditarPedido: (id: number | null) => void;
  wsRef: React.MutableRefObject<WebSocket | null>;
};

export default function ListaPedidos({
  pedidos,
  mensagens,
  newMensagem,
  setExcluirPedido,
  setEditarPedido,
  wsRef,
}: ListaPedidosProps) {
  const [statusFiltro, setStatusFiltro] = useState("");

  const ordemStatus = ["orcamento", "producao", "finalizado", "entregue"];

const pedidosFiltrados = useMemo(() => {
  if (!Array.isArray(pedidos)) return [];
  const filtered = statusFiltro
    ? pedidos.filter((p) => p.status === statusFiltro)
    : [...pedidos]; // clona para não mutar o original

  const sorted = filtered.sort(
    (a, b) => ordemStatus.indexOf(a.status ?? "") - ordemStatus.indexOf(b.status ?? "")
  );
  return sorted;
}, [pedidos, statusFiltro]);


  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-3 items-center">
        <label className="text-white">Filtrar por status:</label>
        <select
          className="bg-gray-800 text-white rounded px-3 py-2"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="orcamento">Orçamento</option>
          <option value="producao">Produção</option>
          <option value="finalizado">Finalizado</option>
          <option value="entregue">Entregue</option>
        </select>
      </div>

      <div className="bg-gray-900 flex-1 flex flex-wrap gap-5 md:p-5 lg:p-5 p-1">
        <Masonry
  columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
  spacing={{ xs: 1, sm: 2, md: 3 }}
>
        {pedidosFiltrados.map((pedido) => (
          <PedidoCard
            key={pedido.id}
            pedido={pedido}
            onExclude={() => setExcluirPedido(pedido)}
            onEdit={(id) => setEditarPedido(Number(id) ?? null)}
            mensagem={mensagens}
            newMensagem={newMensagem}
            onSendMessage={async (to, message) => {
              if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                  JSON.stringify({ type: "send-message", to, message })
                );
              }
            }}
          />
        ))}
        </Masonry>
      </div>
    </div>
  );
}
