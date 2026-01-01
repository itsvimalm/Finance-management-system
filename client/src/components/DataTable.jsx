import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Eye, ArrowUpDown } from 'lucide-react';
import styles from './DataTable.module.css';

const DataTable = ({ columns, data, onRowClick, actions, searchPlaceholder = "Search..." }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Filter and Sort
    const processedData = useMemo(() => {
        let filtered = [...data];

        if (searchTerm) {
            filtered = filtered.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = processedData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageSizeChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.rowsPerPage}>
                    <span className={styles.pageInfo}>Rows:</span>
                    <select
                        value={itemsPerPage}
                        onChange={handlePageSizeChange}
                        className={styles.rowsPerPageSelect}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={25}>25</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} onClick={() => col.sortable && handleSort(col.accessor)} style={{ cursor: col.sortable ? 'pointer' : 'default' }}>
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && <ArrowUpDown size={14} className={styles.sortIcon} />}
                                    </div>
                                </th>
                            ))}
                            {actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.length > 0 ? (
                            currentData.map((row, rowIndex) => (
                                <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)} className={onRowClick ? styles.clickableRow : ''}>
                                    {columns.map((col, colIndex) => (
                                        <td key={colIndex}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td onClick={(e) => e.stopPropagation()}>
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.noData}>
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {processedData.length > 0 && (
                <div className={styles.pagination}>
                    <div style={{ flex: 1 }}></div> {/* Spacer to push controls to right if needed, or just let justify-content handle it */}

                    <div className={styles.pageControls}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={styles.pageBtn}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className={styles.pageInfo}>
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={styles.pageBtn}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
