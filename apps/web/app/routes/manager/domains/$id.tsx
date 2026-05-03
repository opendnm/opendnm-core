
import { Globe, ShieldCheck, RefreshCw, Server, ArrowLeft, ExternalLink, Building2, Calendar } from "lucide-react"
import { NavLink, Outlet, useLoaderData, useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { cn } from "../../../lib/utils"
import { Separator } from "../../../components/ui/separator"
import type { Route } from "./+types/$id"
import type { Domain } from "../../../lib/endpoints"

export async function loader({ request, params }: Route.LoaderArgs) {
//   const domain = await apiRequired(
//     endpoints.domains.get(params.id!, { request })
//   )
  const domain = {
      id: "1",
      name: "example.com",
      registrar: "GoDaddy",
      expires_at: "2024-12-31T00:00:00Z",
      cf_zone_id: "abc123def456",
      cf_status: "active",
      ssl_status: "active",
      listed: true,
      price: 15.99,
    }
  return { domain }
}

// ─── Tab nav config ───────────────────────────────────────────────────────────

const tabs = [
  { label: "Overview",     to: "",        icon: Globe },
  { label: "DNS Records",  to: "dns",     icon: Server },
  { label: "SSL",          to: "ssl",     icon: ShieldCheck },
  { label: "Nameservers",  to: "ns",      icon: RefreshCw },
]
 
// ─── Status helpers ───────────────────────────────────────────────────────────
 
const CF_STATUS: Record<Domain["cf_status"], { label: string; class: string }> = {
  active:   { label: "CF Active",   class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  pending:  { label: "CF Pending",  class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  inactive: { label: "CF Inactive", class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
}
 
const SSL_STATUS: Record<Domain["ssl_status"], { label: string; class: string }> = {
  active:   { label: "SSL Active",   class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  expiring: { label: "SSL Expiring", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  expired:  { label: "SSL Expired",  class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  none:     { label: "No SSL",       class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
}
 
// ─── Page ─────────────────────────────────────────────────────────────────────
 
export default function DomainDetail() {
  const { domain } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
 
  const daysLeft = Math.ceil(
    (new Date(domain.expires_at).getTime() - Date.now()) / 86400000
  )
  const isExpiringSoon = daysLeft <= 30
 
  async function handleRunPipeline() {
    const toastId = "pipeline"
    toast.loading(`Starting pipeline for ${domain.name}...`, {
      id: toastId,
      duration: Infinity,
    })
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domain.name }),
    })
    if (res.ok) {
      toast.success("Pipeline started", { id: toastId })
    } else {
      toast.error("Pipeline failed", {
        id: toastId,
        description: await res.text(),
      })
    }
  }
 
  return (
    <div className="flex flex-col gap-6">
      {/* 返回 + 顶部操作 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-muted-foreground"
          onClick={() => navigate("/domain-manager/domains")}
        >
          <ArrowLeft className="h-4 w-4" />
          All Domains
        </Button>
 
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRunPipeline}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Run CF Pipeline
          </Button>
          <Button size="sm" asChild>
            <a href={`https://${domain.name}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit
            </a>
          </Button>
        </div>
      </div>
 
      {/* 域名标题 + 状态 Badge */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {domain.name}
          </h1>
          {domain.listed && (
            <Badge
              variant="outline"
              className="border-0 bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              Listed
            </Badge>
          )}
        </div>
 
        {/* Meta 信息行 */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            {domain.registrar}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Expires{" "}
            {new Date(domain.expires_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            {isExpiringSoon && (
              <span className="font-semibold text-rose-500">
                ({daysLeft}d left)
              </span>
            )}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "border-0 font-medium",
              CF_STATUS[domain.cf_status as keyof typeof CF_STATUS].class
            )}
          >
            {CF_STATUS[domain.cf_status as keyof typeof CF_STATUS].label}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "border-0 font-medium",
              SSL_STATUS[domain.ssl_status as keyof typeof SSL_STATUS].class
            )}
          >
            {SSL_STATUS[domain.ssl_status as keyof typeof SSL_STATUS ].label}
          </Badge>
        </div>
      </div>
 
      <Separator />
 
      {/* Tab 导航 */}
      <div className="-mt-2">
        <nav className="flex gap-1 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.to === ""}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 border-b-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
 
      {/* Tab 内容：子路由渲染 */}
      <Outlet context={{ domain }} />
    </div>
  )
}
 