// Formatters are costly to build, and every card formats its salary on every render: one per currency and form
const formatters = new Map();

// Whole amounts in the salary's currency: "€50,000", "CHF 90,000"; compact: "€50K", "CHF 1.1M"
const formatAmount = (amount, currency, compact) => {
  const key = `${currency}|${compact}`;
  if (!formatters.has(key)) {
    formatters.set(
      key,
      new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
        maximumFractionDigits: compact ? 1 : 0,
        ...(compact ? { notation: "compact" } : {}),
      })
    );
  }
  return formatters.get(key).format(amount);
};

const isSet = (value) => value !== null && value !== undefined && value !== "";

// A salary range as text: "€50,000 – €60,000", "From €50,000", "Up to €60,000", or "" when neither is set.
// compact: the short form for cards ("€50K – €60K").
export function formatSalary(min, max, currency = "EUR", { compact = false } = {}) {
  const hasMin = isSet(min);
  const hasMax = isSet(max);
  if (hasMin && hasMax) return `${formatAmount(min, currency, compact)} – ${formatAmount(max, currency, compact)}`;
  if (hasMin) return `From ${formatAmount(min, currency, compact)}`;
  if (hasMax) return `Up to ${formatAmount(max, currency, compact)}`;
  return "";
}
