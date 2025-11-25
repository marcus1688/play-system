import {
  HomeIcon as HomeIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  BanknotesIcon as BanknotesIconSolid,
  PhotoIcon as PhotoIconSolid,
  UserIcon as UserIconSolid,
  WindowIcon as WindowIconSolid,
  GiftIcon as GiftIconSolid,
  StarIcon as StarIconSolid,
  DocumentChartBarIcon as DocumentChartBarIconSolid,
  ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
  CurrencyDollarIcon as CurrencyDollarIconSolid,
  SparklesIcon,
  BookOpenIcon,
  InboxIcon,
  ChatBubbleBottomCenterTextIcon,
  TicketIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  PresentationChartLineIcon,
  WrenchScrewdriverIcon,
  TrophyIcon,
  PlayIcon,
} from "@heroicons/vue/24/solid";

export const menuItems = [
  {
    name: "dashboard",
    path: "/",
    iconSolid: HomeIconSolid,
  },
  {
    name: "memos",
    path: "/memos",
    iconSolid: DocumentTextIcon,
  },
  {
    name: "transaction",
    iconSolid: CreditCardIconSolid,
    requiredFeature: "transaction",
    children: [
      {
        name: "transaction_list",
        path: "/transaction/list",
        permission: "transaction.transactionlist",
      },
      {
        name: "transaction_log",
        path: "/transaction/log",
        permission: "transaction.transactionlog",
      },
    ],
  },
  {
    name: "user",
    iconSolid: UserIconSolid,
    requiredFeature: "user",
    children: [
      {
        name: "user_list",
        path: "/user/list",
        permission: "user.userlist",
      },
      { name: "user_log", path: "/user/log", permission: "user.userlog" },
    ],
  },
  {
    name: "oc7",
    iconSolid: TrophyIcon,
    requiredFeature: "oc7",
    children: [
      {
        name: "leaderboard",
        path: "/oc7/leaderboard",
        permission: "oc7.leaderboard",
      },
      {
        name: "user",
        path: "/oc7/user",
        permission: "oc7.user",
      },
      {
        name: "checkin",
        path: "/oc7/checkin",
        permission: "oc7.checkin",
      },
      {
        name: "lucky_draw",
        path: "/oc7/luckydraw",
        permission: "oc7.luckydraw",
      },
    ],
  },
  {
    name: "ae96",
    iconSolid: TrophyIcon,
    requiredFeature: "ae96",
    children: [
      {
        name: "leaderboard",
        path: "/ae96/leaderboard",
        permission: "ae96.leaderboard",
      },
      {
        name: "about_us",
        path: "/ae96/aboutus",
        permission: "ae96.aboutus",
      },
      {
        name: "squid_game",
        path: "/ae96/squidgame",
        permission: "ae96.squidgame",
      },
    ],
  },
  {
    name: "bm8my",
    iconSolid: TrophyIcon,
    requiredFeature: "bm8my",
    children: [
      {
        name: "rescue_setting",
        path: "/bm8my/rescue-setting",
        permission: "bm8my.rescuesetting",
      },
      {
        name: "rescue_report",
        path: "/bm8my/rescue-report",
        permission: "bm8my.rescuereport",
      },
      {
        name: "leaderboard",
        path: "/bm8my/leaderboard",
        permission: "bm8my.leaderboard",
      },
      {
        name: "live_transaction",
        path: "/bm8my/live-transaction",
        permission: "bm8my.livetransaction",
      },
      {
        name: "lucky_draw",
        path: "/bm8my/lucky-draw",
        permission: "bm8my.luckydraw",
      },
      {
        name: "check_in_report",
        path: "/bm8my/check-in-report",
        permission: "bm8my.checkinreport",
      },
      {
        name: "promo_code",
        path: "/bm8my/promo-code",
        permission: "bm8my.promocode",
      },
      {
        name: "promo_code_report",
        path: "/bm8my/promo-code-report",
        permission: "bm8my.promocodereport",
      },
      {
        name: "mission",
        path: "/bm8my/mission",
        permission: "bm8my.mission",
      },
      {
        name: "mission_report",
        path: "/bm8my/mission-report",
        permission: "bm8my.missionreport",
      },
    ],
  },

  {
    name: "agent",
    iconSolid: UserCircleIcon,
    requiredFeature: "agent",
    children: [
      {
        name: "agent_setting",
        path: "/agent/setting",
        permission: "agent.agentsetting",
      },
      {
        name: "agent_report",
        path: "/agent/report",
        permission: "agent.agentreport",
      },
    ],
  },
  {
    name: "agentpt",
    iconSolid: PresentationChartLineIcon,
    requiredFeature: "agentpt",
    children: [
      {
        name: "agentpt_list",
        path: "/agentpt/list",
        permission: "agentpt.list",
      },
      {
        name: "agentpt_report",
        path: "/agentpt/report",
        permission: "agentpt.report",
      },
    ],
  },
  {
    name: "affiliate",
    iconSolid: ArrowTrendingUpIcon,
    requiredFeature: "affiliate",
    children: [
      {
        name: "affiliate_list",
        path: "/affiliate/list",
        permission: "affiliate.affiliatelist",
      },
      {
        name: "affiliate_log",
        path: "/affiliate/log",
        permission: "affiliate.affiliatelog",
      },
      {
        name: "affiliate_report",
        path: "/affiliate/report",
        permission: "affiliate.affiliatereport",
      },
      {
        name: "affiliate_setting",
        path: "/affiliate/setting",
        permission: "affiliate.affiliatesetting",
      },
    ],
  },
  {
    name: "website",
    iconSolid: WindowIconSolid,
    requiredFeature: "website",
    children: [
      {
        name: "general_setting",
        path: "/website/setting",
        permission: "website.generalsetting",
      },
      { name: "popup", path: "/website/popup", permission: "website.popup" },
      { name: "review", path: "/website/review", permission: "website.review" },
      {
        name: "announcements",
        path: "/website/announcements",
        permission: "website.announcements",
      },
      { name: "faq", path: "/website/faq", permission: "website.faq" },
    ],
  },
  {
    name: "lucky_spin",
    iconSolid: SparklesIcon,
    requiredFeature: "luckyspin",
    children: [
      {
        name: "lucky_spin_setting",
        path: "/luckyspin/setting",
        permission: "luckyspin.luckyspinsetting",
      },
      {
        name: "lucky_spin_report",
        path: "/luckyspin/report",
        permission: "luckyspin.luckyspinreport",
      },
    ],
  },
  {
    name: "blog",
    iconSolid: BookOpenIcon,
    requiredFeature: "blog",
    children: [
      { name: "blog_list", path: "/blog/list", permission: "blog.bloglist" },
    ],
  },
  {
    name: "mail",
    iconSolid: InboxIcon,
    requiredFeature: "mail",
    children: [
      { name: "mail_list", path: "/mail/list", permission: "mail.maillist" },
    ],
  },
  {
    name: "feedback",
    iconSolid: ChatBubbleBottomCenterTextIcon,
    requiredFeature: "feedback",
    children: [
      {
        name: "feedback_list",
        path: "/feedback/list",
        permission: "feedback.feedbacklist",
      },
    ],
  },
  {
    name: "promo_code",
    iconSolid: TicketIcon,
    requiredFeature: "promocode",
    children: [
      {
        name: "promo_code_list",
        path: "/promocode/list",
        permission: "promocode.promocodelist",
      },

      {
        name: "promo_code_report",
        path: "/promocode/report",
        permission: "promocode.promocodereport",
      },
    ],
  },
  {
    name: "kiosk",
    iconSolid: ComputerDesktopIconSolid,
    requiredFeature: "kiosk",
    children: [
      {
        name: "kiosk_category",
        path: "/kiosk/category",
        permission: "kiosk.kioskcategory",
      },
      {
        name: "kiosk_list",
        path: "/kiosk/list",
        permission: "kiosk.kiosklist",
      },
      {
        name: "kiosk_report",
        path: "/kiosk/report",
        permission: "kiosk.kioskreport",
      },
      {
        name: "kiosk_balance",
        path: "/kiosk/balance",
        permission: "kiosk.kioskbalance",
      },
    ],
  },
  {
    name: "game",
    iconSolid: PlayIcon,
    requiredFeature: "gamelist",
    children: [
      {
        name: "game_list",
        path: "/gamelist/list",
        permission: "gamelist.list",
      },
    ],
  },
  {
    name: "bank",
    iconSolid: BanknotesIconSolid,
    requiredFeature: "bank",
    children: [
      { name: "bank_list", path: "/bank/list", permission: "bank.banklist" },
      {
        name: "user_bank_list",
        path: "/bank/user-list",
        permission: "bank.userbanklist",
      },
      {
        name: "bank_balance",
        path: "/bank/balance",
        permission: "bank.bankbalance",
      },
      {
        name: "bank_transaction",
        path: "/bank/transaction",
        permission: "bank.banktransaction",
      },
      {
        name: "bank_report",
        path: "/bank/report",
        permission: "bank.bankreport",
      },
    ],
  },
  {
    name: "crypto_bank",
    iconSolid: ShieldCheckIcon,
    requiredFeature: "crypto",
    children: [
      {
        name: "usdt",
        path: "/crypto/usdt",
        permission: "crypto.usdt",
      },
    ],
  },
  {
    name: "carousel",
    iconSolid: PhotoIconSolid,
    requiredFeature: "carousel",
    children: [
      {
        name: "carousel_list",
        path: "/carousel/list",
        permission: "carousel.carousellist",
      },
    ],
  },
  {
    name: "admin",
    iconSolid: UserGroupIconSolid,
    requiredFeature: "admin",
    children: [
      {
        name: "admin_list",
        path: "/admin/list",
        permission: "admin.adminlist",
      },
      { name: "admin_log", path: "/admin/log", permission: "admin.adminlog" },

      {
        name: "admin_report",
        path: "/admin/report",
        permission: "admin.adminreport",
      },
    ],
  },

  {
    name: "promotion",
    iconSolid: GiftIconSolid,
    requiredFeature: "promotion",
    children: [
      {
        name: "promotion_category",
        path: "/promotion/category",
        permission: "promotion.promotioncategory",
      },
      {
        name: "promotion_list",
        path: "/promotion/list",
        permission: "promotion.promotionlist",
      },
      {
        name: "promotion_report",
        path: "/promotion/report",
        permission: "promotion.promotionreport",
      },
    ],
  },
  {
    name: "vip",
    iconSolid: StarIconSolid,
    requiredFeature: "vip",
    children: [
      { name: "vip_list", path: "/vip/list", permission: "vip.viplist" },
    ],
  },
  {
    name: "seo",
    iconSolid: ArrowTrendingUpIcon,
    requiredFeature: "seo",
    children: [{ name: "pages", path: "/seo", permission: "seo.pages" }],
  },
  {
    name: "verification",
    iconSolid: CheckBadgeIcon,
    requiredFeature: "verification",
    children: [
      {
        name: "sms",
        path: "/verification/sms",
        permission: "verification.sms",
      },
      {
        name: "email",
        path: "/verification/email",
        permission: "verification.email",
      },
    ],
  },
  {
    name: "payment_gateway",
    iconSolid: CircleStackIcon,
    requiredFeature: "paymentgateway",
    children: [
      {
        name: "pg_list",
        path: "/paymentgateway/list",
        permission: "paymentgateway.list",
      },
      {
        name: "pg_withdraw",
        path: "/paymentgateway/withdraw",
        permission: "paymentgateway.withdraw",
      },
      {
        name: "pg_report",
        path: "/paymentgateway/report",
        permission: "paymentgateway.report",
      },
      {
        name: "pg_transaction",
        path: "/paymentgateway/transaction",
        permission: "paymentgateway.transaction",
      },
    ],
  },
  {
    name: "rebate",
    iconSolid: CurrencyDollarIconSolid,
    requiredFeature: "rebate",
    children: [
      {
        name: "rebate_setting",
        path: "/rebate/setting",
        permission: "rebate.rebatesetting",
      },
      {
        name: "rebate_report",
        path: "/rebate/report",
        permission: "rebate.rebatereport",
      },
    ],
  },
  {
    name: "report",
    iconSolid: DocumentChartBarIconSolid,
    requiredFeature: "report",
    children: [
      {
        name: "summary_report",
        path: "/report/summary",
        permission: "report.summaryreport",
      },
      {
        name: "player_report",
        path: "/report/player",
        permission: "report.playerreport",
      },
    ],
  },
  {
    name: "tools",
    iconSolid: WrenchScrewdriverIcon,
    requiredFeature: "tools",
    children: [
      {
        name: "contacts",
        path: "/tools/contacts",
        permission: "tools.contacts",
      },
      {
        name: "fingerprint",
        path: "/tools/fingerprint",
        permission: "tools.fingerprint",
      },
      {
        name: "unlimitedrebate",
        path: "/tools/unlimitedrebate",
        permission: "tools.unlimitedrebate",
      },
    ],
  },
  {
    name: "setting",
    iconSolid: Cog6ToothIcon,
    requiredFeature: "setting",
    children: [
      {
        name: "whitelist_ip",
        path: "/setting/whitelistip",
        permission: "setting.whitelistip",
      },
      {
        name: "change_password",
        path: "/setting/changepassword",
        permission: "setting.changepassword",
      },
    ],
  },
  {
    name: "logout",
    iconSolid: ArrowRightOnRectangleIconSolid,
  },
];

export const findPermissionByPath = (path) => {
  for (const item of menuItems) {
    if (item.children) {
      const child = item.children.find((child) => child.path === path);
      if (child) {
        return child.permission;
      }
    } else if (item.path === path) {
      return item.permission;
    }
  }
  return null;
};
