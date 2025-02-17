export interface Paste {
  id: string;
  content: string;
  language: string;
}

export interface CreatePasteResponse {
  pasteId: string;
  deleteToken: string;
}
