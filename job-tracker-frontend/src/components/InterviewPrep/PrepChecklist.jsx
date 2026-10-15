import { useState } from "react";
import API from "../../api/axios";
import AddItemInput from "../UI/AddItemInput";
import Card from "../UI/Card";
import RemoveButton from "../UI/RemoveButton";
import { INLINE_FIELD_CLASSES } from "./EditableList";
import { CHECKLIST_ITEM_MAX_LENGTH, PREP_LIMITS } from "../../constants/interviewPrep";
import { useToastStore } from "../../stores/useToastStore";
import { removeAt, replaceAt } from "../../utils/lists";

// The Checklist card. items: [{ text, done }]. An empty checklist (interviews from before prep existed, or one
// that was cleared) can be filled from the user's template, filtered by type like the backend does.
export default function PrepChecklist({ items, interviewType, onChange }) {
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const doneCount = items.filter((item) => item.done).length;
  const percentDone = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const changeItem = (index, changes) => onChange(replaceAt(items, index, changes));
  const removeItem = (index) => onChange(removeAt(items, index));

  const addFromTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const res = await API.get("/interview-prep-template");
      onChange(
        res.data.data.items
          .filter((item) => item.type === null || item.type === interviewType)
          .map((item) => ({ text: item.text, done: false }))
      );
    } catch (err) {
      console.error(err);
      useToastStore.getState().showToast("Couldn't load your checklist template");
    } finally {
      setLoadingTemplate(false);
    }
  };

  return (
    <Card
      title="Checklist"
      action={items.length > 0 && <span className="font-semibold text-muted">{doneCount} of {items.length} done</span>}
    >
      {items.length > 0 ? (
        <>
          <div
            role="progressbar"
            aria-label="Checklist progress"
            aria-valuenow={doneCount}
            aria-valuemin={0}
            aria-valuemax={items.length}
            className="h-2 overflow-hidden rounded-full bg-accent-soft"
          >
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${percentDone}%` }} />
          </div>
          <ul className="flex flex-col divide-y divide-subtle">
            {items.map((item, index) => (
              <li key={index} className="flex min-h-12 items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => changeItem(index, { done: !item.done })}
                  aria-label={`Done: ${item.text}`}
                  className="size-5 shrink-0 cursor-pointer"
                />
                <input
                  value={item.text}
                  onChange={(event) => changeItem(index, { text: event.target.value })}
                  maxLength={CHECKLIST_ITEM_MAX_LENGTH}
                  aria-label="Checklist item"
                  className={`${INLINE_FIELD_CLASSES} ${item.done ? "text-muted line-through" : ""}`}
                />
                <RemoveButton label={`Remove: ${item.text}`} onClick={() => removeItem(index)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button type="button" onClick={addFromTemplate} disabled={loadingTemplate} className="btn-soft self-start">
          {loadingTemplate ? "Loading…" : "Add checklist from template"}
        </button>
      )}
      {items.length < PREP_LIMITS.checklist && (
        <AddItemInput placeholder="Add an item…" maxLength={CHECKLIST_ITEM_MAX_LENGTH} onAdd={(text) => onChange([...items, { text, done: false }])} />
      )}
    </Card>
  );
}
