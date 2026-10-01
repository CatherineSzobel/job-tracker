import { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "../UI/Modal";
import TagChip from "./TagChip";
import { TAG_COLORS, TAG_COLOR_CLASSES, TAG_NAME_MAX } from "../../constants/tags";

// Rename, recolour and delete tags; every change saves straight away.
export default function ManageTagsModal({ tags, onUpdate, onDelete, onClose }) {
  return (
    <Modal title="Manage tags" onClose={onClose} maxWidth="max-w-lg">
      {tags.length === 0 ? (
        <p className="text-sm text-light-muted dark:text-dark-muted">
          No tags yet. Add one on an application or from the selection bar.
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {tags.map((tag) => (
            <ManagedTagRow key={tag.id} tag={tag} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </Modal>
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

  const confirmDelete = () => {
    const question = usageCount > 0
      ? `Remove "${tag.name}" from ${usageCount} application${usageCount === 1 ? "" : "s"} and delete it?`
      : `Delete "${tag.name}"?`;
    if (window.confirm(question)) onDelete(tag);
  };

  return (
    <li className="flex flex-col gap-2">
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
          className="input-field py-1 text-sm flex-1 min-w-0"
        />
        <span className="text-xs text-light-muted dark:text-dark-muted whitespace-nowrap">{usageCount} used</span>
        <button
          type="button"
          onClick={confirmDelete}
          aria-label={`Delete ${tag.name}`}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-full transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-1" role="group" aria-label={`Colour for ${tag.name}`}>
        {TAG_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onUpdate(tag, { color })}
            aria-label={color}
            aria-pressed={tag.color === color}
            className={`w-6 h-6 rounded-full ${TAG_COLOR_CLASSES[color]} ${tag.color === color ? "ring-2 ring-accent ring-offset-1" : ""}`}
          />
        ))}
      </div>
    </li>
  );
}
