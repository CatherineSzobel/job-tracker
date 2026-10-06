import { useCallback, useEffect, useState } from "react";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";

const showToast = (message) => useToastStore.getState().showToast(message);
const byName = (first, second) => first.name.localeCompare(second.name);

// The user's tags, sorted by name, with how many applications use each (applications_count),
// plus actions that keep the list up to date. Failures are reported with a toast.
export default function useTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Also used to refresh the usage counts (e.g. when opening "Manage tags")
  const reloadTags = useCallback(
    () =>
      API.get("/tags")
        .then((res) => setTags(res.data.data))
        .catch((err) => console.error(err)),
    []
  );

  useEffect(() => {
    reloadTags().finally(() => setLoading(false));
  }, [reloadTags]);

  // Returns the new tag, or null when it failed (e.g. the name is already taken)
  const createTag = async (name) => {
    try {
      const res = await API.post("/tags", { name });
      const tag = { ...res.data.data, applications_count: 0 };
      setTags((currentTags) => [...currentTags, tag].sort(byName));
      return tag;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to create tag");
      return null;
    }
  };

  // Returns true when saved
  const updateTag = async (tag, changes) => {
    try {
      const res = await API.patch(`/tags/${tag.id}`, changes);
      setTags((currentTags) =>
        currentTags.map((existing) => (existing.id === tag.id ? { ...existing, ...res.data.data } : existing)).sort(byName)
      );
      return true;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update tag");
      return false;
    }
  };

  // Returns true when deleted
  const deleteTag = async (tag) => {
    try {
      await API.delete(`/tags/${tag.id}`);
      setTags((currentTags) => currentTags.filter((existing) => existing.id !== tag.id));
      return true;
    } catch (err) {
      console.error(err);
      showToast("Failed to delete tag");
      return false;
    }
  };

  return { tags, loading, reloadTags, createTag, updateTag, deleteTag };
}
