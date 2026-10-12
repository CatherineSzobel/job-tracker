// The 448px card that Log in and Sign up sit in (inside AuthLayout): a heading and intro line, the page's
// content, and a centred line at the bottom (footer) pointing to the other page
export default function AuthCard({ title, intro, footer, children }) {
  return (
    <div className="flex w-full max-w-[448px] flex-col gap-6 rounded-2xl border border-line bg-surface p-6 text-ink md:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-10 font-bold tracking-[-0.01em]">{title}</h1>
        <p className="text-muted">{intro}</p>
      </div>
      {children}
      <p className="text-center text-muted">{footer}</p>
    </div>
  );
}

// The server's message when logging in or signing up fails
export function AuthError({ message }) {
  return (
    <p role="alert" className="rounded-lg border border-rejected-line bg-rejected-bg px-4 py-3 text-sm/6 text-rejected-fg">
      {message}
    </p>
  );
}
