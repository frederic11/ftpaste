"use client";

import type React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  OutlinedInput,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { supportedLanguages } from "@/constants/languages";
import { getPaste, deletePaste } from "@/services/api";
import { Paste } from "@/types/paste";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { red } from "@mui/material/colors";

export default function PastePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deleteToken = searchParams.get("deleteToken");
  const [paste, setPaste] = useState<Paste | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);
  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);

  const handleDelete = useCallback(async () => {
    if (!params.id || !deleteToken) {
      setDeleteError("Missing required parameters for deletion");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePaste(params.id as string, deleteToken);
      router.push("/"); // Redirect to home page after successful deletion
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete paste"
      );
    } finally {
      setIsDeleting(false);
    }
  }, [params.id, deleteToken, router]);

  const copyToClipboard = useCallback(() => {
    const currentUrl = window.location.href.split("?")[0];
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => console.error("Failed to copy"));
  }, []);

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await getPaste(params.id as string);
        setPaste(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch paste");
        router.push("/404");
      }
    };

    if (params.id) {
      fetchPaste();
    }
  }, [params.id, router]);

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!paste) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Container maxWidth="md">
        <FormControl fullWidth sx={{ mb: 2, mt: 4 }} variant="outlined">
          <InputLabel htmlFor="share-link-input">Share Link</InputLabel>
          <OutlinedInput
            id="share-link-input"
            value={window.location.href.split("?")[0]}
            readOnly
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="copy share link"
                  onClick={copyToClipboard}
                  edge="end"
                >
                  <ContentCopyIcon />
                </IconButton>
              </InputAdornment>
            }
            label="Share Link"
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2, my: 4 }}>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={paste?.language}
            label="Language"
            disabled
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
            mb: 2,
          }}
        >
          <Editor
            height="50vh"
            language={paste?.language}
            value={paste?.content}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              readOnly: true,
            }}
          />
        </Paper>
        {deleteToken && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Danger Zone
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                border: `1px solid ${red[300]}`,
                backgroundColor: red[50],
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="subtitle1" component="h3">
                    Delete this paste
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Once you delete this paste, there is no going back. Please
                    be certain.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleOpenConfirmDialog}
                  loading={isDeleting}
                >
                  {"Delete Paste"}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCloseConfirmDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Confirm Deletion"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this paste? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleDelete();
                handleCloseConfirmDialog();
              }}
              color="error"
              variant="contained"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!deleteError}
        autoHideDuration={6000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setDeleteError(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {deleteError}
        </Alert>
      </Snackbar>
    </>
  );
}
