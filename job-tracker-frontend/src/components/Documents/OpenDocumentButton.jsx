import { Download, ExternalLink } from "lucide-react";
import { downloadDocument } from "./documentUtils";
import { showToast } from "../../stores/useToastStore";

const BUTTON_CLASSES =
  "inline-flex items-center gap-1 text-sm text-accent dark:text-accent-muted hover:text-accent-soft transition-colors";

// Download for files, Open (new tab) for links
export default function OpenDocumentButton({ document: item }) {
  if (item.kind === "link") {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={BUTTON_CLASSES}>
        <ExternalLink size={14} /> Open
      </a>
    );
  }

  const download = async () => {
    try {
      await downloadDocument(item);
    } catch (err) {
      console.error(err);
      showToast(err.response?.status === 404 ? "This file can no longer be found." : "Download failed");
    }
  };

  return (
    <button type="button" onClick={download} className={BUTTON_CLASSES}>
      <Download size={14} /> Download
    </button>
  );
}
