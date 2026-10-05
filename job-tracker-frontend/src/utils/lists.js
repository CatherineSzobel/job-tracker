// A copy of the list with the item at index merged with changes (objects) or replaced (anything else)
export function replaceAt(list, index, changes) {
  return list.map((item, itemIndex) => {
    if (itemIndex !== index) return item;
    return typeof item === "object" && item !== null ? { ...item, ...changes } : changes;
  });
}

// A copy of the list without the item at index
export function removeAt(list, index) {
  return list.filter((_, itemIndex) => itemIndex !== index);
}
