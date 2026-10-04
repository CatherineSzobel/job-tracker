import AddItemInput from "../UI/AddItemInput";
import RemoveButton from "../UI/RemoveButton";

// Short texts, each editable in place. renderActions(text, index): extra controls for a row.
export default function EditableList({ items, onChange, placeholder, itemLabel, maxItems, maxLength = 500, renderActions }) {
  const changeItem = (index, text) => onChange(items.map((item, itemIndex) => (itemIndex === index ? text : item)));
  const removeItem = (index) => onChange(items.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(event) => changeItem(index, event.target.value)}
                maxLength={maxLength}
                aria-label={itemLabel}
                className="input-field py-1"
              />
              {renderActions?.(item, index)}
              <RemoveButton label={`Remove: ${item}`} onClick={() => removeItem(index)} />
            </li>
          ))}
        </ul>
      )}
      {items.length < maxItems && (
        <AddItemInput placeholder={placeholder} maxLength={maxLength} onAdd={(text) => onChange([...items, text])} />
      )}
    </div>
  );
}
