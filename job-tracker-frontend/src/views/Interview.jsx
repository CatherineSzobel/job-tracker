import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { differenceInCalendarDays, format } from "date-fns";
import { Check, ChevronLeft, Pencil } from "lucide-react";
import API from "../api/axios";
import Tabs, { TabPanel } from "../components/UI/Tabs";
import Card from "../components/UI/Card";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";
import InterviewForm from "../components/Interview/InterviewForm";
import BankQuestionForm from "../components/InterviewPrep/BankQuestionForm";
import BankQuestionsSection from "../components/InterviewPrep/BankQuestionsSection";
import EditableList from "../components/InterviewPrep/EditableList";
import PeopleList from "../components/InterviewPrep/PeopleList";
import PrepChecklist from "../components/InterviewPrep/PrepChecklist";
import RatingInput from "../components/InterviewPrep/RatingInput";
import SaveStatus from "../components/InterviewPrep/SaveStatus";
import useAutosave, { combineAutosaves } from "../components/InterviewPrep/useAutosave";
import { createBankQuestion } from "../components/InterviewPrep/useBankQuestions";
import { normaliseQuestion, toSavablePrep } from "../components/InterviewPrep/prepDocument";
import { interviewTypeLabel } from "../constants/jobs";
import { BANK_LINKS_MAX, EMPTY_BANK_QUESTION, PREP_LIMITS, PREP_TABS } from "../constants/interviewPrep";
import { usePageTitleStore } from "../stores/usePageTitleStore";
import { useToastStore } from "../stores/useToastStore";
import { toDateTimeInputValue } from "../utils/dateInput";

const showToast = (message) => useToastStore.getState().showToast(message);

// The pill above the title: "Today", "Tomorrow", "In 5 days", or "Done" once it's over
const whenPill = (date) => {
  if (date < new Date()) return { label: "Done", classes: "bg-subtle text-muted-2" };
  const days = differenceInCalendarDays(date, new Date());
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
  return { label, classes: "bg-accent text-white" };
};

// Keyed by id: opening another interview starts a fresh page, so a save still waiting goes to the
// interview it was typed on
export default function Interview() {
  const { id } = useParams();
  return <InterviewPage key={id} interviewId={id} />;
}

