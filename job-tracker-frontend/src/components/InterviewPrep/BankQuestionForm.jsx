import { useState } from "react";
import { BANK_QUESTION_CATEGORIES, EMPTY_BANK_QUESTION } from "../../constants/interviewPrep";

// The form's fields from a question (a bank question has extra keys, and its answer may be null)
const toFormValues = (question) => ({
  question: question.question ?? "",
  category: question.category ?? EMPTY_BANK_QUESTION.category,
  answer: question.answer ?? "",
});

// Question, category and answer. onSubmit(values) saves; the parent closes the form when that worked,
// so after a failed save the form is still there with what was entered.
export default function BankQuestionForm({ initialValues = EMPTY_BANK_QUESTION, submitLabel = "Save", onSubmit, onCancel }) {
  const [values, setValues] = useState(() => toFormValues(initialValues));
  const [saving, setSaving] = useState(false);

  const changeField = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    await onSubmit({ question: values.question.trim(), category: values.category, answer: values.answer.trim() || null });
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="bank-question" className="input-label">Question</label>
        <textarea
          id="bank-question"
          name="question"
          rows={2}
          maxLength={500}
          required
          value={values.question}
          onChange={changeField}
          className="input-field resize-none"
        />
      </div>
      <div>
        <label htmlFor="bank-category" className="input-label">Category</label>
        <select id="bank-category" name="category" value={values.category} onChange={changeField} className="input-field">
          {BANK_QUESTION_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bank-answer" className="input-label">Your answer</label>
        <textarea
          id="bank-answer"
          name="answer"
          rows={6}
          maxLength={10000}
          value={values.answer}
          onChange={changeField}
          placeholder="Optional, you can add it later"
          className="input-field"
        />
      </div>
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-small">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !values.question.trim()}
          className="btn-primary"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
