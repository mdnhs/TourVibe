"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Row, flexRender } from "@tanstack/react-table"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

interface DraggableTableRowProps<TData> {
  row: Row<TData>
}

export function DraggableTableRow<TData>({
  row,
}: DraggableTableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
      className={cn(isDragging && "bg-muted/80 z-50")}
    >
      {row.getVisibleCells().map((cell, index) => (
        <TableCell key={cell.id} className="relative">
          {index === 0 && (
            <div
              {...attributes}
              {...listeners}
              className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded"
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <div className={cn(index === 0 && "pl-6")}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </TableCell>
      ))}
    </TableRow>
  )
}
