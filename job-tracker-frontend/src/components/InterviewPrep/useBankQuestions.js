import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";

const showToast = (message) => useToastStore.getState().showToast(message);

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
    try {
      const res = await API.post("/bank-questions", values);
      const saved = { ...res.data.data, interviews_count: 0 };
      setQuestions((current) => [saved, ...current]);
      return saved;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save the question");
      return null;
    }
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
