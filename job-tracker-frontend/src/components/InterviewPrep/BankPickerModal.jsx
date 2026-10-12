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
  };

  const addSelected = () => {
    onAdd(selectedIds.map((questionId) => questions.find((question) => question.id === questionId)));
    onClose();
  };

  return (
    <Modal title={creating ? "New question" : "Link answers from your question bank"} onClose={onClose}>
      {creating ? (
        <BankQuestionForm submitLabel="Add to bank" onSubmit={createAndSelect} onCancel={() => setCreating(false)} />
      ) : (
        <div className="flex flex-col gap-4">
          <BankQuestionFilters category={category} search={search} onCategoryChange={setCategory} onSearchChange={setSearch} />

          {loading ? (
            <PageLoader text="Loading your question bank..." compact />
          ) : visibleQuestions.length === 0 ? (
            <p className="text-muted">
              {questions.length === 0 ? "Your bank is empty. Add a new question below." : "No questions match."}
            </p>
          ) : (
            <ul className="flex max-h-80 flex-col divide-y divide-subtle overflow-y-auto rounded-xl border border-line">
              {visibleQuestions.map((question) => {
                const linked = linkedIds.includes(question.id);
                return (
                  <li key={question.id}>
                    <label className="flex min-h-12 cursor-pointer items-start gap-3 px-4 py-3 hover:bg-soft">
                      <input
                        type="checkbox"
                        checked={linked || selectedIds.includes(question.id)}
                        disabled={linked}
                        onChange={() => toggle(question.id)}
                        className="mt-0.5 size-5 shrink-0"
                      />
                      <BankQuestionSummary question={question} showAnswer={false} />
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          {tooMany && (
            <p className="text-sm font-semibold text-danger">An interview can have up to {BANK_LINKS_MAX} bank questions.</p>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={() => setCreating(true)} className="btn-soft min-h-12">
              New question
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={addSelected}
                disabled={selectedIds.length === 0 || tooMany}
                className="btn-primary"
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
