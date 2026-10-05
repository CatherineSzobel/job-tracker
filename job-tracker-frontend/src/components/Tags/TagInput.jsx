import { useId, useState } from "react";
import { TAG_NAME_MAX } from "../../constants/tags";
import { useToastStore } from "../../stores/useToastStore";

// Type a tag name; the browser suggests the user's tags (<datalist>). Enter or the button picks the tag
// with that name (ignoring case), or creates it with onCreate(name) when allowCreate is on.
// excludeIds: tags left out of the suggestions (e.g. ones the application already has).
export default function TagInput({
  tags,
  onSelect,
  onCreate,
  allowCreate = true,
  excludeIds = [],
  placeholder = "Add tag…",
  submitLabel = "Add",
}) {
  const listId = useId();
  const showToast = useToastStore((state) => state.showToast);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const matchingTag = tags.find((tag) => tag.name.toLowerCase() === trimmedName.toLowerCase());
  const willCreate = Boolean(trimmedName) && !matchingTag && allowCreate;

  const submit = async (event) => {
    event.preventDefault();
    if (!trimmedName || saving) return;
    if (!matchingTag && !allowCreate) {
      showToast(`No tag called "${trimmedName}"`);
      return;
    }

    setSaving(true);
    const tag = matchingTag ?? (await onCreate(trimmedName));
    setSaving(false);
    if (tag) {
      onSelect(tag);
      setName("");
    }
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        list={listId}
        value={name}
        maxLength={TAG_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="input-field py-1 text-sm"
      />
      <datalist id={listId}>
        {tags
          .filter((tag) => !excludeIds.includes(tag.id))
          .map((tag) => (
            <option key={tag.id} value={tag.name} />
          ))}
      </datalist>
      <button
        type="submit"
        disabled={!trimmedName || saving}
        className="px-3 py-1 text-sm rounded-lg bg-accent text-surface hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
      >
        {willCreate ? "Create" : submitLabel}
      </button>
    </form>
  );
}
