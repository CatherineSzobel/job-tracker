import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import API from "../api/axios";
import Tabs, { TabPanel } from "../components/UI/Tabs";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";
import InterviewForm from "../components/Interview/InterviewForm";
import EditableList from "../components/InterviewPrep/EditableList";
import PeopleList from "../components/InterviewPrep/PeopleList";
import PrepChecklist from "../components/InterviewPrep/PrepChecklist";
import RatingInput from "../components/InterviewPrep/RatingInput";
import SaveStatus from "../components/InterviewPrep/SaveStatus";
import useAutosave, { combineAutosaves } from "../components/InterviewPrep/useAutosave";
import { linksRejectedBy, toSavablePrep } from "../components/InterviewPrep/prepDocument";
import { INTERVIEW_TYPES } from "../constants/jobs";
import { PREP_LIMITS, PREP_TABS } from "../constants/interviewPrep";
import { useToastStore } from "../stores/useToastStore";
import { toDateTimeInputValue } from "../utils/dateInput";

const interviewTypeLabel = (type) => INTERVIEW_TYPES.find((option) => option.value === type)?.label ?? type;
const showToast = (message) => useToastStore.getState().showToast(message);

// Keyed by id: opening another interview starts a fresh page, so a save still waiting goes to the
// interview it was typed on
export default function Interview() {
  const { id } = useParams();
  return <InterviewPage key={id} interviewId={id} />;
}

function InterviewPage({ interviewId }) {
  const [interview, setInterview] = useState(null);
  // The prep document as shown, plus rating and debrief notes (saved together)
  const [prep, setPrep] = useState(null);
  const [notes, setNotes] = useState("");
  // null, "not_found" (404) or "failed" (anything else; the page offers to try again)
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeTab, setActiveTab] = useState("prep");
  // People links the backend turned down; they're held back (with a hint) so the rest still saves
  const [rejectedLinks, setRejectedLinks] = useState([]);
  // The edit dialog's form, or null when it's closed
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // If the only problem is a person's link (e.g. one with a character the backend's URL check refuses),
  // save everything else without those links instead of failing over and over
  const savePrep = async (document) => {
    try {
      await API.put(`/interviews/${interviewId}/prep`, document);
    } catch (err) {
      const badLinks = linksRejectedBy(err, document);
      if (!badLinks) throw err;
      setRejectedLinks((current) => [...current, ...badLinks]);
      await API.put(`/interviews/${interviewId}/prep`, {
        ...document,
        people: document.people.map((person) => (badLinks.includes(person.url) ? { ...person, url: null } : person)),
      });
    }
  };

  const prepAutosave = useAutosave(savePrep);
  const notesAutosave = useAutosave((value) => API.put(`/interviews/${interviewId}`, { notes: value || null }));
  const saveState = combineAutosaves([prepAutosave, notesAutosave]);

  useEffect(() => {
    API.get(`/interviews/${interviewId}`)
      .then((res) => {
        const loaded = res.data.data;
        setInterview(loaded);
        setPrep({ ...loaded.prep, rating: loaded.rating, debrief_notes: loaded.debrief_notes ?? "" });
        setNotes(loaded.notes ?? "");
        setActiveTab(new Date(loaded.interview_date) > new Date() ? "prep" : "debrief");
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

  const updatePrep = (changes) => {
    const nextPrep = { ...prep, ...changes };
    setPrep(nextPrep);
    prepAutosave.schedule(toSavablePrep(nextPrep, rejectedLinks));
  };

  const changeNotes = (event) => {
    setNotes(event.target.value);
    notesAutosave.schedule(event.target.value);
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
      <div className="max-w-3xl mx-auto mt-10 text-center space-y-3">
        <p className="text-light-text dark:text-dark-text">This interview doesn&apos;t exist or was deleted.</p>
        <Link to="/interviews" className="text-accent hover:underline">
          Back to interviews
        </Link>
      </div>
    );
  }

  if (loadError === "failed" && !interview) {
    return (
      <div className="max-w-3xl mx-auto mt-10 text-center space-y-3">
        <p className="text-light-text dark:text-dark-text">Couldn&apos;t load this interview.</p>
        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="btn-small">
          Try again
        </button>
      </div>
    );
  }

  if (!interview) {
    return <PageLoader text="Loading interview..." />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-4 sm:mt-10 sm:px-4 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
            <Link to={`/jobs/${interview.job.id}`} className="hover:underline">
              {interview.job.company_name} · {interview.job.position}
            </Link>
          </h1>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            {format(new Date(interview.interview_date), "EEE d MMM yyyy, HH:mm")} · {interviewTypeLabel(interview.type)} ·{" "}
            {interview.location || "Location TBD"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveStatus status={saveState.status} onRetry={saveState.retry} />
          <button type="button" onClick={startEditing} className="btn-small">
            Edit
          </button>
        </div>
      </header>

      <Tabs tabs={PREP_TABS} activeTab={activeTab} onChange={setActiveTab} idPrefix="interview" label="Interview prep" />

      {activeTab === "prep" ? (
        <TabPanel idPrefix="interview" tabId="prep" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="card-title mb-4">Checklist</h2>
            <PrepChecklist items={prep.checklist} interviewType={interview.type} onChange={(checklist) => updatePrep({ checklist })} />
          </section>

          <section className="card">
            <h2 className="card-title mb-4">People you&apos;re meeting</h2>
            <PeopleList people={prep.people} rejectedLinks={rejectedLinks} onChange={(people) => updatePrep({ people })} />
          </section>

          <section className="card">
            <h2 className="card-title mb-4">Questions to ask them</h2>
            <EditableList
              items={prep.questions_to_ask}
              onChange={(questionsToAsk) => updatePrep({ questions_to_ask: questionsToAsk })}
              placeholder="Add a question"
              itemLabel="Question to ask"
              maxItems={PREP_LIMITS.questionsToAsk}
            />
          </section>

          <section className="card">
            <h2 className="card-title mb-4">Prep notes</h2>
            <textarea
              value={notes}
              onChange={changeNotes}
              rows={8}
              aria-label="Prep notes"
              placeholder="Anything else to remember"
              className="input-field"
            />
          </section>
        </TabPanel>
      ) : (
        <TabPanel idPrefix="interview" tabId="debrief" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="card">
            <h2 className="card-title mb-4">How did it go?</h2>
            <RatingInput value={prep.rating} onChange={(rating) => updatePrep({ rating })} />
            <p className="mt-2 text-xs text-light-muted dark:text-dark-muted">1 = rough, 5 = great. Click your rating again to clear it.</p>
          </section>

          <section className="card">
            <h2 className="card-title mb-4">Questions they asked</h2>
            <EditableList
              items={prep.questions_asked}
              onChange={(questionsAsked) => updatePrep({ questions_asked: questionsAsked })}
              placeholder="Add a question they asked"
              itemLabel="Question they asked"
              maxItems={PREP_LIMITS.questionsAsked}
            />
          </section>

          <section className="card lg:col-span-2">
            <h2 className="card-title mb-4">Debrief notes</h2>
            <textarea
              value={prep.debrief_notes}
              onChange={(event) => updatePrep({ debrief_notes: event.target.value })}
              rows={8}
              maxLength={10000}
              aria-label="Debrief notes"
              placeholder="What went well, what to do differently"
              className="input-field"
            />
          </section>
        </TabPanel>
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
