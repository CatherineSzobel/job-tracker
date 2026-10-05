import { useEffect, useState } from "react";
import { confirmAction } from "../../stores/useConfirmStore";
import API from "../../api/axios";
import AddItemInput from "../UI/AddItemInput";
import PageLoader from "../UI/PageLoader";
import RemoveButton from "../UI/RemoveButton";
import { CHECKLIST_ITEM_MAX_LENGTH, TEMPLATE_ITEMS_MAX, TEMPLATE_TYPE_OPTIONS } from "../../constants/interviewPrep";
import { removeAt, replaceAt } from "../../utils/lists";

// Settings section: the checklist every new interview starts with. Changes save straight away (a
// text when its field loses focus); a failed save puts the last saved list back.
export default function PrepTemplateEditor() {
  // Last saved: { items: [{ text, type }], is_default }, or null while loading
  const [template, setTemplate] = useState(null);
  // What's on screen, which may have a text being typed
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/interview-prep-template")
      .then((res) => {
        setTemplate(res.data.data);
        setItems(res.data.data.items);
      })
      .catch((err) => {
        console.error(err);
        setError("Couldn't load your checklist. Please refresh the page.");
      });
  }, []);

  const save = async (nextItems) => {
    const savableItems = nextItems.map((item) => ({ text: item.text.trim(), type: item.type })).filter((item) => item.text);
    setError("");
    setItems(savableItems);
    try {
      const res = await API.put("/interview-prep-template", { items: savableItems });
      setTemplate(res.data.data);
    } catch (err) {
      console.error(err);
      setItems(template.items);
      setError(err.response?.data?.message || "Couldn't save. Please try again.");
    }
  };

  // Leaving a text field saves it, unless nothing changed
  const saveTextIfChanged = () => {
    if (JSON.stringify(items) !== JSON.stringify(template.items)) save(items);
  };

  const resetToDefault = async () => {
    if (!(await confirmAction({ message: "Replace your checklist with the default one?", confirmLabel: "Reset" }))) return;
    setError("");
    try {
      const res = await API.delete("/interview-prep-template");
      setTemplate(res.data.data);
      setItems(res.data.data.items);
    } catch (err) {
      console.error(err);
      setError("Couldn't reset. Please try again.");
    }
  };

  return (
    <section className="settings-section space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Interview prep checklist</h2>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Every new interview starts with these items. Changing them doesn&apos;t affect interviews you&apos;ve already scheduled.
        </p>
      </div>

      {template === null ? (
        !error && <PageLoader text="Loading checklist..." compact />
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                <input
                  value={item.text}
                  onChange={(event) => setItems(replaceAt(items, index, { text: event.target.value }))}
                  onBlur={saveTextIfChanged}
                  maxLength={CHECKLIST_ITEM_MAX_LENGTH}
                  aria-label="Checklist item"
                  className="input-field py-1"
                />
                <select
                  value={item.type ?? ""}
                  onChange={(event) => save(replaceAt(items, index, { type: event.target.value || null }))}
                  aria-label={`Which interviews: ${item.text}`}
                  className="input-field py-1 w-32 shrink-0"
                >
                  {TEMPLATE_TYPE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <RemoveButton label={`Remove: ${item.text}`} onClick={() => save(removeAt(items, index))} />
              </li>
            ))}
          </ul>

          {items.length < TEMPLATE_ITEMS_MAX && (
            <AddItemInput placeholder="Add an item" maxLength={CHECKLIST_ITEM_MAX_LENGTH} onAdd={(text) => save([...items, { text, type: null }])} />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-light-muted dark:text-dark-muted">
              {template.is_default ? "Using the default checklist." : "Using your own checklist."}
            </p>
            {!template.is_default && (
              <button type="button" onClick={resetToDefault} className="btn-small">
                Reset to default
              </button>
            )}
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </section>
  );
}
