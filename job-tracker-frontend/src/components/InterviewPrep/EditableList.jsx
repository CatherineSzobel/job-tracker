import AddItemInput from "../UI/AddItemInput";
import RemoveButton from "../UI/RemoveButton";
import { removeAt, replaceAt } from "../../utils/lists";

// A text that reads like plain text and becomes a field on hover and focus (edited in place)
export const INLINE_FIELD_CLASSES = "input-field border-transparent bg-transparent px-2 hover:border-line focus:border-accent";

// Short texts, each editable in place. renderActions(text, index): extra controls for a row.
// numbered: show 1., 2., … before each row (an ordered list).
export default function EditableList({ items, onChange, placeholder, itemLabel, maxItems, maxLength = 500, renderActions, numbered = false }) {
  const ListTag = numbered ? "ol" : "ul";

  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 && (
        <ListTag className="flex flex-col divide-y divide-subtle">
          {items.map((item, index) => (
            <li key={index} className="flex min-h-12 items-center gap-2 py-1">
              {numbered && <span className="w-6 shrink-0 text-right font-semibold text-muted tabular-nums">{index + 1}.</span>}
              <input
                value={item}
                onChange={(event) => onChange(replaceAt(items, index, event.target.value))}
                maxLength={maxLength}
                aria-label={itemLabel}
                className={INLINE_FIELD_CLASSES}
              />
              {renderActions?.(item, index)}
              <RemoveButton label={`Remove: ${item}`} onClick={() => onChange(removeAt(items, index))} />
            </li>
          ))}
        </ListTag>
      )}
      {items.length < maxItems && (
        <AddItemInput placeholder={placeholder} maxLength={maxLength} onAdd={(text) => onChange([...items, text])} />
      )}
    </div>
  );
}
