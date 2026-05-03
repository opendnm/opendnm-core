import { Link, useLoaderData, useRevalidator } from "react-router"
import { Button } from "../../../components/ui/button"
import { Plus, RefreshCw, Trash2 } from "lucide-react"
import { DataTable } from "../../../components/data-table"
import { getDomainColumns } from "./column"
import { toast } from "sonner"
import type { Route } from "./+types/_index"
import type { Domain } from "../../../lib/endpoints"

export async function loader({ request }: Route.LoaderArgs) {
  // const { items, total } = await apiRequired(
  //   endpoints.domains.list({}, { request })
  // )

  // return { domains: items, total }

    const mockDomains: Domain[] = [
    {
      id: "1",
      name: "example.com",
      registrar: "GoDaddy",
      expires_at: "2024-12-31T00:00:00Z",
      cf_zone_id: "abc123def456",
      cf_status: "active",
      ssl_status: "active",
      listed: true,
      price: 15.99,
    },
    {
      id: "2",
      name: "test.net",
      registrar: "Namecheap",
      expires_at: "2025-06-15T00:00:00Z",
      cf_zone_id: null,
      cf_status: "pending",
      ssl_status: "expiring",
      listed: false,
      price: null,
    },
    {
      id: "3",
      name: "sample.org",
      registrar: "Cloudflare",
      expires_at: "2024-08-20T00:00:00Z",
      cf_zone_id: "xyz789ghi012",
      cf_status: "active",
      ssl_status: "expired",
      listed: true,
      price: 9.99,
    },
    {
      id: "4",
      name: "demo.io",
      registrar: "Hover",
      expires_at: "2025-03-10T00:00:00Z",
      cf_zone_id: "def345jkl678",
      cf_status: "inactive",
      ssl_status: "none",
      listed: false,
      price: 25.00,
    },
    {
      id: "5",
      name: "myapp.dev",
      registrar: "Porkbun",
      expires_at: "2024-11-05T00:00:00Z",
      cf_zone_id: null,
      cf_status: "active",
      ssl_status: "active",
      listed: true,
      price: 12.50,
    },
  ];
  return { domains: mockDomains, total: mockDomains.length }
}

export default function AllDomains() {
 const { domains, total } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  // 单条删除
  async function handleDelete(domain: Domain) {
    const confirmed = confirm(`Delete ${domain.name}?`)
    if (!confirmed) return

    const res = await fetch(`/api/domains/${domain.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success(`${domain.name} deleted`)
      revalidator.revalidate()
    } else {
      toast.error("Delete failed", { description: await res.text() })
    }
  }

  // 单条运行 Pipeline
  async function handleRunPipeline(domain: Domain) {
    const toastId = `pipeline-${domain.id}`
    toast.loading(`Running pipeline for ${domain.name}...`, {
      id: toastId,
      duration: Infinity,
    })

    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: domain.name }),
    })

    if (res.ok) {
      toast.success(`Pipeline started for ${domain.name}`, { id: toastId })
    } else {
      toast.error("Pipeline failed", {
        id: toastId,
        description: await res.text(),
      })
    }
  }

  // 批量删除
  async function handleBulkDelete(rows: Domain[]) {
    const confirmed = confirm(
      `Delete ${rows.length} domains? This cannot be undone.`
    )
    if (!confirmed) return

    const toastId = "bulk-delete"
    toast.loading(`Deleting ${rows.length} domains...`, {
      id: toastId,
      duration: Infinity,
    })

    const results = await Promise.allSettled(
      rows.map((d) => fetch(`/api/domains/${d.id}`, { method: "DELETE" }))
    )

    const failed = results.filter((r) => r.status === "rejected").length
    const succeeded = results.length - failed

    if (failed === 0) {
      toast.success(`${succeeded} domains deleted`, { id: toastId })
    } else {
      toast.error(`${succeeded} deleted, ${failed} failed`, { id: toastId })
    }

    revalidator.revalidate()
  }

  // 批量运行 Pipeline
  async function handleBulkPipeline(rows: Domain[]) {
    const toastId = "bulk-pipeline"
    toast.loading(`Starting pipeline for ${rows.length} domains...`, {
      id: toastId,
      duration: Infinity,
    })

    const results = await Promise.allSettled(
      rows.map((d) =>
        fetch("/api/pipeline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: d.name }),
        })
      )
    )

    const failed = results.filter((r) => r.status === "rejected").length
    toast.success(
      `${results.length - failed} pipelines started${failed ? `, ${failed} failed` : ""}`,
      { id: toastId }
    )
  }

  const columns = getDomainColumns({
    onDelete: handleDelete,
    onRunPipeline: handleRunPipeline,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All Domains</h1>
          <p className="text-sm text-muted-foreground">{domains.length} domains total</p>
        </div>
      </div>

      {/* 表格 */}
      <DataTable
        columns={columns}
        data={domains}
        selectable
        searchColumn="name"
        searchPlaceholder="Search domains..."
        toolbarActions={
          <Button asChild size="sm">
            <Link to="/domains/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Domain
            </Link>
          </Button>
        }
        bulkActions={[
          {
            label: "Run Pipeline",
            icon: RefreshCw,
            onClick: handleBulkPipeline,
          },
          {
            label: "Delete",
            icon: Trash2,
            variant: "destructive",
            onClick: handleBulkDelete,
          },
        ]}
      />
    </div>
  )
}
