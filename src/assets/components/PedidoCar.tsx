import { useMemo, useState, useEffect, useRef } from "react"
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Avatar,
    IconButton,
    Typography,
    Stack,
    Divider,
    Button,
    TextField,
    Box,
    Chip
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import SendIcon from '@mui/icons-material/Send';
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import Inventory2Icon from "@mui/icons-material/Inventory2"
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits"
import type { Pedido, HistoricoChat, MensegerWs } from "../../home"


type Props = {
    pedido: Pedido
    mensagem: HistoricoChat[]
    newMensagem?: MensegerWs
    onEdit: React.Dispatch<React.SetStateAction<number | null>>
    onDelete?: (id?: number) => void
    onSendMessage?: (to: string, message: string) => Promise<void> | void
}

function fmtDate(d?: string | Date | null) {
  if (!d) return "—"
  const parts = (typeof d === "string" ? d : d.toISOString()).split("T")[0].split("-")
  const [year, month, day] = parts.map(Number)
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
}


function formatarData(timestamp: number): string {
    const data = new Date(timestamp * 1000)
    const agora = new Date()
    const diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"]

    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    const diaSemana = diasSemana[data.getDay()]
    const dataStr = data.toLocaleDateString("pt-BR")

    const mesmoDia =
        data.getDate() === agora.getDate() &&
        data.getMonth() === agora.getMonth() &&
        data.getFullYear() === agora.getFullYear()

    const diffDias = Math.floor((agora.getTime() - data.getTime()) / (1000 * 60 * 60 * 24))

    if (mesmoDia) {
        return hora
    } else if (diffDias <= 7 && diffDias >= 0) {
        return `${hora} - ${diaSemana}`
    } else {
        return `${hora} ${dataStr}`
    }
}


function PrazoEntrega({ dataEntrega }: { dataEntrega: string }) {
    const hoje = new Date()
    const entrega = new Date(dataEntrega)

    const diffDias = Math.floor(
        (entrega.setHours(0, 0, 0, 0) - hoje.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
    )

    let cor = "gray"
    if (diffDias >= 0) cor = "green"        // ainda falta
    else if (diffDias === -1) cor = "orange" // é hoje
    else cor = "red"        
    const animName = `pulse-${cor}`

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
                <strong>Entrega:</strong> {fmtDate(dataEntrega)}
            </Typography>
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: cor,
                    boxShadow: `0 0 6px ${cor}`,
                    animation: diffDias < 1 ? `${animName} 1.5s infinite` : "none",
                     [`@keyframes ${animName}`]: {
                        "0%": { boxShadow: `0 0 4px ${cor}` },
                        "50%": { boxShadow: `0 0 10px ${cor}` },
                        "100%": { boxShadow: `0 0 4px ${cor}` },
                    },
                }}
            />
        </Box>
    )
}

function StatusPagamento({ quantidade, precoUnt, pago }: { quantidade: number; precoUnt: number; pago: boolean }) {
    const total = quantidade * precoUnt
    let cor = ''
    let status = ""

    if (total === 0) {
        cor = "gray"
        status = "Sem valor"
    } else if (pago) {
        cor = "green"
        status = "Pago"
    } else {
        cor = "red"
        status = "Pendente"
    }
    const animName = `pulse-${cor}`

    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
                <strong>Total:</strong>{" "}
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} — {status}
            </Typography>
            <Box
                sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: cor,
                    boxShadow: `0 0 6px ${cor}`,
                    animation: pago ? "none" : `${animName} 1.5s infinite`,
                    [`@keyframes ${animName}`]: {
                        "0%": { boxShadow: `0 0 4px ${cor}` },
                        "50%": { boxShadow: `0 0 10px ${cor}` },
                        "100%": { boxShadow: `0 0 4px ${cor}` },
                    },
                }}
            />

        </Box>
    )
}

