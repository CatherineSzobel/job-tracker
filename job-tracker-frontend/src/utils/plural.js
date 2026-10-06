// A count with its word: countOf(1, "application") → "1 application", countOf(3, "application") → "3 applications"
export const countOf = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
