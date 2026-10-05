import { useState } from "react";
import BankQuestionFilters from "../components/InterviewPrep/BankQuestionFilters";
import BankQuestionForm from "../components/InterviewPrep/BankQuestionForm";
import BankQuestionSummary from "../components/InterviewPrep/BankQuestionSummary";
import filterBankQuestions from "../components/InterviewPrep/filterBankQuestions";
import useBankQuestions from "../components/InterviewPrep/useBankQuestions";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";

export default function QuestionBank() {
  const { questions, loading, createQuestion, updateQuestion, deleteQuestion } = useBankQuestions();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  // null (closed), "new", or the question being edited
  const [editing, setEditing] = useState(null);
  const visibleQuestions = filterBankQuestions(questions, { category, search });

  const saveQuestion = async (values) => {
    const saved = editing === "new" ? await createQuestion(values) : await updateQuestion(editing, values);
    if (saved) setEditing(null);
  };

  const confirmDelete = (question) => {
    const usedIn =
      question.interviews_count > 0
        ? `Used in ${question.interviews_count} interview${question.interviews_count === 1 ? "" : "s"} — it will be removed from them.\n\n`
        : "";
    if (window.confirm(`${usedIn}Delete "${question.question}"?`)) deleteQuestion(question);
  };

  if (loading) {
    return <PageLoader text="Loading your question bank..." />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 sm:mt-10 sm:px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Question bank</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">Questions you prepare answers for, ready to link into your interviews.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="bg-accent hover:bg-accent-soft text-surface px-5 py-2 rounded-lg transition shadow shrink-0"
        >
          + New question
        </button>
      </div>

      <BankQuestionFilters category={category} search={search} onCategoryChange={setCategory} onSearchChange={setSearch} />

      {visibleQuestions.length === 0 ? (
        <div className="card text-center text-light-muted dark:text-dark-muted">
          {questions.length === 0
            ? "No questions yet. Add one, or save one from an interview's debrief."
            : "No questions match."}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleQuestions.map((question) => (
            <li key={question.id} className="card flex items-start gap-3">
              <BankQuestionSummary question={question} />
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setEditing(question)} className="btn-small">
                  Edit
                </button>
                <button type="button" onClick={() => confirmDelete(question)} className="btn-small-danger">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal title={editing === "new" ? "New question" : "Edit question"} onClose={() => setEditing(null)} maxWidth="max-w-lg">
          <BankQuestionForm
            initialValues={editing === "new" ? undefined : editing}
            submitLabel={editing === "new" ? "Add to bank" : "Save"}
            onSubmit={saveQuestion}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}
