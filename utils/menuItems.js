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
    ],
  },
  {
    name: "hkwin88",
    iconSolid: TrophyIcon,
    requiredFeature: "hkwin88",
    children: [
      {
        name: "attendance",
        path: "/hkwin88/attendance",
        permission: "hkwin88.attendance",
      },
      {
        name: "loyalty",
        path: "/hkwin88/loyalty",
        permission: "hkwin88.loyalty",
      },
      {
        name: "vipmonthlybonus",
        path: "/hkwin88/vipmonthlybonus",
        permission: "hkwin88.vipmonthlybonus",
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
    name: "website",
    iconSolid: WindowIconSolid,
    requiredFeature: "website",
    children: [
      {
        name: "general_setting",
        path: "/website/setting",
        permission: "website.generalsetting",
      },
      {
        name: "announcements",
        path: "/website/announcements",
        permission: "website.announcements",
      },
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
