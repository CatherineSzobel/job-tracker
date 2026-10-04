const cleanList = (texts) => texts.map((text) => text.trim()).filter(Boolean);

export function isHttpUrl(value) {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// For comparing a question they asked with the bank questions linked to the interview
export const normaliseQuestion = (text) => text.trim().toLowerCase();

// A person's link as it gets saved: the browser's normalised form (a space becomes %20), or null
// when it isn't http(s) or the backend already turned this exact link down (rejectedLinks)
export function toSavableUrl(value, rejectedLinks = []) {
  if (!isHttpUrl(value)) return null;
  const href = new URL(value.trim()).href;
  return rejectedLinks.includes(href) ? null : href;
}

// The people[N].url values a 422 turned down, when those are its only errors (else null)
export function linksRejectedBy(err, document) {
  const fields = Object.keys(err.response?.data?.errors ?? {});
  const onlyLinks = err.response?.status === 422 && fields.length > 0 && fields.every((field) => /^people\.\d+\.url$/.test(field));
  return onlyLinks ? fields.map((field) => document.people[Number(field.split(".")[1])].url) : null;
}

// What PUT /interviews/{id}/prep accepts, from what's on screen: blank rows are left out and a
// link that can't be saved is held back (the row shows a hint), so one half-typed field can't
// stop everything else from saving.
export function toSavablePrep(prep, rejectedLinks = []) {
  return {
    checklist: prep.checklist
      .filter((item) => item.text.trim())
      .map((item) => ({ text: item.text.trim(), done: item.done })),
    people: prep.people
      .filter((person) => person.name.trim())
      .map((person) => ({
        name: person.name.trim(),
        role: person.role?.trim() || null,
        url: toSavableUrl(person.url, rejectedLinks),
      })),
    questions_to_ask: cleanList(prep.questions_to_ask),
    questions_asked: cleanList(prep.questions_asked),
    rating: prep.rating ?? null,
    debrief_notes: prep.debrief_notes.trim() ? prep.debrief_notes : null,
  };
}
