import { bankCategoryLabel } from "../../constants/interviewPrep";

// A bank question and its category. showAnswer: the answer folds out (off inside the picker, where a
// click on the row ticks it)
export default function BankQuestionSummary({ question, showAnswer = true }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-medium break-words text-light-text dark:text-dark-text">{question.question}</p>
        <span className="px-2 py-0.5 rounded-full text-xs bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted">
          {bankCategoryLabel(question.category)}
        </span>
      </div>
      {showAnswer &&
        (question.answer ? (
          <details className="mt-1 text-sm">
            <summary className="cursor-pointer text-accent dark:text-accent-muted">Show answer</summary>
            <p className="mt-1 whitespace-pre-wrap text-light-text dark:text-dark-text">{question.answer}</p>
          </details>
        ) : (
          <p className="mt-1 text-sm text-light-muted dark:text-dark-muted">No answer yet</p>
        ))}
    </div>
  );
}
