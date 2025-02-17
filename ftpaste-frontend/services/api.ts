"use server";
import { CreatePasteResponse, Paste } from "@/types/paste";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5044";

export async function createPaste(data: {
  content: string;
  language: string;
  expiresAt: number;
}): Promise<CreatePasteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/Pastes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function getPaste(pasteId: string): Promise<Paste> {
  const response = await fetch(`${API_BASE_URL}/api/Pastes/${pasteId}`, {
    method: "Get",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function deletePaste(
  pasteId: string,
  deleteToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/Pastes/${pasteId}`, {
    method: "Delete",
    headers: {
      "Content-Type": "application/json",
      "Delete-Token": deleteToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return;
}
