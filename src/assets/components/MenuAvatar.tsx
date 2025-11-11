import React, { useEffect, useState } from "react";
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import type { Profile } from "../../home";
import api from "../auth/axiosConfig";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));
function formatarTelefone(numero: string): string {
  const digits = String(numero).replace(/\D/g, "");
  const match = digits.match(/^(\d{2})(\d{2})(\d{1})(\d{4})(\d{4})$/);
  if (!match) return numero;
  return `+${match[1]} (${match[2]}) ${match[3]} ${match[4]}-${match[5]}`;
}



type Props = {
  onProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  profile?: Profile | null;
};

export default function UserMenu({ onProfile, profile }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");

  async function checkLogin() {
    const res = await api.get("api/whatsapp/login");
    const data = await res.data;
    if (data.logged) {
      onProfile(data);
      handleClose();
    } else if (data.qrCode) {
      setQrCode(data.qrCode);
      setTimeout(checkLogin, 3000);
    } else {
      setTimeout(checkLogin, 3000);
    }
  }

  useEffect(() => {
    onProfile(profile || null);
  }, [profile]);

  const open = Boolean(anchorEl);

  const handleMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:3000/api/whatsapp/logout", {
        method: "POST",
      });
      window.location.reload();
    } catch (err) {
      console.error("Erro ao sair:", err);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  if (profile?.logged) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handleMenu}>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
          >
            <Avatar src={profile.profilePic} alt={profile.user} />
          </StyledBadge>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem className="flex flex-col">
            <Typography variant="body1">{profile.user}</Typography>

            <Typography className="italic text-[12px]">
              {formatarTelefone(profile.Número)}
            </Typography>
          </MenuItem>
          <Divider sx={{ mb: 1 }} />
          <MenuItem onClick={handleLogout} disabled={loading}>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            )}
            Sair
          </MenuItem>
        </Menu>
      </Box>
    );
  } else {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleMenu}
          sx={{ borderRadius: 3, textTransform: "none", px: 2 }}
        >
          Entrar
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: { p: 2, minWidth: 220, borderRadius: 3, boxShadow: 4 },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Acesso WhatsApp
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <MenuItem onClick={checkLogin}>
            <Avatar sx={{ width: 28, height: 28, mr: 1 }} />
            <Typography>Gerar QR Code</Typography>
          </MenuItem>

          <Box textAlign="center" mt={2}>
            {qrCode ? (
              <img
                src={qrCode}
                alt="QR Code"
                className="w-50 h-50 rounded-lg shadow-md square"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                Carregando QR Code...
              </Typography>
            )}
          </Box>
        </Menu>
      </Box>
    );
  }
}
