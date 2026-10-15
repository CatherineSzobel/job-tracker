import { useState } from "react";
import { confirmAction } from "../../stores/useConfirmStore";
import { Trash2 } from "lucide-react";
import Modal from "../UI/Modal";
import TagChip from "./TagChip";
import { TAG_COLORS, TAG_COLOR_CLASSES, TAG_NAME_MAX } from "../../constants/tags";
import { countOf } from "../../utils/plural";

// Create, rename, recolour and delete tags; every change saves straight away.
// onCreate(name) returns the new tag, or null when it failed.
export default function ManageTagsModal({ tags, onCreate, onUpdate, onDelete, onClose }) {
  return (
    <Modal title="Manage tags" onClose={onClose} maxWidth="max-w-lg">
      <NewTagForm onCreate={onCreate} />

      {tags.length === 0 ? (
        <p className="text-muted">
          No tags yet. Create one above, or add one on an application.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-subtle">
          {tags.map((tag) => (
            <ManagedTagRow key={tag.id} tag={tag} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </Modal>
  );
}

// Name + Create; the colour is picked automatically and can be changed below
function NewTagForm({ onCreate }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const trimmedName = name.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!trimmedName || saving) return;
    setSaving(true);
    const tag = await onCreate(trimmedName);
    setSaving(false);
    if (tag) setName("");
  };

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input
        value={name}
        maxLength={TAG_NAME_MAX}
        onChange={(event) => setName(event.target.value)}
        placeholder="New tag…"
        aria-label="New tag name"
        className="input-field min-w-0 flex-1"
      />
      <button
        type="submit"
        disabled={!trimmedName || saving}
        className="btn-primary shrink-0"
      >
        Create
      </button>
    </form>
  );
}

function ManagedTagRow({ tag, onUpdate, onDelete }) {
  const [name, setName] = useState(tag.name);
  const usageCount = tag.applications_count ?? 0;

  const saveName = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === tag.name) {
      setName(tag.name);
      return;
    }
    const saved = await onUpdate(tag, { name: trimmedName });
    if (!saved) setName(tag.name);
  };

  const confirmDelete = async () => {
    const question = usageCount > 0
      ? `Remove "${tag.name}" from ${countOf(usageCount, "application")} and delete it?`
      : `Delete "${tag.name}"?`;
    if (await confirmAction({ message: question, confirmLabel: "Delete", danger: true })) onDelete(tag);
  };

  return (
    <li className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-2">
        <TagChip tag={tag} />
        <input
          value={name}
          maxLength={TAG_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          aria-label={`Rename ${tag.name}`}
          className="input-field min-w-0 flex-1"
        />
        <span className="text-sm whitespace-nowrap text-muted">{usageCount} used</span>
        <button
          type="button"
          onClick={confirmDelete}
          aria-label={`Delete ${tag.name}`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={`Colour for ${tag.name}`}>
        {TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onUpdate(tag, { color })}
            aria-label={color}
            aria-pressed={tag.color === color}
            title={color}
            className={`size-8 rounded-full border border-line ${TAG_COLOR_CLASSES[color]} ${tag.color === color ? "ring-2 ring-accent-text ring-offset-2 ring-offset-surface" : ""}`}
          />
        ))}
      </div>
    </li>
  );
}
