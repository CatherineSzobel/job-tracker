import API from "../../api/axios";
import { ACCEPTED_FILE_EXTENSIONS, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB } from "../../constants/documents";

// Authenticated blob fetch (same pattern as the Excel export), saved under the original filename
export async function downloadDocument(fileDocument) {
  const res = await API.get(`/documents/${fileDocument.id}/download`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileDocument.original_filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// e.g. 2048 → "2 KB", 3355443 → "3.2 MB"
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// "https://www.github.com/jane" → "github.com"
export function linkDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function fileNameWithoutExtension(filename) {
  return filename.replace(/\.[^.]+$/, "");
}

// Mirrors the server's checks, so obvious mistakes are caught before uploading
export function checkFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
    return `Only ${ACCEPTED_FILE_EXTENSIONS.join(", ")} files can be uploaded.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `Files can be at most ${MAX_FILE_SIZE_MB} MB.`;
  }
  return null;
}

// First validation message from a Laravel 422, or a readable fallback
export function apiErrorMessage(err, fallback) {
  if (err.response?.status === 413) return "That file is too large for the server to accept.";
  const errors = err.response?.data?.errors;
  if (errors) return Object.values(errors)[0][0];
  return err.response?.data?.message || fallback;
}
