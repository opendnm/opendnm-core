import { useOutletContext } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Pencil } from "lucide-react"
import { Link } from "react-router"
import type { Domain } from "../../../lib/endpoints"
import { cn } from "../../../lib/utils"

interface DomainContext {
  domain: Domain
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}

export default function DomainOverview() {
  const { domain } = useOutletContext<DomainContext>()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 基本信息 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Domain Info</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="edit">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="divide-y p-0 px-6 pb-2">
          <InfoRow label="Domain Name">{domain.name}</InfoRow>
          <InfoRow label="Registrar">{domain.registrar}</InfoRow>
          <InfoRow label="Expires">
            {new Date(domain.expires_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </InfoRow>
          <InfoRow label="Listed">
            {domain.listed ? (
              <Badge variant="outline" className="border-0 bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Listed
              </Badge>
            ) : (
              <span className="text-muted-foreground">Not listed</span>
            )}
          </InfoRow>
          <InfoRow label="List Price">
            {domain.price ? `$${domain.price.toLocaleString()}` : "—"}
          </InfoRow>
        </CardContent>
      </Card>

      {/* CF 状态 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cloudflare Status</CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0 px-6 pb-2">
          <InfoRow label="Zone ID">
            <span className="font-mono text-xs">
              {domain.cf_zone_id ?? "Not connected"}
            </span>
          </InfoRow>
          <InfoRow label="Zone Status">
            <Badge
              variant="outline"
              className={cn(
                "border-0 font-medium",
                domain.cf_status === "active"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : domain.cf_status === "pending"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}
            >
              {domain.cf_status}
            </Badge>
          </InfoRow>
          <InfoRow label="SSL Status">
            <Badge
              variant="outline"
              className={cn(
                "border-0 font-medium",
                domain.ssl_status === "active"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : domain.ssl_status === "expiring"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : domain.ssl_status === "expired"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              )}
            >
              {domain.ssl_status}
            </Badge>
          </InfoRow>
        </CardContent>
      </Card>
    </div>
  )
}