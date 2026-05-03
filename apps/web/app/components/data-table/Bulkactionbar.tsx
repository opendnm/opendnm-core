import { X } from "lucide-react"
import { Button } from "../ui/button"
import type { BulkAction } from "./DataTable"
import { cn } from "../../lib/utils"

interface BulkActionBarProps<TData> {
  selectedCount: number
  actions: BulkAction<TData>[]
  selectedRows: TData[]
  onClear: () => void
}

export function BulkActionBar<TData>({
  selectedCount,
  actions,
  selectedRows,
  onClear,
}: BulkActionBarProps<TData>) {
  if (selectedCount === 0) return null

  return (
    // 固定在视口底部居中，选中时滑入
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "flex items-center gap-3 rounded-xl border bg-background px-4 py-3 shadow-2xl",
        "animate-in slide-in-from-bottom-4 duration-200"
      )}
    >
      {/* 选中数量 + 清除 */}
      <div className="flex items-center gap-2 border-r pr-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          {selectedCount}
        </span>
        <span className="text-sm text-muted-foreground">selected</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* 批量操作按钮 */}
      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              size="sm"
              variant={action.variant === "destructive" ? "destructive" : "secondary"}
              onClick={() => action.onClick(selectedRows)}
              className="h-8 gap-1.5"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}