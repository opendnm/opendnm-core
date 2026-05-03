import {
  Home,
  LayoutDashboard,
  Server,
  Settings,
  Store,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  icon: LucideIcon // ← 折叠态必须有 icon
  url?: string // 无 items 时必填
  items?: {
    title: string
    url: string
  }[]
}
export const navData: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Domain Manager",
    icon: Server,
    items: [
      { title: "All Domains", url: "/domain-manager/domains" },
      // 点击某个域名后，详情页内处理：
      // └─ DNS Records / SSL / NS 配置 / 到期时间 / CF 状态
      { title: "CF Pipeline", url: "/domain-manager/pipeline" },
    ],
  },
  {
    title: "Marketplace",
    icon: Store,
    items: [
      { title: "Listings", url: "/market/listings" },
      // 点击某个 Listing 后，详情页内处理：
      // └─ 售卖页配置 / 定价 / 上下架
      { title: "Sold", url: "/market/orders" },
      { title: "Quotes", url: "/market/quotes" },
      { title: "Contacts", url: "/market/contacts" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "API & Integrations", url: "/settings/api" },
      // CF API Key / 注册商账户 / Webhook 等统一在这里
      { title: "Notifications", url: "/settings/notifications" },
      { title: "Account", url: "/settings/account" },
    ],
  },
]
