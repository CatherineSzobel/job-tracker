import RemoveButton from "../UI/RemoveButton";
import { PREP_LIMITS } from "../../constants/interviewPrep";
import { removeAt, replaceAt } from "../../utils/lists";
import { toSavableUrl } from "./prepDocument";

const EMPTY_PERSON = { name: "", role: "", url: "" };

// The people you're meeting. A person is saved once they have a name; a link once it's an http(s)
// link (until then the row says so).
export default function PeopleList({ people, onChange }) {
  const changePerson = (index, changes) => onChange(replaceAt(people, index, changes));
  const removePerson = (index) => onChange(removeAt(people, index));

  return (
    <div className="flex flex-col gap-3">
      {people.length > 0 && (
        <ul className="flex flex-col gap-3">
          {people.map((person, index) => {
            const savableUrl = toSavableUrl(person.url);
            return (
              <li key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-start">
                <input
                  value={person.name}
                  onChange={(event) => changePerson(index, { name: event.target.value })}
                  placeholder="Name (required)"
                  aria-label="Name"
                  maxLength={100}
                  className="input-field py-1"
                />
                <input
                  value={person.role ?? ""}
                  onChange={(event) => changePerson(index, { role: event.target.value })}
                  placeholder="Role"
                  aria-label="Role"
                  maxLength={100}
                  className="input-field py-1"
                />
                <div>
                  <input
                    type="url"
                    value={person.url ?? ""}
                    onChange={(event) => changePerson(index, { url: event.target.value })}
                    placeholder="LinkedIn or other link"
                    aria-label="Link"
                    maxLength={255}
                    className="input-field py-1"
                  />
                  {person.url?.trim() && !savableUrl && (
                    <p className="mt-1 text-xs text-red-500 dark:text-red-400">Start the link with https:// to save it</p>
                  )}
                  {savableUrl && (
                    <a
                      href={savableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-accent dark:text-accent-muted hover:underline"
                    >
                      Open link ↗
                    </a>
                  )}
                </div>
                <RemoveButton label={`Remove ${person.name || "person"}`} onClick={() => removePerson(index)} />
              </li>
            );
          })}
        </ul>
      )}
      {people.length < PREP_LIMITS.people && (
        <button type="button" onClick={() => onChange([...people, EMPTY_PERSON])} className="btn-small self-start">
          Add person
        </button>
      )}
    </div>
  );
}
