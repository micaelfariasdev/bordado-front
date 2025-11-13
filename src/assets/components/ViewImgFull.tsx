import { useState } from "react";
import { Box, IconButton, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FullscreenImageProps {
  src: string;
  alt?: string;
}

export default function FullscreenImage({ src, alt }: FullscreenImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="cursor-pointer w-full object-contain mb-2 rounded"
        onClick={() => setOpen(true)}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        PaperProps={{ style: { backgroundColor: "rgba(0,0,0,0.9)" } }}
      >
        <Box
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: "absolute", top: 16, right: 16, color: "white" }}
          >
            <CloseIcon />
          </IconButton>

          <img
            src={src}
            alt={alt}
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
          />
        </Box>
      </Dialog>
    </>
  );
}
