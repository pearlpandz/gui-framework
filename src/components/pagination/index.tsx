import React from "react";

// Custom Component
import RecordsPerPage from "./recordperPage";
import Paginator from "./paginator";

// Styles
import styles from "./paginatorContainer.module.scss";

interface PaginationProps {
  options: number[];
  totalRow: number;
  totalRecords: number;
  onPageChange: (data: number) => void;
  onRowChange: (data: number) => void;
  endPagination?: boolean;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

function Pagination(props: PaginationProps) {
  const {
    options = [],
    totalRow = 25,
    totalRecords = 0,
    onPageChange,
    onRowChange,
    endPagination = false,
  } = props;
  return (
    <div className={styles.paginatorContainer}>
      <RecordsPerPage options={options} onRowChange={onRowChange} />
      <Paginator
        pageSize={totalRow}
        totalCount={totalRecords}
        onPageChange={onPageChange}
        endPagination={endPagination}
      />
    </div>
  );
}

export default Pagination;
