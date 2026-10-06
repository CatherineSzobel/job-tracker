import { useState } from "react";
import API from "../../api/axios";
import AddItemInput from "../UI/AddItemInput";
import RemoveButton from "../UI/RemoveButton";
import { CHECKLIST_ITEM_MAX_LENGTH, PREP_LIMITS } from "../../constants/interviewPrep";
import { useToastStore } from "../../stores/useToastStore";
import { removeAt, replaceAt } from "../../utils/lists";

// items: [{ text, done }]. An empty checklist (interviews from before prep existed, or one that was
// cleared) can be filled from the user's template, filtered by type like the backend does.
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
    <div className="flex flex-col gap-3">
      {items.length > 0 ? (
        <>
          <div>
            <p className="text-sm mb-1 text-light-muted dark:text-dark-muted">
              {doneCount} of {items.length}
            </p>
            <div className="h-2 rounded bg-border dark:bg-dark-subtle">
              <div className="h-2 rounded bg-accent transition-all" style={{ width: `${percentDone}%` }} />
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => changeItem(index, { done: !item.done })}
                  aria-label={`Done: ${item.text}`}
                  className="h-5 w-5 shrink-0 accent-accent"
                />
                <input
                  value={item.text}
                  onChange={(event) => changeItem(index, { text: event.target.value })}
                  maxLength={CHECKLIST_ITEM_MAX_LENGTH}
                  aria-label="Checklist item"
                  className={`input-field py-1 ${item.done ? "line-through text-light-muted dark:text-dark-muted" : ""}`}
                />
                <RemoveButton label={`Remove: ${item.text}`} onClick={() => removeItem(index)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button type="button" onClick={addFromTemplate} disabled={loadingTemplate} className="btn-small self-start disabled:opacity-50">
          {loadingTemplate ? "Loading…" : "Add checklist from template"}
        </button>
      )}
      {items.length < PREP_LIMITS.checklist && (
        <AddItemInput placeholder="Add an item" maxLength={CHECKLIST_ITEM_MAX_LENGTH} onAdd={(text) => onChange([...items, { text, done: false }])} />
      )}
    </div>
  );
}
