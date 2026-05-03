import { useLoaderData, useOutletContext, useRevalidator } from "react-router"
import { useState } from "react"
import { Plus, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { endpoints, type DnsRecord, type Domain } from "../../../lib/endpoints"
import { apiRequired } from "../../../lib/api.server"
import type { Route } from "./+types/$id.dns"
import { Label } from "../../../components/ui/label"

interface DomainContext {
  domain: Domain
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request, params }: Route.LoaderArgs) {
  const records = await apiRequired(
    endpoints.domains.dns.list(params.id!, { request })
  )
  return { records, domainId: params.id! }
}

// ─── DNS Form Dialog ──────────────────────────────────────────────────────────

const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"] as const

interface DnsFormDialogProps {
  open: boolean
  onClose: () => void
  domainId: string
  record?: DnsRecord | null
  onSuccess: () => void
}

function DnsFormDialog({
  open,
  onClose,
  domainId,
  record,
  onSuccess,
}: DnsFormDialogProps) {
  const isEdit = Boolean(record)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const body = {
      type:    form.get("type") as string,
      name:    form.get("name") as string,
      content: form.get("content") as string,
      ttl:     Number(form.get("ttl")),
    }

    const res = isEdit
      ? await fetch(`/api/domains/${domainId}/dns/${record!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch(`/api/domains/${domainId}/dns`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

    setLoading(false)

    if (res.ok) {
      toast.success(isEdit ? "Record updated" : "Record added")
      onSuccess()
      onClose()
    } else {
      toast.error("Failed to save record", { description: await res.text() })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit DNS Record" : "Add DNS Record"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue={record?.type ?? "A"}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DNS_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ttl">TTL</Label>
              <Input
                id="ttl"
                name="ttl"
                type="number"
                defaultValue={record?.ttl ?? 3600}
                min={60}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="@ or subdomain"
              defaultValue={record?.name ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content</Label>
            <Input
              id="content"
              name="content"
              placeholder="IP address, hostname, or value"
              defaultValue={record?.content ?? ""}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update" : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DomainDns() {
  const { records, domainId } = useLoaderData<typeof loader>()
  const { domain } = useOutletContext<DomainContext>()
  const revalidator = useRevalidator()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null)

  function openAdd() {
    setEditingRecord(null)
    setDialogOpen(true)
  }

  function openEdit(record: DnsRecord) {
    setEditingRecord(record)
    setDialogOpen(true)
  }

  async function handleDelete(record: DnsRecord) {
    const confirmed = confirm(`Delete ${record.type} record "${record.name}"?`)
    if (!confirmed) return

    const res = await fetch(`/api/domains/${domainId}/dns/${record.id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      toast.success("Record deleted")
      revalidator.revalidate()
    } else {
      toast.error("Delete failed", { description: await res.text() })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {records.length} record{records.length !== 1 ? "s" : ""} for{" "}
          <span className="font-medium text-foreground">{domain.name}</span>
        </p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>

      {/* 表格 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>TTL</TableHead>
              <TableHead>Proxied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No DNS records yet. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono font-semibold">
                      {record.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{record.name}</TableCell>
                  <TableCell className="max-w-60 truncate font-mono text-sm text-muted-foreground">
                    {record.content}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.ttl === 1 ? "Auto" : `${record.ttl}s`}
                  </TableCell>
                  <TableCell>
                    {record.proxied ? (
                      <Badge variant="outline" className="border-0 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Proxied
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">DNS only</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(record)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-600"
                        onClick={() => handleDelete(record)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增 / 编辑 Dialog */}
      <DnsFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        domainId={domainId}
        record={editingRecord}
        onSuccess={() => revalidator.revalidate()}
      />
    </div>
  )
}