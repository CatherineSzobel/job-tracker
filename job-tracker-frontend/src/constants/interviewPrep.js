import { INTERVIEW_TYPES } from "./jobs";

// The interview page's tabs. Before the interview it opens on Prep, afterwards on Debrief.
export const PREP_TABS = [
  { id: "prep", label: "Prep" },
  { id: "debrief", label: "Debrief" },
];

// Same limits as InterviewPrepUpdateRequest
export const PREP_LIMITS = {
  checklist: 50,
  people: 20,
  questionsToAsk: 30,
  questionsAsked: 50,
};

// A checklist item's (and template item's) text, same as the backend's max:200
export const CHECKLIST_ITEM_MAX_LENGTH = 200;

export const RATING_VALUES = [1, 2, 3, 4, 5];

// Mirrors app/Enums/BankQuestionCategory
export const BANK_QUESTION_CATEGORIES = [
  { value: "about_me", label: "About me" },
  { value: "behavioural", label: "Behavioural" },
  { value: "technical", label: "Technical" },
  { value: "motivation", label: "Motivation" },
  { value: "other", label: "Other" },
];

export const bankCategoryLabel = (value) =>
  BANK_QUESTION_CATEGORIES.find((category) => category.value === value)?.label ?? value;

export const EMPTY_BANK_QUESTION = { question: "", category: "other", answer: "" };

// Same limit as PUT /api/interviews/{id}/bank-questions
export const BANK_LINKS_MAX = 50;

// Same limit as InterviewPrepTemplateRequest
export const TEMPLATE_ITEMS_MAX = 30;

// Which interviews a template item is for; "" is saved as null (all of them)
export const TEMPLATE_TYPE_OPTIONS = [{ value: "", label: "All" }, ...INTERVIEW_TYPES];
