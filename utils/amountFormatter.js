export const formatAmount = (amount) => {
  return parseFloat(amount).toLocaleString("en-AU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
