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
      agent: false,
      agentpt: false,
      website: true,
      luckyspin: false,
      blog: false,
      mail: false,
      feedback: false,
      promocode: false,
      kiosk: true,
      bank: true,
      crypto: false,
      carousel: false,
      admin: true,
      promotion: true,
      vip: true,
      rebate: true,
      report: true,
      tools: false,
      seo: false,
      verification: false,
      paymentgateway: false,
      setting: true,
      hkwin88: true,
      megapng: true,
      ae96: false,
      bm8my: false,
      affiliate: false,
      gamelist: false,
    },
  },

  hkwin88: {
    id: "hkwin88",
    name: "hkwin88",
    apiUrl: "https://api.hkwin88.com/admin/api/",
    publicApiUrl: "https://api.mysteryclub77.com/admin/api/",
    socketUrl: "https://api.hkwin88.com",
    logo: "/images/logo/hkwin88.png",
    currency: "HKD",
    features: {
      transaction: true,
      user: true,
      agent: false,
      agentpt: false,
      website: true,
      luckyspin: false,
      blog: false,
      mail: false,
      feedback: false,
      promocode: false,
      kiosk: true,
      bank: true,
      crypto: false,
      carousel: false,
      admin: true,
      promotion: true,
      vip: true,
      rebate: true,
      report: true,
      tools: false,
      seo: false,
      verification: false,
      paymentgateway: false,
      setting: true,
      hkwin88: true,
      megapng: false,
      ae96: false,
      bm8my: false,
      affiliate: false,
      gamelist: false,
    },
  },
  megapng: {
    id: "megapng",
    name: "megapng",
    apiUrl: "https://api.megapng.co/admin/api/",
    publicApiUrl: "https://api.mysteryclub77.com/admin/api/",
    socketUrl: "https://api.megapng.co",
    logo: "/images/logo/megapng.png",
    currency: "PGK",
    features: {
      transaction: true,
      user: true,
      agent: false,
      agentpt: false,
      website: true,
      luckyspin: false,
      blog: false,
      mail: false,
      feedback: false,
      promocode: false,
      kiosk: true,
      bank: true,
      crypto: false,
      carousel: false,
      admin: true,
      promotion: true,
      vip: false,
      rebate: true,
      report: true,
      tools: false,
      seo: false,
      verification: false,
      paymentgateway: false,
      setting: true,
      hkwin88: false,
      megapng: true,
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
