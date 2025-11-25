import { getCompanyCurrency } from "~/utils/companies";

export const useCurrency = () => {
  const currency = useState("currency", () => {
    const companyId = localStorage.getItem("companyId");
    return getCompanyCurrency(companyId);
  });

  return currency;
};
