import { ExternalLink, Mail } from "lucide-react";

// An application contact's email address (opens the mail app) or link (new tab), shown as itself.
// The API only accepts an email address or an http(s) link here.
export default function ContactLink({ contact }) {
  const isEmail = !/^https?:\/\//i.test(contact);
  const Icon = isEmail ? Mail : ExternalLink;

  return (
    <a
      href={isEmail ? `mailto:${contact}` : contact}
      {...(isEmail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-accent-text hover:underline"
    >
      <span className="break-all">{contact}</span>
      <Icon size={14} strokeWidth={2.5} aria-hidden="true" className="shrink-0" />
    </a>
  );
}
