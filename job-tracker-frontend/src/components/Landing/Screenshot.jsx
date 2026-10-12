// A screenshot in a padded frame; renders nothing when the file isn't there (src null).
// frameClassName: the frame's colour, set apart from the section behind it (bg-soft on a surface section,
// bg-surface on a page-coloured one).
export default function Screenshot({ src, alt, lazy = false, frameClassName = "bg-soft" }) {
  if (!src) return null;

  return (
    <div className={`rounded-2xl border border-line p-2 ${frameClassName}`}>
      <img src={src} alt={alt} loading={lazy ? "lazy" : "eager"} className="block h-auto w-full rounded-lg border border-line" />
    </div>
  );
}
