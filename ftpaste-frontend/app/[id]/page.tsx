import { Box, Container, Typography, Paper } from "@mui/material";
import { notFound } from "next/navigation";

interface Paste {
  id: string;
  content: string;
}

async function getPaste(id: string): Promise<Paste> {
  const response = await fetch(`http://localhost:5044/api/Pastes/${id}`, {
    next: { revalidate: 0 },
  });
  if (!response.ok) {
    notFound();
  }
  return response.json();
}

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  let paste: Paste;

  try {
    const { id } = await params;
    paste = await getPaste(id);
  } catch (error) {
    notFound();
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paste Content
        </Typography>
        <Paper elevation={3} sx={{ p: 2, whiteSpace: "pre-wrap" }}>
          <Typography>{paste.content}</Typography>
        </Paper>
      </Box>
    </Container>
  );
}