export function PedidoCard({ pedido, mensagem, newMensagem, onEdit, onDelete, onSendMessage }: Props) {
    const [msg, setMsg] = useState("")
    const [chat, setChat] = useState<HistoricoChat>()
    const [sending, setSending] = useState(false)
    const [alertMsg, setAlertMsg] = useState<boolean>(false)
    const clienteNome = pedido.cliente?.nomeCliente ?? "Cliente não informado"
    const initials = useMemo(() => {
        const parts = clienteNome.split(" ").filter(Boolean)
        return (parts[0]?.[0] ?? "C") + (parts[1]?.[0] ?? "")
    }, [clienteNome])



    useEffect(() => {
        if (!pedido.cliente?.numeroCliente) return

        const filtradas = mensagem.filter((m: any) => {
            const raw = m.chatId.replace("@c.us", "")
            let num = raw.startsWith("55") ? raw.slice(2) : raw
            const normalized = num.length === 11 ? num : num.slice(0, 2) + "9" + num.slice(2)
            return Number(normalized) === Number(pedido.cliente?.numeroCliente)
        })

        if (filtradas.length > 0) {
            const chatAtual = { ...filtradas[0] } // pega o primeiro chat que bateu
            chatAtual.mensagens = chatAtual.mensagens.map((m: any) => {
                if (m.hasMedia) {
                    return { ...m, src: `data:${m.mimetype};base64,${m.data}` }
                }
                return m
            })
            setChat(chatAtual)
        } else {
            console.log("⚠️ Nenhum chat encontrado para o pedido", pedido.id)
        }

        console.log("📨 mensagens do pedido", pedido.id, filtradas[0])
    }, [mensagem, pedido])


    useEffect(() => {
        if (chat && newMensagem) {
            if (newMensagem.from === chat.chatId) {
                setAlertMsg(true)

                if (newMensagem.hasMedia) {
                    const src = `data:${newMensagem.mimetype};base64,${newMensagem.data}`
                    setChat(prev =>
                        prev
                            ? {
                                ...prev,
                                mensagens: [
                                    ...prev.mensagens,
                                    { body: newMensagem.body, me: newMensagem.me, timestamp: newMensagem.timestamp, src: src, hasMedia: true }
                                ]
                            }
                            : prev
                    )
                } else {
                    setChat(prev =>
                        prev
                            ? {
                                ...prev,
                                mensagens: [
                                    ...prev.mensagens,
                                    { body: newMensagem.body, me: newMensagem.me, timestamp: newMensagem.timestamp }
                                ]
                            }
                            : prev
                    )
                }
            }
        }
    }, [newMensagem])


    const handleSend = async () => {
        if (!msg.trim() || !onSendMessage) return
        setSending(true)
        try {
            if (chat) {
                const to = chat.chatId.replace("@c.us", "")
                await onSendMessage(to, msg.trim())
                setMsg("")
                setChat(prev =>
                    prev
                        ? {
                            ...prev,
                            mensagens: [
                                ...prev.mensagens,
                                { body: msg.trim(), me: true, timestamp: Math.floor(Date.now() / 1000) }
                            ]
                        }
                        : prev
                )
            }
        } finally {
            setSending(false)
            setAlertMsg(false)

        }
    }


    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chat?.mensagens])



    return (
        <Card sx={{ width: 360, borderRadius: 2, boxShadow: 3 }} className={alertMsg ? " shake-shadow" : ""}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: "primary.main" }} src={chat?.pictureContact}>{initials}</Avatar>}
                action={
                    <Stack direction="row" spacing={1}>
                        <IconButton aria-label="editar" onClick={() => onEdit(pedido.id ?? null)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton aria-label="deletar" onClick={() => onDelete?.(pedido.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                }
                title={<Typography variant="h6">{pedido.nomeProduto}</Typography>}
                subheader={<Typography variant="caption" color="text.secondary">Pedido #{pedido.id ?? "—"}</Typography>}
            />

            <CardContent>
                <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>Recebimento:</strong> {fmtDate(pedido.dataRecebimento)}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <PrazoEntrega dataEntrega={String(pedido.dataEntrega)} />

                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ProductionQuantityLimitsIcon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>Quantidade:</strong> {Number(pedido.quantidade ?? 0).toFixed(0)}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>Preço unitário:</strong> {Number(pedido.precoUnt ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <StatusPagamento quantidade={Number(pedido.quantidade)} precoUnt={Number(pedido.precoUnt)} pago={Boolean(pedido.pago)} />
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>Forma de Pagamento:</strong> {String(pedido.formaPagamento).toUpperCase()}</Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Inventory2Icon fontSize="small" color="action" />
                        <Typography variant="body2"><strong>Descrição:</strong> {pedido.descricao ?? "—"}</Typography>
                    </Stack>

                    <Divider sx={{ my: 0.5 }} />

                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack>
                            <Typography variant="subtitle2">{clienteNome}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {pedido.cliente?.numeroCliente ?? (pedido.clienteId ? `ID: ${pedido.clienteId}` : "Telefone não informado")}
                            </Typography>
                        </Stack>
                        <Chip label={(pedido.status ?? "novo").replace("_", " ")} color="primary" size="small" />
                    </Stack>
                </Stack>
            </CardContent>

            <CardActions sx={{ px: 2, pb: 2, pt: 0 }} className="flex flex-col gap-1">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", maxHeight: 200, overflowY: "auto", mb: 1 }}>
                    {chat && chat.mensagens.map((m: any, i: number) => (
                        <Box
                            key={i}
                            sx={{
                                alignSelf: m.me ? "flex-end" : "flex-start",
                                bgcolor: m.me ? "#1f6feb" : "#30363d",
                                p: 1.5,
                                borderRadius: 2,
                                minWidth: "35%",
                                maxWidth: "70%",
                                wordBreak: "break-word",
                                color: "white",
                                position: "relative",
                                mb: 1,
                                boxShadow: "0 0 5px rgba(0,0,0,0.3)",
                            }}
                        >
                            {m.hasMedia && (
                                <Box
                                    component="img"
                                    src={m.src}
                                    alt="imagem recebida"
                                    sx={{
                                        width: "100%",
                                        maxWidth: 250,
                                        borderRadius: 2,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        mb: m.body ? 1 : 0,
                                    }}
                                />
                            )}

                            {m.body && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        marginBottom: 1,
                                        whiteSpace: "pre-wrap",
                                        pr: 5,
                                    }}
                                >
                                    {m.body}
                                </Typography>
                            )}

                            <Typography
                                variant="caption"
                                sx={{
                                    position: " absolute",
                                    bottom: 2,
                                    right: 8,
                                    fontSize: "10px",
                                    color: "rgba(255,255,255,0.6)",
                                }}
                            >
                                {formatarData(m.timestamp)}
                            </Typography>

                            {i === chat.mensagens.length - 1 && <div ref={messagesEndRef} />}
                        </Box>
                    ))}


                </Box>
                <Box sx={{ width: "100%" }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Enviar mensagem ao cliente"
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSend() }}
                        />
                        <Button  onClick={handleSend} disabled={!onSendMessage || sending || !msg.trim()}>
                            <SendIcon sx={{color: 'main'}}/>
                        </Button>
                    </Stack>
                </Box>
            </CardActions>
        </Card>
    )
}