"use client";

import type React from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Modal,
} from "@mui/material";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Home() {
  const [pasteText, setPasteText] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("5");
  const [pasteUrl, setPasteUrl] = useState("");
  const [deleteToken, setDeleteToken] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5044/api/Pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: pasteText,
      }),
    });
    const data = await response.json();
    setPasteUrl(`${window.location.origin}/${data.pasteId}`);
    setDeleteToken(data.deleteToken);
    setOpenModal(true);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create a New Paste
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Paste your text here"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            label="Expiry time (minutes)"
            value={expiryMinutes}
            onChange={(e) => setExpiryMinutes(e.target.value)}
            inputProps={{ min: 1, max: 60 }}
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
      </Box>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h6" component="h2">
            Paste Created
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Paste URL: {pasteUrl}
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2 }}>
            Delete Token: {deleteToken}
          </Typography>
          <Button
            onClick={() => setOpenModal(false)}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}
