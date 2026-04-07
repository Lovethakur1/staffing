import { useState, useMemo } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  RefreshCw,
  X,
  Calendar,
  Users,
  MapPin,
  Clock,
  DollarSign,
  MoreHorizontal
} from "lucide-react";

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number';
  filterOptions?: { label: string; value: string }[];
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKey?: string;
  exportable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: (row: T) => React.ReactNode;
  bulkActions?: {
    label: string;
    action: (selectedRows: T[]) => void;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  className?: string;
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  subtitle,
  searchable = true,
  exportable = false,
  refreshable = false,
  onRefresh,
  onExport,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  loading = false,
  emptyMessage = "No data available",
  actions,
  bulkActions,
  className = "",
  mobileCardRender
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => {
          const value = row[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortConfig.direction === 'asc' 
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    return filtered;
  }, [data, searchQuery, filters, sortConfig, columns]);

  // Pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Remove sorting
        }
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const handleFilter = (key: string, value: string) => {
    setFilters(current => ({
      ...current,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setSortConfig(null);
    setCurrentPage(1);
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => startIndex + index)));
    }
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary" />
      : <ArrowDown className="w-4 h-4 text-primary" />;
  };

  const renderPagination = () => (
    <div className="border-t bg-muted/20">
      {/* Mobile Pagination */}
      <div className="sm:hidden">
        {/* Status Info */}
        <div className="flex flex-col items-center gap-2 p-3 text-center border-b border-border/50">
          <div className="text-xs text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
          </div>
          {selectedRows.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedRows.size} selected
            </Badge>
          )}
        </div>
        
        {/* Page Size Control */}
        <div className="flex items-center justify-center gap-2 p-3 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Show:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">entries</span>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground font-medium">
            Page {currentPage} of {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {startIndex + 1} to {endIndex} of {totalItems} entries
          </span>
          {selectedRows.size > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedRows.size} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(current => Math.max(1, current - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(current => Math.min(totalPages, current + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const hasActiveFilters = searchQuery.trim() || Object.values(filters).some(v => v) || sortConfig;

  return (
    <Card className={`w-full ${className}`}>
      {(title || subtitle || searchable || exportable || refreshable) && (
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-64"
                  />
                </div>
              )}

              {/* Column Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {Object.values(filters).some(v => v) && (
                      <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                        {Object.values(filters).filter(v => v).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Filter Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.filter(col => col.filterable).map(column => (
                    <div key={column.key} className="p-2">
                      <label className="text-sm font-medium mb-1 block">
                        {column.title}
                      </label>
                      <Input
                        placeholder={`Filter ${column.title.toLowerCase()}...`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value)}
                        className="h-8"
                      />
                    </div>
                  ))}
                  {Object.values(filters).some(v => v) && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {refreshable && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}

              {exportable && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {bulkActions && selectedRows.size > 0 && (
            <div className="flex items-center gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} items selected:
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const selectedData = Array.from(selectedRows).map(i => data[i]);
                    action.action(selectedData);
                    setSelectedRows(new Set());
                  }}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading...</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {bulkActions && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                          onChange={handleSelectAll}
                          className="rounded border-input"
                        />
                      </TableHead>
                    )}
                    {columns.map(column => (
                      <TableHead 
                        key={column.key}
                        className={`${column.width || ''} ${column.align ? `text-${column.align}` : ''}`}
                      >
                        {column.sortable ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 p-0 hover:bg-transparent"
                            onClick={() => handleSort(column.key)}
                          >
                            <span className="mr-2">{column.title}</span>
                            {getSortIcon(column.key)}
                          </Button>
                        ) : (
                          column.title
                        )}
                      </TableHead>
                    ))}
                    {actions && <TableHead className="w-16">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow key={index} className="hover:bg-muted/50">
                      {bulkActions && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(startIndex + index)}
                            onChange={() => handleSelectRow(startIndex + index)}
                            className="rounded border-input"
                          />
                        </TableCell>
                      )}
                      {columns.map(column => (
                        <TableCell 
                          key={column.key}
                          className={column.align ? `text-${column.align}` : ''}
                        >
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell>
                          {actions(row)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-4 p-4">
              {paginatedData.map((row, index) => (
                <div key={index}>
                  {mobileCardRender ? (
                    mobileCardRender(row, index)
                  ) : (
                    <Card className="p-4">
                      {bulkActions && (
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(startIndex + index)}
                            onChange={() => handleSelectRow(startIndex + index)}
                            className="rounded border-input"
                          />
                          <span className="text-sm text-muted-foreground">Select item</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {columns.map(column => (
                          <div key={column.key} className="flex justify-between items-start">
                            <span className="text-sm font-medium text-muted-foreground">
                              {column.title}:
                            </span>
                            <span className="text-sm text-right">
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </span>
                          </div>
                        ))}
                        {actions && (
                          <div className="pt-2 border-t">
                            {actions(row)}
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && paginatedData.length > 0 && renderPagination()}
      </CardContent>
    </Card>
  );
}
