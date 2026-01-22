'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Ara...',
  pageSize = 10,
  onRowClick,
  onRefresh,
  onExport,
  emptyMessage = 'Veri bulunamadı',
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key as keyof T];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [data, searchQuery, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ArrowUpDown size={14} />;
    if (sortDirection === 'asc') return <ArrowUp size={14} />;
    return <ArrowDown size={14} />;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {searchable && (
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.searchInput}
            />
          </div>
        )}
        
        <div className={styles.toolbarActions}>
          {actions}
          {onRefresh && (
            <button className={styles.toolbarBtn} onClick={onRefresh} title="Yenile">
              <RefreshCw size={18} className={loading ? styles.spinning : ''} />
            </button>
          )}
          {onExport && (
            <button className={styles.toolbarBtn} onClick={onExport} title="Dışa Aktar">
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={String(col.key)} 
                  style={{ width: col.width }}
                  className={col.sortable ? styles.sortable : ''}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className={styles.thContent}>
                    {col.title}
                    {col.sortable && (
                      <span className={styles.sortIcon}>
                        {getSortIcon(String(col.key))}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} className={styles.skeletonRow}>
                  {columns.map((col, j) => (
                    <td key={j}>
                      <div className={styles.skeletonCell} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr 
                  key={index} 
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? styles.clickable : ''}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render 
                        ? col.render(row[col.key as keyof T], row, startIndex + index)
                        : String(row[col.key as keyof T] ?? '-')
                      }
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} / {sortedData.length} kayıt
          </span>
          
          <div className={styles.pageButtons}>
            <button 
              className={styles.pageBtn}
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className={styles.pageNumber}>
              Sayfa {currentPage} / {totalPages}
            </span>
            
            <button 
              className={styles.pageBtn}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
            <button 
              className={styles.pageBtn}
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
