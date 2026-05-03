import type { Column } from "@tanstack/react-table"
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface SortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
}

export function SortableHeader<TData>({
  column,
  label,
  className,
}: SortableHeaderProps<TData>) {
  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 gap-1 font-medium", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </Button>
  )
}