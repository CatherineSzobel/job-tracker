const cleanList = (texts) => texts.map((text) => text.trim()).filter(Boolean);

// For comparing a question they asked with the bank questions linked to the interview
export const normaliseQuestion = (text) => text.trim().toLowerCase();

// A person's link as it gets saved: the browser's normalised form (e.g. the host in punycode), or null
// when it isn't an http(s) link. The backend percent-encodes anything else a URL can't contain.
export function toSavableUrl(value) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

// What PUT /interviews/{id}/prep accepts, from what's on screen: blank rows are left out and a link
// that isn't http(s) yet is held back (the row shows a hint), so one half-typed field can't stop
// everything else from saving.
export function toSavablePrep(prep) {
  return {
    checklist: prep.checklist
      .filter((item) => item.text.trim())
      .map((item) => ({ text: item.text.trim(), done: item.done })),
    people: prep.people
      .filter((person) => person.name.trim())
      .map((person) => ({
        name: person.name.trim(),
        role: person.role?.trim() || null,
        url: toSavableUrl(person.url),
      })),
    questions_to_ask: cleanList(prep.questions_to_ask),
    questions_asked: cleanList(prep.questions_asked),
    rating: prep.rating ?? null,
    debrief_notes: prep.debrief_notes?.trim() ? prep.debrief_notes : null,
  };
}
