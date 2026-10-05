import { useState } from "react";

const withoutTag = (tagList, tag) => tagList.filter((existing) => existing.id !== tag.id);

// Status and tag changes for the selected applications, collected until Save. The page owns them so
// both the select bar (BatchBar) and the selected cards (a preview) can show them.
export default function useBatchChanges() {
  const [status, setStatus] = useState("");
  const [tagsToAdd, setTagsToAdd] = useState([]);
  const [tagsToRemove, setTagsToRemove] = useState([]);
  const hasChanges = status !== "" || tagsToAdd.length > 0 || tagsToRemove.length > 0;

  // Picking a tag again replaces the earlier pick, and moves it between "add" and "remove"
  // (the backend refuses a tag that's both added and removed)
  const addTag = (tag) => {
    setTagsToRemove((current) => withoutTag(current, tag));
    setTagsToAdd((current) => [...withoutTag(current, tag), tag]);
  };

  const removeTag = (tag) => {
    setTagsToAdd((current) => withoutTag(current, tag));
    setTagsToRemove((current) => [...withoutTag(current, tag), tag]);
  };

  const clear = () => {
    setStatus("");
    setTagsToAdd([]);
    setTagsToRemove([]);
  };

  // The body for PATCH /job-applications/batch
  const toRequest = () => ({
    ...(status && { status }),
    ...(tagsToAdd.length > 0 && { add_tag_ids: tagsToAdd.map((tag) => tag.id) }),
    ...(tagsToRemove.length > 0 && { remove_tag_ids: tagsToRemove.map((tag) => tag.id) }),
  });

  return {
    status,
    setStatus,
    tagsToAdd,
    tagsToRemove,
    hasChanges,
    addTag,
    removeTag,
    undoAddTag: (tag) => setTagsToAdd((current) => withoutTag(current, tag)),
    undoRemoveTag: (tag) => setTagsToRemove((current) => withoutTag(current, tag)),
    clear,
    toRequest,
  };
}
