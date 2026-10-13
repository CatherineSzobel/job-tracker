import { useState } from "react";
import ArchiveTodosPrompt from "./ArchiveTodosPrompt";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useToastStore } from "../../stores/useToastStore";
import { countOf } from "../../utils/plural";

// The request body for archiving: delete_open_todos is only sent when the user answered the prompt,
// otherwise the server follows their setting.
export function archiveChanges(deleteOpenTodos) {
  return deleteOpenTodos === undefined
    ? { is_archived: true }
    : { is_archived: true, delete_open_todos: deleteOpenTodos };
}

// Whether archiving deleted open to-dos: an application has fewer after the request than before.
// Then it can't be undone, since restoring doesn't bring the to-dos back.
export function deletedOpenTodos(jobsBefore, jobsAfter) {
  const countsBefore = new Map(jobsBefore.map((job) => [job.id, job.open_todos_count ?? 0]));
  return jobsAfter.some((job) => (job.open_todos_count ?? 0) < (countsBefore.get(job.id) ?? 0));
}

// The toast after archiving: "Application archived", "3 applications archived", plus "and … open to-dos deleted"
export function archivedMessage(count, todosDeleted) {
  const archived = count === 1 ? "Application archived" : `${countOf(count, "application")} archived`;
  return todosDeleted ? `${archived} and ${count === 1 ? "its" : "their"} open to-dos deleted` : archived;
}

// Archiving applications that may have open to-dos. requestArchive(counts) shows ArchiveTodosPrompt when
// there are open to-dos and the setting is "ask"; otherwise it calls archive() and the server follows the
// setting. archive(deleteOpenTodos) does the request: deleteOpenTodos is the answer, or undefined when not asked.
// Render `prompt` somewhere in the component.
export default function useArchiveWithTodos(archive) {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const showToast = useToastStore((state) => state.showToast);
  const [question, setQuestion] = useState(null);

  // counts: { openTodosCount, applicationCount = 1, selectedCount = 1 }
  const requestArchive = async (counts) => {
    if (counts.openTodosCount > 0) {
      try {
        const settings = await loadSettings();
        if (settings.archive_todos === "ask") {
          setQuestion(counts);
          return;
        }
      } catch (err) {
        // Can't read the setting: ask rather than guess
        console.error(err);
        setQuestion(counts);
        return;
      }
    }
    archive();
  };

  const answer = async (deleteOpenTodos, remember) => {
    setQuestion(null);
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

  const prompt = question && (
    <ArchiveTodosPrompt {...question} onConfirm={answer} onCancel={() => setQuestion(null)} />
  );

  return { requestArchive, prompt };
}
