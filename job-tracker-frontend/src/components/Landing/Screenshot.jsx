// A framed screenshot with an optional caption; renders nothing when the file isn't there (src null)
export default function Screenshot({ src, alt, caption, lazy = false }) {
  if (!src) return null;

  return (
    <figure className="flex flex-col gap-3">
      <img
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        className="w-full rounded-2xl border border-border dark:border-dark-subtle shadow-xl"
      />
      {caption && <figcaption className="text-sm text-center text-light-muted dark:text-dark-muted">{caption}</figcaption>}
    </figure>
  );
}
