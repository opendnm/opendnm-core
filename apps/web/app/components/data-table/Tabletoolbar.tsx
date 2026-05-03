import type { Table } from "@tanstack/react-table"
import { Search, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

interface TableToolbarProps<TData> {
  table: Table<TData>
  searchColumn?: string
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
}

export function TableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  toolbarActions,
}: TableToolbarProps<TData>) {
  const searchValue = searchColumn
    ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
    : ""

  return (
    <div className="flex items-center justify-between gap-4">
      {/* 搜索框 */}
      {searchColumn && (
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) =>
              table.getColumn(searchColumn)?.setFilterValue(e.target.value)
            }
            className="pl-9 pr-8"
          />
          {/* 清除按钮 */}
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() =>
                table.getColumn(searchColumn)?.setFilterValue("")
              }
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* 右侧：工具栏按钮（如「Add Domain」） */}
      {toolbarActions && (
        <div className="ml-auto flex items-center gap-2">{toolbarActions}</div>
      )}
    </div>
  )
}