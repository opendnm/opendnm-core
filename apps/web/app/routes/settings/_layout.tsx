import { NavLink, Outlet } from "react-router"
import { Key, Bell, User } from "lucide-react"
import { cn } from "../../lib/utils"

const settingsNav = [
  {
    label: "API & Integrations",
    to: "/settings/api",
    icon: Key,
    description: "Cloudflare and registrar connections",
  },
  {
    label: "Notifications",
    to: "/settings/notifications",
    icon: Bell,
    description: "Alerts and email preferences",
  },
  {
    label: "Account",
    to: "/settings/account",
    icon: User,
    description: "Profile and security",
  },
]

export default function SettingsLayout() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}