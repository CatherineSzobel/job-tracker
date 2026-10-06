import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";

const showToast = (message) => useToastStore.getState().showToast(message);

// POST /bank-questions: the saved question, or null when it failed (a toast says so). Also used on
// its own by the interview page's "Save to bank", which doesn't need the whole bank loaded.
export async function createBankQuestion(values) {
  try {
    const res = await API.post("/bank-questions", values);
    return res.data.data;
  } catch (err) {
    console.error(err);
    showToast(err.response?.data?.message || "Failed to save the question");
    return null;
  }
}

// The user's question bank, newest first, and its actions. Each action returns the saved question
// (true for delete), or null/false when it failed; a toast says so.
export default function useBankQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/bank-questions")
      .then((res) => setQuestions(res.data.data))
      .catch((err) => {
        console.error(err);
        showToast("Couldn't load your question bank");
      })
      .finally(() => setLoading(false));
  }, []);

  const createQuestion = async (values) => {
    const saved = await createBankQuestion(values);
    if (!saved) return null;
    const withCount = { ...saved, interviews_count: 0 };
    setQuestions((current) => [withCount, ...current]);
    return withCount;
  };

  const updateQuestion = async (question, values) => {
    try {
      const res = await API.patch(`/bank-questions/${question.id}`, values);
      const saved = { ...res.data.data, interviews_count: question.interviews_count };
      setQuestions((current) => current.map((existing) => (existing.id === question.id ? saved : existing)));
      return saved;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save the question");
      return null;
    }
  };

  const deleteQuestion = async (question) => {
    try {
      await API.delete(`/bank-questions/${question.id}`);
      setQuestions((current) => current.filter((existing) => existing.id !== question.id));
      return true;
    } catch (err) {
      console.error(err);
      showToast("Failed to delete the question");
      return false;
    }
  };

  return { questions, loading, createQuestion, updateQuestion, deleteQuestion };
}
