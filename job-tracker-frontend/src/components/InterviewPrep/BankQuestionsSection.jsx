import { useState } from "react";
import { Link } from "react-router-dom";
import RemoveButton from "../UI/RemoveButton";
import BankPickerModal from "./BankPickerModal";
import BankQuestionSummary from "./BankQuestionSummary";
import { BANK_LINKS_MAX } from "../../constants/interviewPrep";

// Bank questions linked to this interview: the bank's current answer plus a note for this interview.
// links: [{ id, question, answer, category, note }]
export default function BankQuestionsSection({ links, onChange }) {
  const [picking, setPicking] = useState(false);

  const changeNote = (questionId, note) => onChange(links.map((link) => (link.id === questionId ? { ...link, note } : link)));
  const removeLink = (questionId) => onChange(links.filter((link) => link.id !== questionId));
  const addQuestions = (questions) =>
    onChange([
      ...links,
      ...questions.map(({ id, question, answer, category }) => ({ id, question, answer, category, note: "" })),
    ]);

  return (
    <div className="flex flex-col gap-4">
      {links.length === 0 ? (
        <p className="text-sm text-light-muted dark:text-dark-muted">Link questions from your bank to have your prepared answers at hand.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {links.map((link) => (
            <li key={link.id} className="flex flex-col gap-2 pb-4 border-b last:border-b-0 border-border dark:border-dark-subtle">
              <div className="flex items-start gap-2">
                <BankQuestionSummary question={link} />
                <RemoveButton label={`Remove "${link.question}" from this interview`} onClick={() => removeLink(link.id)} />
              </div>
              <textarea
                value={link.note ?? ""}
                onChange={(event) => changeNote(link.id, event.target.value)}
                maxLength={2000}
                rows={2}
                placeholder="Note for this interview"
                aria-label={`Note for: ${link.question}`}
                className="input-field text-sm"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {links.length < BANK_LINKS_MAX && (
          <button type="button" onClick={() => setPicking(true)} className="btn-small">
            Add from bank
          </button>
        )}
        <Link to="/question-bank" className="text-sm text-accent dark:text-accent-muted hover:underline">
          Edit answers in the question bank →
        </Link>
      </div>
      {picking && <BankPickerModal linkedIds={links.map((link) => link.id)} onAdd={addQuestions} onClose={() => setPicking(false)} />}
    </div>
  );
}
