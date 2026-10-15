import { useState } from "react";
import { Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import Card from "../UI/Card";
import RemoveButton from "../UI/RemoveButton";
import BankPickerModal from "./BankPickerModal";
import BankQuestionSummary from "./BankQuestionSummary";
import { BANK_LINKS_MAX } from "../../constants/interviewPrep";

// The "Answers from your question bank" card: the bank's current answer plus a note for this interview.
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
    <Card
      title="Answers from your question bank"
      action={
        links.length < BANK_LINKS_MAX && (
          <button type="button" onClick={() => setPicking(true)} className="btn-soft">
            <Link2 size={16} aria-hidden="true" />
            Link answer
          </button>
        )
      }
    >
      {links.length === 0 ? (
        <p className="text-muted">Link questions from your bank to have your prepared answers at hand.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.id} className="flex flex-col gap-2 rounded-xl bg-soft p-4">
              <div className="flex items-start gap-2">
                <BankQuestionSummary question={link} />
                <span className="-mt-2 -mr-2">
                  <RemoveButton label={`Remove "${link.question}" from this interview`} onClick={() => removeLink(link.id)} />
                </span>
              </div>
              <textarea
                value={link.note ?? ""}
                onChange={(event) => changeNote(link.id, event.target.value)}
                maxLength={2000}
                rows={2}
                placeholder="Note for this interview"
                aria-label={`Note for: ${link.question}`}
                className="input-field"
              />
            </li>
          ))}
        </ul>
      )}
      <Link to="/question-bank" className="self-start text-sm font-semibold text-accent-text hover:underline">
        Edit answers in the question bank →
      </Link>
      {picking && <BankPickerModal linkedIds={links.map((link) => link.id)} onAdd={addQuestions} onClose={() => setPicking(false)} />}
    </Card>
  );
}
