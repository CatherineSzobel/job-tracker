import { Award, File, FileText, Github, Globe, Linkedin, Mail, Palette } from "lucide-react";

// Mirrors the backend enums in app/Enums (DocumentCategory, DocumentKind)
export const DOCUMENT_CATEGORIES = [
  { value: "cv", label: "CV", icon: FileText },
  { value: "cover_letter", label: "Cover letter", icon: Mail },
  { value: "portfolio", label: "Portfolio", icon: Palette },
  { value: "certificate", label: "Certificate", icon: Award },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "github", label: "GitHub", icon: Github },
  { value: "website", label: "Website", icon: Globe },
  { value: "other", label: "Other", icon: File },
];

export const CATEGORY_BY_VALUE = Object.fromEntries(DOCUMENT_CATEGORIES.map((category) => [category.value, category]));

export const DEFAULT_FILE_CATEGORY = "cv";
export const DEFAULT_LINK_CATEGORY = "website";

// Same limits as DocumentStoreRequest (max:10240, mimes:...)
export const ACCEPTED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "odt", "txt", "png", "jpg", "jpeg"];
export const ACCEPTED_FILE_TYPES = ACCEPTED_FILE_EXTENSIONS.map((extension) => `.${extension}`).join(",");
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
