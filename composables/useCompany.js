import { hasTemplate } from "~/utils/companies";

export const useCompany = () => {
  const companyId = useState("companyId", () =>
    localStorage.getItem("companyId")
  );
  const setCompanyId = (id) => {
    localStorage.setItem("companyId", id);
    companyId.value = id;
  };
  const getCompanyId = () => {
    return companyId.value;
  };
  const checkTemplate = (templateId) => {
    return hasTemplate(companyId.value, templateId);
  };
  return {
    companyId,
    setCompanyId,
    getCompanyId,
    checkTemplate,
  };
};
