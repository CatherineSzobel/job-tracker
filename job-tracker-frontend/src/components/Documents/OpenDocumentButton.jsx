import { Download, ExternalLink } from "lucide-react";
import { downloadDocument } from "./documentUtils";
import { showToast } from "../../stores/useToastStore";

// Download for files, Open (new tab) for links; a soft button
export default function OpenDocumentButton({ document: item }) {
  if (item.kind === "link") {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn-soft">
        Open
        <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
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
    <button type="button" onClick={download} className="btn-soft">
      <Download size={16} aria-hidden="true" />
      Download
    </button>
  );
}
