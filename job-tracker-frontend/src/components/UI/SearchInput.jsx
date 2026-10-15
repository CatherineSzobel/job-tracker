import { useId } from "react";
import { Search } from "lucide-react";

// A 48px search field with a leading Search icon. label is read out (the placeholder can say the same).
// onChange(value) gets the text. className sizes the wrapper (e.g. flex-1).
export default function SearchInput({ label, value, onChange, placeholder = label, className = "" }) {
  const inputId = useId();

  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search size={20} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="input-field pl-11"
      />
    </div>
  );
}
