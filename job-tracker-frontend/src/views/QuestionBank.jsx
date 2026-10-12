import { useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { confirmAction } from "../stores/useConfirmStore";
import BankQuestionFilters from "../components/InterviewPrep/BankQuestionFilters";
import BankQuestionForm from "../components/InterviewPrep/BankQuestionForm";
import filterBankQuestions from "../components/InterviewPrep/filterBankQuestions";
import useBankQuestions from "../components/InterviewPrep/useBankQuestions";
import Modal from "../components/UI/Modal";
import PageHeader from "../components/UI/PageHeader";
import PageLoader from "../components/UI/PageLoader";
import { BANK_QUESTION_CATEGORIES, bankCategoryLabel } from "../constants/interviewPrep";
import { countOf } from "../utils/plural";

export default function QuestionBank() {
  const { questions, loading, createQuestion, updateQuestion, deleteQuestion } = useBankQuestions();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  // null (closed), "new", or the question being edited
  const [editing, setEditing] = useState(null);
  // Ids of the questions whose answer is open
  const [openIds, setOpenIds] = useState([]);
  const visibleQuestions = filterBankQuestions(questions, { category, search });
  const categoryCounts = {
    all: questions.length,
    ...Object.fromEntries(BANK_QUESTION_CATEGORIES.map(({ value }) => [value, questions.filter((question) => question.category === value).length])),
  };

  const toggleOpen = (questionId) =>
    setOpenIds((current) => (current.includes(questionId) ? current.filter((openId) => openId !== questionId) : [...current, questionId]));

  const saveQuestion = async (values) => {
    const saved = editing === "new" ? await createQuestion(values) : await updateQuestion(editing, values);
    if (saved) setEditing(null);
  };

  const confirmDelete = async (question) => {
    const usedIn =
      question.interviews_count > 0
        ? `Used in ${countOf(question.interviews_count, "interview")} — it will be removed from them.\n\n`
        : "";
    if (await confirmAction({ message: `${usedIn}Delete "${question.question}"?`, confirmLabel: "Delete", danger: true })) deleteQuestion(question);
  };

  if (loading) {
    return <PageLoader text="Loading your question bank..." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <PageHeader
        title="Question bank"
        description="Write your answers once, then link them into any interview's prep."
        actions={
          <button type="button" onClick={() => setEditing("new")} className="btn-primary">
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            New question
          </button>
        }
      />

      <BankQuestionFilters category={category} search={search} onCategoryChange={setCategory} onSearchChange={setSearch} counts={categoryCounts} />

      {visibleQuestions.length === 0 ? (
        <p className="text-muted">
          {questions.length === 0 ? "No questions yet. Add one, or save one from an interview's debrief." : "No questions match."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleQuestions.map((question) => {
            const isOpen = openIds.includes(question.id);
            const answerId = `bank-answer-${question.id}`;
            return (
              <li key={question.id} className="rounded-2xl border border-line bg-surface">
                <div className="flex items-start gap-1 py-2 pr-2">
                  <button
                    type="button"
                    onClick={() => toggleOpen(question.id)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pr-2 pl-4 text-left sm:pl-6"
                  >
                    <ChevronRight
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 text-accent-text transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-semibold break-words">{question.question}</span>
                      <span className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <span className="rounded-full bg-subtle px-2 font-semibold text-muted-2">{bankCategoryLabel(question.category)}</span>
                        {question.interviews_count > 0 ? `Linked to ${countOf(question.interviews_count, "interview")}` : "Not linked yet"}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => setEditing(question)} aria-label={`Edit "${question.question}"`} title="Edit" className="btn-icon-sm mt-2">
                    <Pencil size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmDelete(question)}
                    aria-label={`Delete "${question.question}"`}
                    title="Delete"
                    className="mt-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
                {isOpen && (
                  <div id={answerId} className="px-4 pb-6 sm:pr-6 sm:pl-14">
                    {question.answer ? (
                      <p className="max-w-[72ch] rounded-xl bg-soft p-4 whitespace-pre-wrap">{question.answer}</p>
                    ) : (
                      <p className="rounded-xl bg-soft p-4 text-muted">No answer yet. Use Edit to write one.</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <Modal title={editing === "new" ? "New question" : "Edit question"} onClose={() => setEditing(null)}>
          <BankQuestionForm
            initialValues={editing === "new" ? undefined : editing}
            submitLabel={editing === "new" ? "Add to bank" : "Save changes"}
            onSubmit={saveQuestion}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
