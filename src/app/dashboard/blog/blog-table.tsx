"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  LayoutIcon,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  Trash,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

import { deleteBlogPost, deleteBlogPosts, toggleBlogPostStatus } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string;
  authorId: string;
  authorName: string;
  status: string;
  tags: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

interface BlogTableProps {
  posts: BlogPost[];
}

export function BlogTable({ posts }: BlogTableProps) {
  const router = useRouter();
  const [data, setData] = React.useState<BlogPost[]>(() => posts);

  React.useEffect(() => {
    setData(posts);
  }, [posts]);

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({ shallow: true }),
  );
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true }),
  );
  const [pageSize, setPageSize] = useQueryState(
    "size",
    parseAsInteger.withDefault(10).withOptions({ shallow: true }),
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("all").withOptions({ shallow: true }),
  );

  const [isPending, startTransition] = React.useTransition();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const filteredData = React.useMemo(() => {
    let result = [...data];

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(s)),
      );
    }

    return result;
  }, [data, search, statusFilter]);

  const pagination = React.useMemo(
    () => ({ pageIndex: page - 1, pageSize }),
    [page, pageSize],
  );

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    startTransition(async () => {
      const result = await deleteBlogPost(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Post deleted");
        setData((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      }
    });
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} post(s)?`)) return;
    startTransition(async () => {
      const result = await deleteBlogPosts(selectedIds);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Posts deleted");
        setData((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setRowSelection({});
        router.refresh();
      }
    });
  };

  const handleToggleStatus = (id: string) => {
    startTransition(async () => {
      const result = await toggleBlogPostStatus(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Post ${result.newStatus === "published" ? "published" : "unpublished"}`);
        setData((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status: result.newStatus!,
                  publishedAt:
                    result.newStatus === "published" && !p.publishedAt
                      ? new Date().toISOString()
                      : result.newStatus === "draft"
                        ? null
                        : p.publishedAt,
                }
              : p,
          ),
        );
        router.refresh();
      }
    });
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      id: "select",
      size: 40,
      header: ({ table }) => (
        <div className="flex items-center justify-center w-10">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-10">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "cover",
      header: "Cover",
      size: 72,
      cell: ({ row }) => (
        <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 flex-shrink-0">
          {row.original.coverImage ? (
            <Image
              src={row.original.coverImage}
              alt={row.original.title}
              width={56}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <ImageIcon className="size-4 text-slate-300" />
          )}
        </div>
      ),
      enableSorting: false,
    },
    {
      id: "titleExcerpt",
      header: "Title",
      size: 280,
      cell: ({ row }) => (
        <div className="w-[280px] space-y-0.5">
          <p className="font-medium text-sm truncate" title={row.original.title}>
            {row.original.title}
          </p>
          {row.original.excerpt && (
            <p className="text-[11px] text-muted-foreground truncate" title={row.original.excerpt}>
              {row.original.excerpt}
            </p>
          )}
        </div>
      ),
      filterFn: (row, _, filterValue) => {
        const s = String(filterValue).toLowerCase();
        return (
          row.original.title.toLowerCase().includes(s) ||
          (row.original.excerpt?.toLowerCase().includes(s) ?? false)
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 110,
      cell: ({ row }) => {
        const isPublished = row.original.status === "published";
        return (
          <Badge
            variant="outline"
            className={
              isPublished
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "authorName",
      header: "Author",
      size: 140,
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground truncate w-[140px]">
          {row.original.authorName || "—"}
        </div>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      size: 180,
      cell: ({ row }) => {
        const tagList = row.original.tags
          ? row.original.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];
        return (
          <div className="flex flex-wrap gap-1 w-[180px]">
            {tagList.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                {tag}
              </span>
            ))}
            {tagList.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{tagList.length - 3}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "date",
      header: "Date",
      size: 110,
      cell: ({ row }) => {
        const date = row.original.publishedAt || row.original.createdAt;
        return (
          <div className="text-xs text-muted-foreground w-[110px]">
            {row.original.publishedAt ? "Published" : "Created"}
            <br />
            {new Date(date).toLocaleDateString()}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 60,
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="flex justify-center w-10">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="size-8 text-muted-foreground"
                    size="icon"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                {post.status === "published" && (
                  <DropdownMenuItem asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <ExternalLink className="mr-2 size-4" />
                      View Post
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/blog/${post.id}/edit`}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleToggleStatus(post.id)}>
                  <ToggleLeft className="mr-2 size-4" />
                  {post.status === "published" ? "Unpublish" : "Publish"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater(pagination);
        setPage(next.pageIndex + 1);
        setPageSize(next.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="All Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-[200px] lg:w-[280px]"
            />
            {Object.keys(rowSelection).length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>
                <Trash className="size-4" />
                <span>Delete Selected ({Object.keys(rowSelection).length})</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm">
                    <LayoutIcon className="size-4" />
                    <span className="hidden lg:inline">Columns</span>
                    <ChevronDown className="size-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      className="capitalize"
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border mx-4 lg:mx-6">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No blog posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BlogPaginationControls table={table} />
    </div>
  );
}

function BlogPaginationControls({
  table,
}: {
  table: ReturnType<typeof useReactTable<BlogPost>>;
}) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6">
      <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex w-full items-center gap-8 lg:w-fit">
        <div className="hidden items-center gap-2 lg:flex">
          <Label htmlFor="blog-rows-per-page" className="text-sm font-medium">
            Rows per page
          </Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger size="sm" className="w-20" id="blog-rows-per-page">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((ps) => (
                <SelectItem key={ps} value={`${ps}`}>
                  {ps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-fit items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">First page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 lg:flex"
            size="icon"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
