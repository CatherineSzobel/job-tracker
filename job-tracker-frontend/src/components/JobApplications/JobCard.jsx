import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { PRIORITY_CLASSES, STATUS_COLORS } from "../../constants/jobs";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useToastStore } from "../../stores/useToastStore";
import CardTags from "../Tags/CardTags";
import ArchiveTodosPrompt from "./ArchiveTodosPrompt";

// onRemove(id) is called after the job is archived or deleted so the parent can drop it
export default function JobCard({ job, onRemove }) {
  const navigate = useNavigate();
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const showToast = useToastStore((state) => state.showToast);
  const [askingAboutTodos, setAskingAboutTodos] = useState(false);

  // deleteOpenTodos: the user's answer, or undefined to let the server follow their setting
  const archive = async (deleteOpenTodos) => {
    try {
      await API.put(`/job-applications/${job.id}`, {
        is_archived: true,
        ...(deleteOpenTodos === undefined ? {} : { delete_open_todos: deleteOpenTodos }),
      });
      onRemove?.(job.id);
    } catch (err) {
      console.error(err);
      showToast("Failed to archive job");
    }
  };

  const handleArchive = async () => {
    if (job.open_todos_count > 0) {
      try {
        const settings = await loadSettings();
        if (settings.archive_todos === "ask") {
          setAskingAboutTodos(true);
          return;
        }
      } catch (err) {
        // Can't read the setting: ask rather than guess
        console.error(err);
        setAskingAboutTodos(true);
        return;
      }
    }
    archive();
  };

  const answerTodosPrompt = async (deleteOpenTodos, remember) => {
    setAskingAboutTodos(false);
    if (remember) {
      try {
        await updateSettings({ archive_todos: deleteOpenTodos ? "delete" : "keep" });
      } catch (err) {
        // Archive anyway; only remembering the choice failed
        console.error(err);
        showToast("Couldn't remember your choice; you can set it in Settings");
      }
    }
    archive(deleteOpenTodos);
  };

  const deleteJob = async () => {
    if (!window.confirm("Delete this job application?")) return;
    try {
      await API.delete(`/job-applications/${job.id}`);
      onRemove?.(job.id);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete job");
    }
  };

  return (
    <div className="
      relative flex flex-col justify-between h-full 
      bg-surface dark:bg-dark-soft border border-border dark:border-dark-subtle 
      rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300
    ">
      {/* Top Right Archive Button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={handleArchive}
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent-soft hover:bg-blue-200 dark:hover:bg-accent text-blue-800 dark:text-surface rounded transition-colors"
        >
          Archive
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h2
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="text-lg font-semibold line-clamp-2 pr-20 cursor-pointer text-light-text dark:text-dark-text hover:text-accent transition-colors"
        >
          {job.position}
        </h2>
        <p className="text-sm text-muted dark:text-dark-muted">{job.company_name}</p>

        <div className="flex gap-2 mt-2">
          <span
            className="px-2 py-1 text-xs rounded-full text-white truncate"
            style={{ backgroundColor: STATUS_COLORS[job.status] }}
          >
            {job.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full truncate ${PRIORITY_CLASSES[job.priority]}`}>
            {job.priority}
          </span>
        </div>

        <CardTags tags={job.tags} />
      </div>

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted dark:text-dark-muted">
        <span><strong>Applied:</strong> {job.applied_date}</span>
        <span><strong>Location:</strong> {job.location}</span>
        {job.job_link && (
          <span className="flex items-center gap-1">
            <strong>Application:</strong>
            <a
              href={job.job_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent dark:text-accent hover:underline font-medium truncate"
              title={job.job_link}
            >
              View Posting →
            </a>
          </span>
        )}
        <span>
          <strong>Notes:</strong>{" "}
          {job.notes ? job.notes : <span className="text-light-muted dark:text-dark-muted">—</span>}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => navigate(`/jobs/${job.id}`)}
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent hover:bg-blue-200 dark:hover:bg-accent-soft text-blue-800 dark:text-surface rounded transition-colors flex-1"
        >
          View Job
        </button>
        <button
          onClick={deleteJob}
          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-400 hover:bg-red-200 dark:hover:bg-red-300 text-red-700 dark:text-dark-text rounded transition-colors flex-1"
        >
          Delete
        </button>
      </div>

      {askingAboutTodos && (
        <ArchiveTodosPrompt
          openTodosCount={job.open_todos_count}
          onConfirm={answerTodosPrompt}
          onCancel={() => setAskingAboutTodos(false)}
        />
      )}
    </div>
  );
}