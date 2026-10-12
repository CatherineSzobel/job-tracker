import { ExternalLink, Plus } from "lucide-react";
import Avatar from "../UI/Avatar";
import Card from "../UI/Card";
import RemoveButton from "../UI/RemoveButton";
import { PREP_LIMITS } from "../../constants/interviewPrep";
import { removeAt, replaceAt } from "../../utils/lists";
import { toSavableUrl } from "./prepDocument";

const EMPTY_PERSON = { name: "", role: "", url: "" };

// The "People you're meeting" card. A person is saved once they have a name; a link once it's an http(s)
// link (until then the row says so).
export default function PeopleList({ people, onChange }) {
  const changePerson = (index, changes) => onChange(replaceAt(people, index, changes));
  const removePerson = (index) => onChange(removeAt(people, index));

  return (
    <Card
      title="People you're meeting"
      action={
        people.length < PREP_LIMITS.people && (
          <button type="button" onClick={() => onChange([...people, EMPTY_PERSON])} className="btn-soft">
            <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
            Add person
          </button>
        )
      }
    >
      {people.length === 0 ? (
        <p className="text-muted">Add the people you'll meet, with their role and a link.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {people.map((person, index) => {
            const savableUrl = toSavableUrl(person.url);
            return (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1">
                  <Avatar name={person.name || "?"} tone="soft" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    value={person.name}
                    onChange={(event) => changePerson(index, { name: event.target.value })}
                    placeholder="Name (required)"
                    aria-label="Name"
                    maxLength={100}
                    className="input-field"
                  />
                  <input
                    value={person.role ?? ""}
                    onChange={(event) => changePerson(index, { role: event.target.value })}
                    placeholder="Role"
                    aria-label="Role"
                    maxLength={100}
                    className="input-field"
                  />
                  <input
                    type="url"
                    value={person.url ?? ""}
                    onChange={(event) => changePerson(index, { url: event.target.value })}
                    placeholder="LinkedIn or other link"
                    aria-label="Link"
                    maxLength={255}
                    className="input-field"
                  />
                  {person.url?.trim() && !savableUrl && <p className="text-sm text-danger">Start the link with https:// to save it</p>}
                  {savableUrl && (
                    <a
                      href={savableUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 self-start text-sm font-semibold text-accent-text hover:underline"
                    >
                      Open link
                      <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                    </a>
                  )}
                </div>
                <RemoveButton label={`Remove ${person.name || "person"}`} onClick={() => removePerson(index)} />
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
