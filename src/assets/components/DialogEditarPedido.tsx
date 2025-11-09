import { useEffect, useState } from "react"
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, FormControlLabel, Switch,
    Divider
} from "@mui/material"
import type { Pedido } from "../../home"
import axios from "axios"



interface Props {
    open: number | null
    onClose: (value: number | null) => void
}

export default function DialogEditarPedido({ open, onClose }: Props) {
    const [form, setForm] = useState<Pedido>()

    useEffect(() => {
        if (open == null) {
            setForm(undefined)
            return
        }
        axios.get(`http://localhost:3000/api/pedidos/${open}`).then(res => { setForm(res.data.data) }).catch(err => console.error(err))

    }, [open])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        if (form) {
            setForm({ ...form, [name]: type === "checkbox" ? checked : value })
        }
    }

    const close = () => {
        onClose(null)
    }


    const handleSubmit = () => {
        onClose(null)
        console.log("Salvar pedido:", form)
        axios.patch(`http://localhost:3000/api/pedidos/${open}`, form)
    }
    if (!form) return null
    return (
        <Dialog open={open != null} onClose={close} fullWidth>
            <DialogTitle>Editar Pedido</DialogTitle>
            <Divider />
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField name="nomeProduto" label="Produto" value={form?.nomeProduto} onChange={handleChange} fullWidth />
                <TextField name="descricao" label="Descrição" value={form?.descricao || ""} onChange={handleChange} fullWidth />
                <TextField name="quantidade" label="Quantidade" type="number" value={form?.quantidade} onChange={handleChange} />
                <TextField name="precoUnt" label="Preço Unitário (R$)" type="number" value={form?.precoUnt} onChange={handleChange} />
                <TextField name="dataEntrega" label="Entrega" type="date" value={form?.dataEntrega ? String(form.dataEntrega).split('T')[0] : ""} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField select name="formaPagamento" label="Forma de Pagamento" value={form?.formaPagamento} onChange={handleChange}>
                    <MenuItem value="pix">Pix</MenuItem>
                    <MenuItem value="credito">Crédito</MenuItem>
                    <MenuItem value="debito">Débito</MenuItem>
                    <MenuItem value="dinheiro">Dinheiro</MenuItem>
                </TextField>
                <FormControlLabel control={<Switch checked={form?.pago} name="pago" onChange={handleChange} />} label="Pago" />
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Salvar</Button>
            </DialogActions>
        </Dialog>
    )
}
