// category: a category value or "all"; search: case-insensitive, over the question and the answer
export default function filterBankQuestions(questions, { category, search }) {
  const searchText = search.trim().toLowerCase();
  return questions.filter(
    (question) =>
      (category === "all" || question.category === category) &&
      (!searchText || `${question.question} ${question.answer ?? ""}`.toLowerCase().includes(searchText))
  );
}
