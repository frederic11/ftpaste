import { randomBytes } from "crypto";

interface Paste {
  id: string;
  text: string;
  expiryTime: number;
  deleteToken: string;
}

const pastes: Map<string, Paste> = new Map();

export function createPaste(
  text: string,
  expiryMinutes: number
): { id: string; deleteToken: string } {
  const id = randomBytes(4).toString("hex");
  const deleteToken = randomBytes(8).toString("hex");
  const expiryTime = Date.now() + expiryMinutes * 60 * 1000;

  pastes.set(id, { id, text, expiryTime, deleteToken });

  // Set up expiration
  setTimeout(() => {
    pastes.delete(id);
  }, expiryMinutes * 60 * 1000);

  return { id, deleteToken };
}

export async function getPaste(
  id: string
): Promise<Omit<Paste, "deleteToken"> | null> {
  const paste = pastes.get(id);
  if (!paste || paste.expiryTime < Date.now()) {
    return null;
  }
  const { deleteToken, ...pasteWithoutToken } = paste;
  return pasteWithoutToken;
}
