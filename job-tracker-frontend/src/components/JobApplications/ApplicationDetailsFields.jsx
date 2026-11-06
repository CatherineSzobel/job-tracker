import { APPLICATION_SOURCES, CURRENCIES, DEFAULT_CURRENCY } from "../../constants/jobs";

const optional = <span className="font-normal text-muted">(optional)</span>;

// The optional application details as inputs: source, deadline, salary range with currency, and a contact
// person. values: the application (or the new one); onChange: an input change event, as with the other fields
// (each input's name is the field). idPrefix keeps the ids unique when two forms are on a page. form: the id of
// the <form> the inputs belong to when they sit outside it (the detail page), so Enter and its checks apply.
// Columns wrap by the space available, so it fits both the Add dialog and the detail page's side column.
export default function ApplicationDetailsFields({ values, onChange, idPrefix, form }) {
  const id = (field) => `${idPrefix}-${field}`;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-4">
      <div>
        <label htmlFor={id("source")} className="input-label">
          Found via {optional}
        </label>
        <select id={id("source")} name="source" form={form} value={values.source ?? ""} onChange={onChange} className="input-field">
          <option value="">Not set</option>
          {APPLICATION_SOURCES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={id("deadline")} className="input-label">
          Apply by {optional}
        </label>
        <input
          id={id("deadline")}
          type="date"
          name="deadline"
          form={form}
          value={values.deadline ?? ""}
          onChange={onChange}
          className="input-field"
        />
      </div>

      <fieldset className="col-span-full">
        <legend className="input-label">Salary range {optional}</legend>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
          <input
            type="number"
            name="salary_min"
            form={form}
            min="0"
            inputMode="numeric"
            placeholder="From"
            aria-label="Salary from"
            value={values.salary_min ?? ""}
            onChange={onChange}
            className="input-field"
          />
          <input
            type="number"
            name="salary_max"
            form={form}
            min={values.salary_min || "0"}
            inputMode="numeric"
            placeholder="To"
            aria-label="Salary to"
            value={values.salary_max ?? ""}
            onChange={onChange}
            className="input-field"
          />
          <select
            name="salary_currency"
            form={form}
            aria-label="Currency"
            value={values.salary_currency ?? DEFAULT_CURRENCY}
            onChange={onChange}
            className="input-field w-auto"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <div>
        <label htmlFor={id("contact-name")} className="input-label">
          Contact person {optional}
        </label>
        <input
          id={id("contact-name")}
          type="text"
          name="contact_name"
          form={form}
          autoComplete="off"
          value={values.contact_name ?? ""}
          onChange={onChange}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor={id("contact-details")} className="input-label">
          Their email or link {optional}
        </label>
        <input
          id={id("contact-details")}
          type="text"
          name="contact_details"
          form={form}
          autoComplete="off"
          placeholder="name@company.com or https://…"
          value={values.contact_details ?? ""}
          onChange={onChange}
          className="input-field"
        />
      </div>
    </div>
  );
}
