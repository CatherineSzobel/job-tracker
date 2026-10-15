// A form's result line: tone "error" (announced at once) or "success"
export default function FormMessage({ tone = "error", children }) {
  if (!children) return null;

  return tone === "error" ? (
    <p role="alert" className="rounded-lg border border-rejected-line bg-rejected-bg px-4 py-3 text-sm/6 text-rejected-fg">
      {children}
    </p>
  ) : (
    <p role="status" className="rounded-lg border border-offer-line bg-offer-bg px-4 py-3 text-sm/6 text-offer-fg">
      {children}
    </p>
  );
}
