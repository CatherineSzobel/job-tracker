import { bankCategoryLabel } from "../../constants/interviewPrep";

// A bank question and its category chip. showAnswer: the answer folds out (off inside the picker, where a
// click on the row ticks it)
export default function BankQuestionSummary({ question, showAnswer = true }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <strong className="font-semibold break-words">{question.question}</strong>
        <span className="rounded-full border border-line bg-surface px-2 text-sm text-muted">{bankCategoryLabel(question.category)}</span>
      </div>
      {showAnswer &&
        (question.answer ? (
          <details className="mt-1">
            <summary className="inline-flex min-h-10 cursor-pointer items-center text-sm font-semibold text-accent-text">Show answer</summary>
            <p className="max-w-[72ch] whitespace-pre-wrap">{question.answer}</p>
          </details>
        ) : (
          <p className="mt-1 text-sm text-muted">No answer yet</p>
        ))}
    </div>
  );
}
