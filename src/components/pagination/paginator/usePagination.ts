import { useMemo } from "react";

const range = (start:number, end:number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
};

interface PaginationProps {
    totalCount: number;
    pageSize: number;
    siblingCount: number;
    currentPage: number;
  }

export const usePagination = ({
    totalCount,
    pageSize,
    siblingCount,
    currentPage
}: PaginationProps) => {
    const paginationRange = useMemo(() => {
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const totalPageNumbers = siblingCount + 5;

        if (totalPageNumbers >= totalPageCount) {
            return range(1, totalPageCount);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
        const rightSiblingIndex =
            leftSiblingIndex > 1
                ? Math.min(currentPage + siblingCount, totalPageCount)
                : 5;

        let middleRange = range(leftSiblingIndex, rightSiblingIndex);

        return [...middleRange];
    }, [totalCount, pageSize, siblingCount, currentPage]);

    return paginationRange;
};
