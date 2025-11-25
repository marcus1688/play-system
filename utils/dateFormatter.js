export const formatDate = (isoDate, options = {}) => {
  if (!isoDate) {
    return "-";
  }

  const defaultOptions = {
    timeZone: "Asia/Singapore",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatOptions = { ...defaultOptions, ...options };
  return new Intl.DateTimeFormat("en-GB", formatOptions).format(
    new Date(isoDate)
  );
};
