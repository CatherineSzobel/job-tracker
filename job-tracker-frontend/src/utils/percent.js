// part as a percentage of whole, for bar widths: at most 100, and 0 when whole is 0
export const percentOf = (part, whole) => (whole > 0 ? Math.min((part / whole) * 100, 100) : 0);
