import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { Checkbox } from "../ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { TableToolbar } from "./Tabletoolbar"
import { TablePagination } from "./Tablepagination"
import { BulkActionBar } from "./Bulkactionbar"
export interface BulkAction<TData> {
  label: string
  icon?: React.ElementType
  variant?: "default" | "destructive"
  onClick: (rows: TData[]) => void
}

export interface DataTableProps<TData> {
  /** 列定义，每个页面自己提供 */
  columns: ColumnDef<TData>[]
  /** 表格数据 */
  data: TData[]
  /** 是否显示复选框列（启用批量操作） */
  selectable?: boolean
  /** 批量操作按钮列表 */
  bulkActions?: BulkAction<TData>[]
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 搜索匹配的列 key */
  searchColumn?: string
  /** 右上角工具栏按钮（如「Add Domain」） */
  toolbarActions?: React.ReactNode
  /** 每页条数 */
  pageSize?: number
}

export function DataTable<TData>({
  columns,
  data,
  selectable = false,
  bulkActions = [],
  searchPlaceholder = "Search...",
  searchColumn,
  toolbarActions,
  pageSize = 20,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // 自动在最前面插入 checkbox 列
  const allColumns: ColumnDef<TData>[] = selectable
    ? [
        {
          id: "__select__",
          header: ({ table }) => (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Select all"
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Select row"
              onClick={(e) => e.stopPropagation()} // 防止触发行点击
            />
          ),
          size: 40,
          enableSorting: false,
          enableHiding: false,
        },
        ...columns,
      ]
    : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { rowSelection, sorting, columnFilters },
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  })
  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original)

  return (
    <div className="flex flex-col gap-4">
      {/* 工具栏：搜索 + 右侧操作按钮 */}
      <TableToolbar
        table={table}
        searchColumn={searchColumn}
        searchPlaceholder={searchPlaceholder}
        toolbarActions={toolbarActions}
      />

      {/* 表格主体 */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <TablePagination table={table} />
      {/* 批量操作浮动栏：有选中行时自动出现 */}
      {selectable && bulkActions.length > 0 && (
        <BulkActionBar
          selectedCount={selectedRows.length}
          actions={bulkActions}
          selectedRows={selectedRows}
          onClear={() => table.resetRowSelection()}
        />
      )}
    </div>
  )
}
