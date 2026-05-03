import { useState } from "react"
import { useLoaderData, useRevalidator } from "react-router"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { DataTable } from "../../components/data-table"
import { getListingColumns } from "./columns"

import type { Route } from "./+types/listings"
import { ListingDrawer } from "./ListingDrawer"
import type { Domain } from "../../lib/endpoints"

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
//   const { items, total } = await apiRequired(
//     endpoints.domains.list({}, { request })
//   )
//   // Listings 页只关心已上架或有价格的域名
//   // 过滤逻辑也可以改为后端传参 listed=all 由后端决定
//   return { domains: items, total }

    const names: Domain[] = [
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
    }
      ]
    return {domains: names, total: names.length}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Listings() {
  const { domains, total } = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)

  // 打开编辑抽屉
  function handleEdit(domain: Domain) {
    setEditingDomain(domain)
    setDrawerOpen(true)
  }

  // 单条上架 / 下架
  async function handleToggleListed(domain: Domain) {
    const next = !domain.listed
    const label = next ? "Listed" : "Unlisted"

    const res = await fetch(`/api/domains/${domain.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listed: next }),
    })

    if (res.ok) {
      toast.success(`${domain.name} → ${label}`)
      revalidator.revalidate()
    } else {
      toast.error("Update failed", { description: await res.text() })
    }
  }

  // 批量上架
  async function handleBulkList(rows: Domain[]) {
    const toastId = "bulk-list"
    toast.loading(`Listing ${rows.length} domains...`, {
      id: toastId,
      duration: Infinity,
    })

    const results = await Promise.allSettled(
      rows.map((d) =>
        fetch(`/api/domains/${d.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listed: true }),
        })
      )
    )

    const failed = results.filter((r) => r.status === "rejected").length
    toast.success(
      `${results.length - failed} domains listed${failed ? `, ${failed} failed` : ""}`,
      { id: toastId }
    )
    revalidator.revalidate()
  }

  // 批量下架
  async function handleBulkUnlist(rows: Domain[]) {
    const toastId = "bulk-unlist"
    toast.loading(`Unlisting ${rows.length} domains...`, {
      id: toastId,
      duration: Infinity,
    })

    const results = await Promise.allSettled(
      rows.map((d) =>
        fetch(`/api/domains/${d.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listed: false }),
        })
      )
    )

    const failed = results.filter((r) => r.status === "rejected").length
    toast.success(
      `${results.length - failed} domains unlisted${failed ? `, ${failed} failed` : ""}`,
      { id: toastId }
    )
    revalidator.revalidate()
  }

  const listedCount = domains.filter((d) => d.listed).length

  const columns = getListingColumns({
    onEdit: handleEdit,
    onToggleListed: handleToggleListed,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* 页头 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Listings</h1>
          <p className="text-sm text-muted-foreground">
            {listedCount} of {total} domains listed on marketplace
          </p>
        </div>
      </div>

      {/* 表格 */}
      <DataTable
        columns={columns}
        data={domains}
        selectable
        searchColumn="name"
        searchPlaceholder="Search domains..."
        bulkActions={[
          {
            label: "List",
            icon: Eye,
            onClick: handleBulkList,
          },
          {
            label: "Unlist",
            icon: EyeOff,
            variant: "destructive",
            onClick: handleBulkUnlist,
          },
        ]}
      />

      {/* 编辑抽屉 */}
      <ListingDrawer
        open={drawerOpen}
        domain={editingDomain}
        onClose={() => {
          setDrawerOpen(false)
          setEditingDomain(null)
        }}
        onSuccess={() => revalidator.revalidate()}
      />
    </div>
  )
}