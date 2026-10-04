import { useEffect, useState } from "react";
import API from "../../api/axios";
import AddItemInput from "../UI/AddItemInput";
import PageLoader from "../UI/PageLoader";
import RemoveButton from "../UI/RemoveButton";
import { TEMPLATE_ITEMS_MAX, TEMPLATE_TYPE_OPTIONS } from "../../constants/interviewPrep";

const SECTION_CLASSES =
  "bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-4 transition-colors";

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

  const changeItem = (index, changes) =>
    items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...changes } : item));

  // Leaving a text field saves it, unless nothing changed
  const saveTextIfChanged = () => {
    if (JSON.stringify(items) !== JSON.stringify(template.items)) save(items);
  };

  const resetToDefault = async () => {
    if (!window.confirm("Replace your checklist with the default one?")) return;
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
    <section className={SECTION_CLASSES}>
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
                  onChange={(event) => setItems(changeItem(index, { text: event.target.value }))}
                  onBlur={saveTextIfChanged}
                  maxLength={200}
                  aria-label="Checklist item"
                  className="input-field py-1"
                />
                <select
                  value={item.type ?? ""}
                  onChange={(event) => save(changeItem(index, { type: event.target.value || null }))}
                  aria-label={`Which interviews: ${item.text}`}
                  className="input-field py-1 w-32 shrink-0"
                >
                  {TEMPLATE_TYPE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <RemoveButton label={`Remove: ${item.text}`} onClick={() => save(items.filter((_, itemIndex) => itemIndex !== index))} />
              </li>
            ))}
          </ul>

          {items.length < TEMPLATE_ITEMS_MAX && (
            <AddItemInput placeholder="Add an item" maxLength={200} onAdd={(text) => save([...items, { text, type: null }])} />
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