function InterviewPage({ interviewId }) {
  const { pathname } = useLocation();
  // ?tab=prep or ?tab=debrief: the tab a link asked for ("Open prep", "Open debrief")
  const [searchParams] = useSearchParams();
  // Read once: the page is keyed by interview, and switching tabs afterwards doesn't touch the URL
  const requestedTab = useRef(PREP_TABS.some((tab) => tab.id === searchParams.get("tab")) ? searchParams.get("tab") : null);
  const setPageTitle = usePageTitleStore((state) => state.setPageTitle);
  const [interview, setInterview] = useState(null);
  // The prep document as shown, plus rating and debrief notes (saved together)
  const [prep, setPrep] = useState(null);
  const [notes, setNotes] = useState("");
  // null, "not_found" (404) or "failed" (anything else; the page offers to try again)
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeTab, setActiveTab] = useState("prep");
  // The edit dialog's form, or null when it's closed
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  // Linked bank questions: [{ id, question, answer, category, note }]
  const [bankLinks, setBankLinks] = useState([]);
  // The question text being saved to the bank from the debrief, or null
  const [savingToBank, setSavingToBank] = useState(null);
  // The latest prep and bank links, so a change that lands after a request (the template loading,
  // a question saved to the bank) builds on what's on screen now, not on what was there when it started
  const latestPrep = useRef(null);
  const latestBankLinks = useRef([]);

  const showPrep = (nextPrep) => {
    latestPrep.current = nextPrep;
    setPrep(nextPrep);
  };

  const showBankLinks = (nextLinks) => {
    latestBankLinks.current = nextLinks;
    setBankLinks(nextLinks);
  };

  const prepAutosave = useAutosave((document) => API.put(`/interviews/${interviewId}/prep`, document));
  const notesAutosave = useAutosave((value) => API.put(`/interviews/${interviewId}`, { notes: value || null }));

  // A 422 means a linked question no longer exists (e.g. deleted on the bank page in another tab):
  // show what's really linked now instead of retrying the same list forever
  const saveBankLinks = async (links) => {
    try {
      await API.put(`/interviews/${interviewId}/bank-questions`, {
        questions: links.map((link) => ({ id: link.id, note: link.note?.trim() || null })),
      });
    } catch (err) {
      if (err.response?.status !== 422) throw err;
      const res = await API.get(`/interviews/${interviewId}`);
      showBankLinks(res.data.data.bank_questions);
      showToast("A linked question was deleted elsewhere, so the list was reloaded");
    }
  };

  const bankAutosave = useAutosave(saveBankLinks);
  const saveState = combineAutosaves([prepAutosave, notesAutosave, bankAutosave]);

  useEffect(() => {
    API.get(`/interviews/${interviewId}`)
      .then((res) => {
        const loaded = res.data.data;
        setInterview(loaded);
        showPrep({ ...loaded.prep, rating: loaded.rating, debrief_notes: loaded.debrief_notes });
        setNotes(loaded.notes ?? "");
        showBankLinks(loaded.bank_questions ?? []);
        // Without a requested tab: Prep before the interview, Debrief once it has started
        setActiveTab(requestedTab.current ?? (new Date(loaded.interview_date) > new Date() ? "prep" : "debrief"));
        setLoadError(null);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 404) {
          setLoadError("not_found");
        } else {
          setLoadError("failed");
          showToast("Couldn't load this interview");
        }
      });
  }, [interviewId, loadAttempt]);

  // The breadcrumb shows the company instead of "Interview prep"
  const companyName = interview?.job?.company_name;
  useEffect(() => {
    if (companyName) setPageTitle(pathname, companyName);
  }, [pathname, companyName, setPageTitle]);

  const updatePrep = (changes) => {
    const nextPrep = { ...latestPrep.current, ...changes };
    showPrep(nextPrep);
    prepAutosave.schedule(toSavablePrep(nextPrep));
  };

  const changeNotes = (event) => {
    setNotes(event.target.value);
    notesAutosave.schedule(event.target.value);
  };

  const updateBankLinks = (nextLinks) => {
    showBankLinks(nextLinks);
    bankAutosave.schedule(nextLinks);
  };

  // A question they asked counts as in the bank when one with the same text is linked here
  const linkedQuestionTexts = bankLinks.map((link) => normaliseQuestion(link.question));

  const saveToBank = async (values) => {
    const saved = await createBankQuestion(values);
    if (!saved) return;
    updateBankLinks([...latestBankLinks.current, { ...saved, note: "" }]);
    setSavingToBank(null);
  };

  // Next to a question they asked: "✓ In bank" when it's linked here, otherwise a Save to bank button
  const bankActionFor = (question) => {
    if (!question.trim()) return null;
    if (linkedQuestionTexts.includes(normaliseQuestion(question))) {
      return (
        <span className="inline-flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-offer-fg">
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          In bank
        </span>
      );
    }
    if (bankLinks.length >= BANK_LINKS_MAX) return null;
    return (
      <button type="button" onClick={() => setSavingToBank(question.trim())} className="btn-soft whitespace-nowrap">
        Save to bank
      </button>
    );
  };

  const startEditing = () =>
    setEditForm({
      job_id: interview.job_application_id,
      type: interview.type ?? "",
      interview_date: toDateTimeInputValue(interview.interview_date),
      location: interview.location ?? "",
      notes,
    });

  const changeEditForm = (event) => setEditForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveEdit = async (event) => {
    event.preventDefault();
    setSavingEdit(true);
    try {
      const res = await API.put(`/interviews/${interviewId}`, {
        type: editForm.type || "online",
        interview_date: editForm.interview_date,
        location: editForm.location,
        notes: editForm.notes || null,
      });
      setInterview(res.data.data);
      setNotes(res.data.data.notes ?? "");
      setEditForm(null);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save the interview");
    } finally {
      setSavingEdit(false);
    }
  };


  if (loadError === "not_found") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>This interview doesn&apos;t exist or was deleted.</p>
        <Link to="/interviews" className="font-semibold text-accent-text hover:underline">
          Back to interviews
        </Link>
      </div>
    );
  }

  if (loadError === "failed") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p>Couldn&apos;t load this interview.</p>
        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="btn-secondary">
          Try again
        </button>
      </div>
    );
  }

  if (!interview) {
    return <PageLoader text="Loading interview..." />;
  }

  const interviewDate = new Date(interview.interview_date);
  const pill = whenPill(interviewDate);

  return (
    <div className="flex flex-col gap-6">
      {/* Phones have no breadcrumb */}
      <Link to="/interviews" className="inline-flex min-h-10 items-center gap-1 self-start font-semibold text-accent-text lg:hidden">
        <ChevronLeft size={16} aria-hidden="true" />
        All interviews
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className={`self-start rounded-full px-2.5 text-sm/6 font-semibold ${pill.classes}`}>{pill.label}</p>
          <h1 className="page-title break-words">
            {interview.job.company_name} · {interview.job.position}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted">
            <span>{format(interviewDate, "EEE d MMM yyyy, HH:mm")}</span>
            <span>{interviewTypeLabel(interview.type)}</span>
            <span>{interview.location || "Location to be confirmed"}</span>
            <Link to={`/jobs/${interview.job.id}`} className="font-semibold text-accent-text hover:underline">
              View application
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SaveStatus status={saveState.status} onRetry={saveState.retry} />
          <button type="button" onClick={startEditing} className="btn-secondary">
            <Pencil size={16} aria-hidden="true" />
            Edit
          </button>
        </div>
      </header>

      <Tabs tabs={PREP_TABS} activeTab={activeTab} onChange={setActiveTab} idPrefix="interview" label="Interview sections" className="self-start" />

      {activeTab === "prep" ? (
        <TabPanel idPrefix="interview" tabId="prep" className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[3_1_480px] flex-col gap-6">
            <PrepChecklist items={prep.checklist} interviewType={interview.type} onChange={(checklist) => updatePrep({ checklist })} />

            <Card title="Questions to ask them">
              <EditableList
                items={prep.questions_to_ask}
                onChange={(questionsToAsk) => updatePrep({ questions_to_ask: questionsToAsk })}
                placeholder="Add a question…"
                itemLabel="Question to ask"
                maxItems={PREP_LIMITS.questionsToAsk}
                numbered
              />
            </Card>

            <BankQuestionsSection links={bankLinks} onChange={updateBankLinks} />
          </div>

          <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-6">
            <PeopleList people={prep.people} onChange={(people) => updatePrep({ people })} />

            <Card title="Prep notes">
              <textarea
                value={notes}
                onChange={changeNotes}
                rows={6}
                aria-label="Prep notes"
                placeholder="Anything else to remember"
                className="input-field resize-y"
              />
            </Card>
          </div>
        </TabPanel>
      ) : (
        <TabPanel idPrefix="interview" tabId="debrief" className="flex max-w-[800px] flex-col gap-6">
          <Card title="How did it go?">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Rating</span>
              <RatingInput value={prep.rating} onChange={(rating) => updatePrep({ rating })} />
              <p className="text-sm text-muted">1 = rough, 5 = great. Click your rating again to clear it.</p>
            </div>
            <div>
              <label htmlFor="debrief-notes" className="input-label">
                Debrief notes
              </label>
              <textarea
                id="debrief-notes"
                value={prep.debrief_notes ?? ""}
                onChange={(event) => updatePrep({ debrief_notes: event.target.value })}
                rows={6}
                maxLength={10000}
                placeholder="What went well, what to work on next time"
                className="input-field resize-y"
              />
            </div>
            <p className="text-sm text-muted">Changes save as you type.</p>
          </Card>

          <Card title="Questions they asked">
            <EditableList
              items={prep.questions_asked}
              onChange={(questionsAsked) => updatePrep({ questions_asked: questionsAsked })}
              placeholder="Add a question they asked…"
              itemLabel="Question they asked"
              maxItems={PREP_LIMITS.questionsAsked}
              renderActions={bankActionFor}
            />
          </Card>
        </TabPanel>
      )}

      {savingToBank !== null && (
        <Modal title="Save to your question bank" onClose={() => setSavingToBank(null)}>
          <BankQuestionForm
            initialValues={{ ...EMPTY_BANK_QUESTION, question: savingToBank }}
            submitLabel="Save to bank"
            onSubmit={saveToBank}
            onCancel={() => setSavingToBank(null)}
          />
        </Modal>
      )}

      {editForm && (
        <Modal title="Edit interview" onClose={() => setEditForm(null)}>
          <InterviewForm
            handleSubmit={saveEdit}
            handleChange={changeEditForm}
            saving={savingEdit}
            newInterview={editForm}
            jobs={[interview.job]}
            editingInterview={interview}
            lockJob
            onCancel={() => setEditForm(null)}
          />
        </Modal>
      )}
    </div>
  );
}
