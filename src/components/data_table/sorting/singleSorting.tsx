import React, { useMemo } from "react";

// Assets
import defaultSort from "../../assets/sort.svg";
import sortASC from "../../assets/sort-asc.svg";
import sortDESC from "../../assets/sort-desc.svg";

// Styles
import styles from "./sorting.module.scss";

interface Sorting {
  sortOrder:0 | 1 | -1,
  sortBy:string
}

interface SingleSortingProps {
  column: string;
  setSorting: (data:Sorting) => void;
  sorting: Sorting;
}

const SingleSorting: React.FC<SingleSortingProps> = (props) => {
  const { column, setSorting, sorting } = props; //column - to get the particular column while sorting

  const handleSort = (column:string) => {
    let order = 0;
    const sortOrder = sorting?.sortOrder;
    if (!sortOrder) {
      order = 1;
    } else if (sortOrder === 1) {
      order = -1;
    } else if (sortOrder === -1) {
      order = 0;
    }
    setSorting({ sortOrder: order, sortBy: column });
  };

  const sortIcon = useMemo(() => {
    const sortOrder = sorting?.sortOrder;
    if (!sortOrder) {
      return (
        <img
          className={styles.sort_icon}
          src={defaultSort}
          alt="default_sort"
        />
      );
    } else if (sortOrder === 1) {
      return <img className={styles.sort_icon} src={sortASC} alt="sort_asc" />;
    } else if (sortOrder === -1) {
      return (
        <img className={styles.sort_icon} src={sortDESC} alt="sort_desc" />
      );
    } else {
      return (
        <img
          className={styles.sort_icon}
          src={defaultSort}
          alt="default_sort"
        />
      );
    }
  }, [sorting]);

  return <span onClick={() => handleSort(column)}>{sortIcon}</span>;
};

export default SingleSorting;
