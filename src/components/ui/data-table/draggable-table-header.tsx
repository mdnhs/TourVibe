"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type Header, flexRender } from "@tanstack/react-table"
import { TableHead } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"

interface DraggableTableHeaderProps<TData, TValue> {
  header: Header<TData, TValue>
}

export function DraggableTableHeader<TData, TValue>({
  header,
}: DraggableTableHeaderProps<TData, TValue>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "bg-muted")}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </TableHead>
  )
}
