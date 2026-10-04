import { useState } from "react";
import Modal from "../UI/Modal";
import PageLoader from "../UI/PageLoader";
import BankQuestionFilters from "./BankQuestionFilters";
import BankQuestionForm from "./BankQuestionForm";
import BankQuestionSummary from "./BankQuestionSummary";
import filterBankQuestions from "./filterBankQuestions";
import useBankQuestions from "./useBankQuestions";
import { BANK_LINKS_MAX } from "../../constants/interviewPrep";

// Pick bank questions to link. Already linked ones show ticked and can't be unticked here (remove
// them on the interview page). "New question" adds one to the bank and ticks it.
export default function BankPickerModal({ linkedIds, onAdd, onClose }) {
  const { questions, loading, createQuestion } = useBankQuestions();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [creating, setCreating] = useState(false);
  const visibleQuestions = filterBankQuestions(questions, { category, search });
  const tooMany = linkedIds.length + selectedIds.length > BANK_LINKS_MAX;

  const toggle = (questionId) =>
    setSelectedIds((current) =>
      current.includes(questionId) ? current.filter((selectedId) => selectedId !== questionId) : [...current, questionId]
    );

  const createAndSelect = async (values) => {
    const saved = await createQuestion(values);
    if (saved) {
      setSelectedIds((current) => [...current, saved.id]);
      setCreating(false);
    }
    return saved;
  };

  const addSelected = () => {
    onAdd(selectedIds.map((questionId) => questions.find((question) => question.id === questionId)));
    onClose();
  };

  return (
    <Modal title={creating ? "New question" : "Add from your question bank"} onClose={onClose} maxWidth="max-w-xl">
      {creating ? (
        <BankQuestionForm submitLabel="Add to bank" onSubmit={createAndSelect} onCancel={() => setCreating(false)} />
      ) : (
        <div className="space-y-4">
          <BankQuestionFilters category={category} search={search} onCategoryChange={setCategory} onSearchChange={setSearch} />

          {loading ? (
            <PageLoader text="Loading your question bank..." compact />
          ) : visibleQuestions.length === 0 ? (
            <p className="text-sm text-light-muted dark:text-dark-muted">
              {questions.length === 0 ? "Your bank is empty. Add a new question below." : "No questions match."}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto flex flex-col gap-1">
              {visibleQuestions.map((question) => {
                const linked = linkedIds.includes(question.id);
                return (
                  <li key={question.id}>
                    <label className="flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-light dark:hover:bg-dark-subtle">
                      <input
                        type="checkbox"
                        checked={linked || selectedIds.includes(question.id)}
                        disabled={linked}
                        onChange={() => toggle(question.id)}
                        className="mt-1 h-4 w-4 accent-accent"
                      />
                      <BankQuestionSummary question={question} showAnswer={false} />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {tooMany && (
            <p className="text-sm text-red-500 dark:text-red-400">An interview can have up to {BANK_LINKS_MAX} bank questions.</p>
          )}

          <div className="flex flex-wrap justify-between gap-3">
            <button type="button" onClick={() => setCreating(true)} className="btn-small">
              New question
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-small">
                Cancel
              </button>
              <button
                type="button"
                onClick={addSelected}
                disabled={selectedIds.length === 0 || tooMany}
                className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
              >
                Add{selectedIds.length > 0 ? ` ${selectedIds.length}` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
