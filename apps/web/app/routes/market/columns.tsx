import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Pencil, EyeOff, Eye } from "lucide-react"
import { SortableHeader } from "../../components/data-table/Sortableheader"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import type { Domain } from "../../lib/endpoints"
import { cn } from "../../lib/utils"

interface ColumnsOptions {
  onEdit: (domain: Domain) => void
  onToggleListed: (domain: Domain) => void
}

export function getListingColumns({
  onEdit,
  onToggleListed,
}: ColumnsOptions): ColumnDef<Domain>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Domain" />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.registrar}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "listed",
      header: "Status",
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge
            variant="outline"
            className="border-0 bg-emerald-100 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            Listed
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-0 bg-zinc-100 font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
          >
            Unlisted
          </Badge>
        ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <SortableHeader column={column} label="Ask Price" className="justify-end" />
      ),
      cell: ({ getValue }) => {
        const price = getValue<number | null>()
        return (
          <span className="block text-right font-semibold">
            {price ? `$${price.toLocaleString()}` : (
              <span className="font-normal text-muted-foreground">—</span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "cf_status",
      header: "CF",
      cell: ({ getValue }) => {
        const status = getValue<Domain["cf_status"]>()
        return (
          <Badge
            variant="outline"
            className={cn(
              "border-0 font-medium",
              status === "active"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : status === "pending"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "expires_at",
      header: ({ column }) => <SortableHeader column={column} label="Expires" />,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(getValue<string>()).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
      sortingFn: "datetime",
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
                <DropdownMenuItem onClick={() => onEdit(domain)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Listing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleListed(domain)}>
                  {domain.listed ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Unlist Domain
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      List Domain
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}