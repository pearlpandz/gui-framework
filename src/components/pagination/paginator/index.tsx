import React, { useState } from "react";

// Custom Components
import { usePagination } from "./usePagination";

// Styles
import styles from "./paginator.module.scss";

// Assets
import prevPage from "../../assets/chevron-left.svg";
import nextPage from "../../assets/chevron-right.svg";
import firstPage from "../../assets/chevrons-left.svg";
import lastPage from "../../assets/chevrons-right.svg";
import prevPageDisabled from "../../assets/chevron-left-disabled.svg";
import nextPageDisabled from "../../assets/chevron-right-disabled.svg";
import firstPageDisabled from "../../assets/chevrons-left-disabled.svg";
import lastPageDisabled from "../../assets/chevrons-right-disabled.svg";

interface PaginatorProps {
  pageSize: number;
  totalCount: number;
  onPageChange: (data: number) => void;
  endPagination?: boolean;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

function Paginator(props: PaginatorProps) {
  const { pageSize = 25, totalCount = 0, onPageChange, endPagination } = props;
  const totalPageCount: number = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const siblingCount: number = 2;

  const paginationRange = usePagination({
    totalCount,
    pageSize,
    siblingCount,
    currentPage,
  });

  const currentPageSelection = (page:number) => {
    setCurrentPage(page);
    onPageChange(page);
  };

  const nextPageSelection = () => {
    if (totalCount !== 0 && currentPage !== totalPageCount) {
      setCurrentPage(currentPage + 1);
      onPageChange(currentPage + 1);
    }
  };

  const prevPageSelection = () => {
    if (totalCount !== 0 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      onPageChange(currentPage - 1);
    }
  };

  const firstPageSelection = () => {
    if (totalCount !== 0 && currentPage > 1) {
      setCurrentPage(1);
      onPageChange(1);
    }
  };

  const lastPageSelection = () => {
    if (totalCount !== 0 && currentPage !== totalPageCount) {
      setCurrentPage(totalPageCount);
      onPageChange(totalPageCount);
    }
  };

  return (
    <div className={styles.pagination}>
      {endPagination && (
        <span
          className={
            totalCount === 0 || currentPage === 1
              ? `${styles.prevPageSelect} ${styles.disable}`
              : styles.prevPageSelect
          }
          onClick={() => firstPageSelection()}
        >
          <img
            src={
              totalCount === 0 || currentPage === 1
                ? firstPageDisabled
                : firstPage
            }
            alt={"first_page"}
          />
        </span>
      )}

      <span
        className={
          totalCount === 0 || currentPage === 1
            ? `${styles.prevPageSelect} ${styles.disable}`
            : styles.prevPageSelect
        }
        onClick={() => prevPageSelection()}
      >
        <img
          src={
            totalCount === 0 || currentPage === 1 ? prevPageDisabled : prevPage
          }
          alt={"previous_page"}
        />
      </span>

      <div>
        {paginationRange.map((item, index) => (
          <span
            key={index}
            className={
              currentPage === item
                ? `${styles.selectedPage} ${styles.active}`
                : styles.selectedPage
            }
            onClick={() => currentPageSelection(item)}
          >
            {item}
          </span>
        ))}
      </div>

      <span
        className={
          totalCount === 0 || currentPage === totalPageCount
            ? `${styles.nextPageSelect} ${styles.disable}`
            : styles.nextPageSelect
        }
        onClick={() => nextPageSelection()}
      >
        <img
          src={
            totalCount === 0 || currentPage === totalPageCount
              ? nextPageDisabled
              : nextPage
          }
          alt={"next_page"}
        />
      </span>

      {endPagination && (
        <span
          className={
            totalCount === 0 || currentPage === totalPageCount
              ? `${styles.nextPageSelect} ${styles.disable}`
              : styles.nextPageSelect
          }
          onClick={() => lastPageSelection()}
        >
          <img
            src={
              totalCount === 0 || currentPage === totalPageCount
                ? lastPageDisabled
                : lastPage
            }
            alt={"last_page"}
          />
        </span>
      )}
    </div>
  );
}

export default Paginator;
