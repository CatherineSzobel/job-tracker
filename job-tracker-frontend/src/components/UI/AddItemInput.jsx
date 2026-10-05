import { useState } from "react";

// A text field with an Add button (Enter adds too). onAdd(text) gets the trimmed text.
export default function AddItemInput({ placeholder, maxLength, onAdd }) {
  const [text, setText] = useState("");

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add();
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={maxLength}
        className="input-field py-1"
      />
      <button type="button" onClick={add} disabled={!text.trim()} className="btn-small disabled:opacity-50">
        Add
      </button>
    </div>
  );
}
