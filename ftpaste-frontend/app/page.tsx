"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { supportedLanguages } from "@/constants/languages";
import { createPaste } from "@/services/api";

export default function Home() {
  const router = useRouter();
  const [pasteText, setPasteText] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("60");
  const [language, setLanguage] = useState("plaintext");
  const [expiryError, setExpiryError] = useState<string>("");
  const [textError, setTextError] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const minutes = parseInt(value);

    if (isNaN(minutes) || minutes < 5 || minutes > 60) {
      setExpiryError("Expiry time must be between 5 and 60 minutes");
    } else {
      setExpiryError("");
    }

    setExpiryMinutes(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    if (!pasteText.trim()) {
      setTextError("Text cannot be empty");
      return;
    } else {
      setTextError("");
    }

    setIsSubmitting(true);

    try {
      // Calculate expiration time in Unix epoch
      const now = Date.now();
      const expiresAt = Math.floor(now / 1000) + parseInt(expiryMinutes) * 60;

      const response = await createPaste({
        content: pasteText,
        language,
        expiresAt,
      });

      router.push(
        `/${response.pasteId}?deleteToken=${encodeURIComponent(
          response.deleteToken
        )}`
      );
    } catch (error) {
      console.error("Error creating paste:", error);
      setOpenSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Create a New Paste
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
              >
                {supportedLanguages.map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Paper
              elevation={3}
              sx={{
                paddingTop: 1,
                paddingBottom: 1,
                whiteSpace: "pre-wrap",
                mb: textError ? 0 : 2,
              }}
            >
              <Editor
                height="50vh"
                language={language}
                onChange={(text) => setPasteText(text || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                }}
              />
            </Paper>
            <Box sx={{ mb: 2, marginLeft: 2 }}>
              <Typography variant="caption" color="error">
                {textError}
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="number"
              inputMode="numeric"
              variant="outlined"
              label="Expiry time (minutes)"
              value={expiryMinutes}
              onChange={handleExpiryChange}
              margin="normal"
              required
              error={!!expiryError}
              helperText={
                expiryError ||
                "Paste will be deleted after this time. Valid range: 5 to 60 minutes."
              }
              slotProps={{
                htmlInput: {
                  min: 5,
                  max: 60,
                },
              }}
            />
            <Button
              loading={isSubmitting}
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Submit
            </Button>
          </form>
        </Box>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Failed to create paste. Please try again.
        </Alert>
      </Snackbar>
    </>
  );
}
