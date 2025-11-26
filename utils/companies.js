export const COMPANIES = {
  localhost: {
    id: "localhost",
    name: "localhost",
    apiUrl: "http://localhost:3001/admin/api/",
    publicApiUrl: "http://localhost:4000/admin/api/",
    socketUrl: "http://localhost:3001",
    logo: "/images/logo/emtech88.png",
    currency: "MYR",
    template: 1,
    features: {
      transaction: true,
      user: true,
      agent: true,
      agentpt: true,
      website: true,
      luckyspin: true,
      blog: true,
      mail: true,
      feedback: true,
      promocode: true,
      kiosk: true,
      bank: true,
      crypto: true,
      carousel: true,
      admin: true,
      promotion: true,
      vip: true,
      rebate: true,
      report: true,
      tools: true,
      seo: true,
      verification: true,
      paymentgateway: true,
      setting: true,
      hkwin88: true,
    },
  },

  hkwin88: {
    id: "hkwin88",
    name: "hkwin88",
    apiUrl: "https://api.hkwin88.com/admin/api/",
    publicApiUrl: "https://api.mysteryclub88.co/admin/api/",
    socketUrl: "https://api.hkwin88.com",
    logo: "/images/logo/hkwin88.png",
    currency: "HKD",
    features: {
      transaction: true,
      user: true,
      agent: true,
      agentpt: true,
      website: true,
      luckyspin: true,
      blog: true,
      mail: true,
      feedback: true,
      promocode: true,
      kiosk: true,
      bank: true,
      crypto: false,
      carousel: true,
      admin: true,
      promotion: true,
      vip: false,
      rebate: true,
      report: true,
      tools: false,
      seo: true,
      verification: true,
      paymentgateway: true,
      setting: true,
      hkwin88: true,
      ae96: false,
      bm8my: false,
      affiliate: false,
      gamelist: false,
    },
  },
};

export const getCompanyApiUrl = (companyId) => {
  if (!companyId || !COMPANIES[companyId]) {
    console.error(`Invalid company ID: ${companyId}`);
    return "";
  }
  return COMPANIES[companyId].apiUrl;
};

export const getPublicApiUrl = (companyId) => {
  if (!companyId || !COMPANIES[companyId]) {
    console.error(`Invalid company ID: ${companyId}`);
    return "";
  }
  return COMPANIES[companyId].publicApiUrl;
};

export const hasFeature = (companyId, featureName) => {
  if (!companyId || !COMPANIES[companyId]) {
    return false;
  }
  return COMPANIES[companyId].features?.[featureName] || false;
};

export const getCompanyCurrency = (companyId) => {
  if (!companyId || !COMPANIES[companyId]) {
    console.error(`Invalid company ID: ${companyId}`);
    return "$";
  }
  return COMPANIES[companyId].currency;
};

export const getCompanySocketUrl = (companyId) => {
  if (!companyId || !COMPANIES[companyId]) {
    console.error(`Invalid company ID: ${companyId}`);
    return "";
  }
  return COMPANIES[companyId].socketUrl;
};

export const hasTemplate = (companyId, templateId) => {
  if (!companyId || !COMPANIES[companyId]) {
    return false;
  }
  return COMPANIES[companyId].template === templateId;
};
