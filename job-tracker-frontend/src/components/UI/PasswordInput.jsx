import { Eye, EyeOff } from "lucide-react";

// A password field with a show/hide button inside it. The page keeps `shown`, so a "Confirm password"
// field next to it can follow the same toggle. Other props (id, value, onChange, autoComplete…) go to the input.
export default function PasswordInput({ shown, onToggleShown, ...inputProps }) {
  const label = shown ? "Hide password" : "Show password";

  return (
    <div className="relative">
      <input type={shown ? "text" : "password"} className="input-field pr-14" {...inputProps} />
      <button
        type="button"
        onClick={onToggleShown}
        aria-label={label}
        aria-pressed={shown}
        title={label}
        className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-lg text-muted transition-colors hover:text-ink"
      >
        {shown ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
