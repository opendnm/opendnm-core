import type { ColumnDef } from "@tanstack/react-table"
import {
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { Link } from "react-router"
import { SortableHeader } from "../../../components/data-table/Sortableheader"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import type { Domain } from "../../../lib/endpoints"
import { cn } from "../../../lib/utils"

// ─── Badge helpers ────────────────────────────────────────────────────────────

function CfStatusBadge({ status }: { status: Domain["cf_status"] }) {
  const map = {
    active:   { label: "Active",   class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    pending:  { label: "Pending",  class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    inactive: { label: "Inactive", class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  }
  const s = map[status]
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", s.class)}>
      {s.label}
    </Badge>
  )
}

function SslStatusBadge({ status }: { status: Domain["ssl_status"] }) {
  const map = {
    active:   { label: "Active",   class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    expiring: { label: "Expiring", class: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    expired:  { label: "Expired",  class: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
    none:     { label: "None",     class: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  }
  const s = map[status]
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", s.class)}>
      {s.label}
    </Badge>
  )
}

// 到期日期：30天内高亮警告
function ExpiryCell({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr)
  const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86400000)
  const isWarning = daysLeft <= 30

  return (
    <span className={cn("text-sm", isWarning ? "font-semibold text-rose-500" : "text-muted-foreground")}>
      {date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
      {isWarning && (
        <span className="ml-1.5 text-xs">({daysLeft}d)</span>
      )}
    </span>
  )
}

// ─── Columns ──────────────────────────────────────────────────────────────────

interface ColumnsOptions {
  onDelete: (domain: Domain) => void
  onRunPipeline: (domain: Domain) => void
}

export function getDomainColumns({
  onDelete,
  onRunPipeline,
}: ColumnsOptions): ColumnDef<Domain>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Domain" />,
      cell: ({ row }) => (
        <Link
          to={`/domain-manager/domains/${row.original.id}`}
          className="font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "registrar",
      header: ({ column }) => <SortableHeader column={column} label="Registrar" />,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "expires_at",
      header: ({ column }) => <SortableHeader column={column} label="Expires" />,
      cell: ({ getValue }) => <ExpiryCell dateStr={getValue<string>()} />,
      sortingFn: "datetime",
    },
    {
      accessorKey: "cf_status",
      header: "CF Status",
      cell: ({ getValue }) => <CfStatusBadge status={getValue<Domain["cf_status"]>()} />,
    },
    {
      accessorKey: "ssl_status",
      header: "SSL",
      cell: ({ getValue }) => <SslStatusBadge status={getValue<Domain["ssl_status"]>()} />,
    },
    {
      accessorKey: "listed",
      header: "Listed",
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge variant="outline" className="border-0 bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Listed
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <SortableHeader column={column} label="Price" className="justify-end" />
      ),
      cell: ({ getValue }) => {
        const price = getValue<number | null>()
        return (
          <span className="block text-right text-sm font-medium">
            {price ? `$${price.toLocaleString()}` : "—"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const domain = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/domains/${domain.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/domains/${domain.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRunPipeline(domain)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run CF Pipeline
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-600 focus:text-rose-600"
                  onClick={() => onDelete(domain)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}