import React, {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Custom Shared Components
import Checkbox from "../checkbox";
import RadioButton from "../radio";
import Button from "../button";
import Loader from "../loader";

// Table Components
import SingleSorting from "./sorting/singleSorting";
import MultiSorting from "./sorting/multiSorting";
import DataTableHeader from "./tableHeader";
import ColumnFiltering from "./filtering";

// Utils
import { generateUID } from "./filtering/utils";

// Interface
import { FILTERVALUE, ICONSTRAINTS } from "./filtering/filterInterface";

// Styles
import styles from "./dataTable.module.scss";
import "./dataTable.css";

// Assets
import expand_right from "../assets/chevron-right.svg";

interface Column {
  field: string;
  display_name: string;
  sort?: boolean;
  visible?: boolean;
  width?: number;
  filter?: boolean;
  filterType?: string;
  [key: string]: any;
}

interface SelectionProps {
  [key: string]: any;
}

interface Sorting {
  sortOrder: number;
  sortBy: string;
}

interface DefaultValue {
  matchMode: string;
  value: FILTERVALUE;
  [key: string]: any;
}

interface DataTableProps {
  /* Mandatory Props */
  dataKey: string;
  data: object[];
  columns: Column[];
  status: "success" | "error";
  loading: boolean;

  /* Optional Props */

  // Others
  className?: string;
  stripedRows?: boolean;
  showGridLines?: boolean;
  emptyMessage?: string;
  bodyTemplate?: (rowData: object, col: Column) => ReactNode;
  errorTemplate?: string | ReactNode;

  // Scroll
  scrollable?: boolean;
  scrollHeight?: string | number;

  // Row  expand
  expandRows?: boolean;
  rowExpansionTemplate?: (rowData: object) => ReactNode;

  // Selection
  selectionMode?: "radio" | "checkbox";
  selection?: SelectionProps | SelectionProps[] | any;
  allRowSelection?: boolean;
  onRowSelection?: (rowData: object) => void;
  onAllRowSelection?: (selected: object[]) => void;
  highlightSelectedRow?: boolean;

  // Sort
  sortable?: boolean;
  sortMode?: "single" | "multi";
  handleSort?: (data: any) => void;

  // Column Customize
  resizableColumns?: boolean;
  handleColumnResize?: (data: Column[]) => void;
  columnReorder?: boolean;
  columnVisibility?: boolean;
  handleColumnReorder?: (data: Column[]) => void;
  handleColumnVisibility?: (data: Column[]) => void;

  // Infinite Scroll
  infinitescroll?: boolean;
  handleInfiniteScroll?: () => void; // mandatory if infinitescroll is true
  infiniteLoading?: boolean;
  totalRecords?: number; // mandatory if infinitescroll is true

  // Column Filter
  filterable?: boolean;
  filters?: any;
  filterValue?: (field: string, value: any) => void;
  filterLimit?:number
}

const defaultmatchmode = (columns: Column[], filters: any) => {
  const _constraintsValue: ICONSTRAINTS[] = [];
  columns?.forEach((column) => {
    const defaultValue: DefaultValue[] = filters?.[column.field]?.constraints;
    switch (column.filterType) {
      case "date": {
        defaultValue?.forEach(({ matchMode, value }) => {
          _constraintsValue.push({
            id: generateUID(),
            matchMode: matchMode || "dateIs",
            query: value || null,
            column: column.field,
          });
        });
        break;
      }
      case "number": {
        defaultValue?.forEach(({ matchMode, value }) => {
          _constraintsValue.push({
            id: generateUID(),
            matchMode: matchMode || "equals",
            query: value || "",
            column: column.field,
          });
        });
        break;
      }
      case "boolean": {
        defaultValue?.forEach(({ matchMode }) => {
          _constraintsValue.push({
            id: generateUID(),
            matchMode: matchMode || "equals",
            query: true,
            column: column.field,
          });
        });
        break;
      }
      default: {
        defaultValue?.forEach(({ matchMode, value }) => {
          _constraintsValue.push({
            id: generateUID(),
            matchMode: matchMode || "contains",
            query: value || "",
            column: column.field,
          });
        });
        break;
      }
    }
  });
  return _constraintsValue;
};

export const DataTable = (props: DataTableProps) => {
  const {
    dataKey = "index",
    data = [],
    columns = [],
    status = "success",
    loading = false,
    className = "",
    stripedRows = false,
    showGridLines = false,
    emptyMessage = "",
    bodyTemplate,
    errorTemplate,
    scrollable = false,
    scrollHeight = "400px",
    expandRows = false,
    rowExpansionTemplate,
    selectionMode = "", //radio || checkbox
    selection,
    allRowSelection = true,
    onRowSelection,
    onAllRowSelection,
    highlightSelectedRow = false,
    sortable = false,
    sortMode = "single",
    handleSort,
    resizableColumns = false,
    handleColumnResize,
    columnReorder,
    columnVisibility,
    handleColumnReorder,
    handleColumnVisibility,
    infinitescroll = false,
    handleInfiniteScroll,
    infiniteLoading = false,
    totalRecords = 0,
    filterable = false,
    filters,
    filterValue,
    filterLimit = 0,
  } = props;

  const observer = useRef<IntersectionObserver | null>(null);
  const [rowExpand, setRowExpand] = useState<any>([]);
  const [sorting, setSorting] = useState<any>(sortMode === "single" ? {} : []);
  const [tableColumns, setTableColumns] = useState<Column[]>(columns);
  const [columnResize, setColumnResize] = useState<
    Record<string, string | number>
  >({});
  const [constraintsValue, setConstraintsValue] = useState<ICONSTRAINTS[]>(
    defaultmatchmode(tableColumns, filters)
  );
  const [filteredColValue, setFilteredColValue] = useState<any>(filters);

  const colSpan =
    tableColumns?.filter((a: Column) =>
      Object.prototype.hasOwnProperty.call(a, "visible") ? a.visible : a
    )?.length + 2;

  useEffect(() => {
    setTableColumns(tableColumns);
    const _constraintsValue = structuredClone(constraintsValue);
    setConstraintsValue(_constraintsValue);
  }, [tableColumns]);

  useEffect(() => {
    if (!resizableColumns) return;

    const createResizableTable = function (table: HTMLTableElement) {
      const cols = table.querySelectorAll("th");
      [].forEach.call(cols, function (col: HTMLTableHeaderCellElement) {
        // Check if the column should not be resizable (based on props)
        // Basically for selection and row expansion columns there won't be any heading so using innerText
        const isSelectionOrExpansionColumn = col.innerText.length === 0;

        // Skip resizer if it's a column based on selectionMode or expandRows
        if (isSelectionOrExpansionColumn) {
          return; // Skip resizer for this column
        }

        const resizer = document.createElement("div");
        resizer.classList.add("resizer");

        resizer.style.height = "45px"; // Keep a fixed height for the resizer

        col.appendChild(resizer);
        const field = col.getAttribute("data-field") || "";

        createResizableColumn(col, resizer, field);
      });
    };

    const createResizableColumn = function (
      col: HTMLTableHeaderCellElement,
      resizer: HTMLDivElement,
      field: string
    ) {
      let x: number = 0;
      let w: number = 0;
      let dx: number = 0;
      let finalWidth: string | number = 0;

      const mouseDownHandler = function (e: MouseEvent) {
        x = e.clientX;
        const styles = window.getComputedStyle(col);
        w = parseInt(styles.width, 10);

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        resizer.classList.add("resizing");
      };

      const mouseMoveHandler = function (e: MouseEvent) {
        dx = e.clientX - x;

        if (w + dx >= 150) {
          //To keep the min width of an column to 150 px and not to allow resizing below that
          finalWidth = `${w + dx}px`;
          col.style.width = finalWidth;
          col.style.minWidth = finalWidth;
          col.style.maxWidth = finalWidth;
        }
      };

      const mouseUpHandler = function () {
        resizer.classList.remove("resizing");
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);

        setColumnResize({
          [field]: finalWidth, // Storing the width in state to use for handleResize from user side
        });
      };

      resizer.addEventListener("mousedown", mouseDownHandler);
    };

    const tableElement = document.getElementById("table_resize");
    if (tableElement && tableElement instanceof HTMLTableElement) {
      createResizableTable(tableElement);
    }
  }, [resizableColumns, selectionMode, expandRows, tableColumns]);

  useEffect(() => {
    if (resizableColumns && handleColumnResize) {
      if (Object.keys(columnResize).length > 0) {
        const _tableColumns: any = tableColumns.map((item: Column) => {
          if (item.field === Object.keys(columnResize)[0]) {
            return { ...item, width: columnResize[item.field] };
          }
          return item;
        });
        setTableColumns(_tableColumns);
        const getData = setTimeout(async () => {
          await handleColumnResize(_tableColumns);
        }, 1000);
        return () => clearTimeout(getData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnResize, handleColumnResize, resizableColumns]);

  const handleInfiniteRef = useCallback(
    (node: HTMLTableSectionElement | null) => {
      if (infiniteLoading) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          data.length > 0 &&
          data.length <= totalRecords
        ) {
          handleInfiniteScroll?.();
        }
      });
      if (node) observer.current.observe(node);
    },
    [data, handleInfiniteScroll, infiniteLoading, totalRecords]
  );

  const allRowSelectionHandling = () => {
    if (
      selectionMode === "checkbox" &&
      Array.isArray(selection) &&
      selection !== null
    ) {
      if (data.length !== selection?.length) {
        onAllRowSelection?.(data);
      } else {
        onAllRowSelection?.([]);
      }
    }
  };

  const onColumnSorting = (data: Sorting | Sorting[]) => {
    setSorting(data);
    handleSort?.(data);
  };

  const handleRowSelection = (rowData: Record<string, any>) => {
    if (selectionMode === "radio") {
      onRowSelection?.(rowData);
    } else {
      const _selection = Array.isArray(selection)
        ? structuredClone(selection)
        : [];
      const index = selection?.findIndex(
        (selectedItem: { [x: string]: any }) =>
          selectedItem?.[dataKey] === rowData?.[dataKey]
      );
      if (index > -1) {
        _selection?.splice(index, 1);
        onRowSelection?.(_selection);
      } else {
        onRowSelection?.([...(_selection || []), rowData]);
      }
    }
  };

  const expandRow = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: string | number
  ) => {
    if ((event.target as HTMLElement).className.includes("expanded")) {
      // take action :: collapse
      (event.target as HTMLElement).style.transform = "rotate(0deg)";
      (event.target as HTMLElement).classList.remove("expanded");

      const keys = Object.keys(rowExpand);
      const index = keys.findIndex((a) => a === String(id));
      if (index > -1) {
        let _rowExpand = structuredClone(rowExpand);
        delete _rowExpand[keys[index]?.toString()];
        setRowExpand({ ..._rowExpand });
      }
    } else {
      // take action :: expand
      (event.target as HTMLElement).style.transform = "rotate(90deg)";
      (event.target as HTMLElement).classList.add("expanded");
      setRowExpand({ ...rowExpand, [id]: true });
    }
  };

  const handleColFilter = (field: string, value: any) => {
    filterValue?.(field, value);
    let _filters = structuredClone(filters);
    _filters[field] = value;
    setFilteredColValue(_filters);
  };

  const simpleTableHeader = useMemo(() => {
    return (
      <tr className={styles.table_header_row}>
        {selectionMode.length > 0 && (
          <th
            className={
              showGridLines
                ? `${styles.table_header_column} ${styles.activate_grid}`
                : styles.table_header_column
            }
            style={{ width: "3rem", minWidth: "3rem" }}
          >
            {selectionMode === "checkbox" && (
              <div className={styles.table_header_content}>
                {allRowSelection && (
                  <Checkbox
                    checked={data?.length === selection?.length}
                    onChange={allRowSelectionHandling}
                  />
                )}
              </div>
            )}
          </th>
        )}

        {expandRows && (
          <th
            className={
              showGridLines
                ? `${styles.table_header_column} ${styles.activate_grid}`
                : styles.table_header_column
            }
            style={{ width: "3rem", minWidth: "3rem" }}
          ></th>
        )}

        {tableColumns &&
          Array.isArray(tableColumns) &&
          tableColumns.length > 0 &&
          tableColumns
            ?.filter((item: Column) =>
              Object.prototype.hasOwnProperty.call(item, "visible")
                ? item.visible
                : item
            )
            ?.map((item: Column, index: number) => (
              <th
                className={
                  showGridLines
                    ? `${styles.table_header_column} ${styles.activate_grid}`
                    : styles.table_header_column
                }
                key={index}
                data-field={item.field}
                style={{
                  width: item.width,
                  minWidth: item.width,
                  maxWidth: item.width,
                }}
              >
                <div className={styles.table_header_content}>
                  <span className={styles.table_header_column_title}>
                    {item?.display_name}
                  </span>
                  {(sortable &&
                  Object.prototype.hasOwnProperty.call(item, "sort")
                    ? item.sort
                    : item.field) && (
                    <Fragment>
                      {sortable && sortMode === "single" && (
                        <SingleSorting
                          column={item?.field}
                          setSorting={onColumnSorting}
                          sorting={
                            item?.field === sorting?.sortBy ? sorting : null
                          }
                        />
                      )}
                      {sortable && sortMode === "multi" && (
                        <MultiSorting
                          column={item?.field}
                          setSorting={onColumnSorting}
                          sorting={sorting}
                        />
                      )}
                    </Fragment>
                  )}
                  {(filterable &&
                  Object.prototype.hasOwnProperty.call(item, "filter")
                    ? item.filter
                    : item.field) && (
                    <Fragment>
                      <ColumnFiltering
                        column={item}
                        applyFilter={(field: string, value: any) => {
                          handleColFilter?.(field, value);
                        }}
                        clearFilter={(field: string, value: any) => {
                          handleColFilter?.(field, value);
                        }}
                        constraintsValue={constraintsValue}
                        setConstraintsValue={setConstraintsValue}
                        filteredColValue={filteredColValue}
                        filterLimit={filterLimit}
                      />
                    </Fragment>
                  )}
                </div>
              </th>
            ))}
      </tr>
    );
  }, [
    selectionMode,
    showGridLines,
    data,
    selection,
    expandRows,
    tableColumns,
    sortable,
    sortMode,
    sorting,
    filterable,
    constraintsValue,
    filterLimit,
  ]);

  const simpleTableBody = useMemo(() => {
    return data && Array.isArray(data) && data.length > 0 ? (
      data?.map((rowData: { [x: string]: any }, index: number) => (
        <Fragment key={index}>
          <tr
            className={
              stripedRows && index % 2 === 0
                ? `${styles.table_body_row} ${styles.striped_active}`
                : highlightSelectedRow &&
                  !stripedRows &&
                  (selectionMode === "radio"
                    ? typeof selection === "object" &&
                      selection !== null &&
                      selection?.[dataKey] === rowData[dataKey]
                    : selection?.findIndex(
                        (selectedItem: { [x: string]: any }) =>
                          selectedItem?.[dataKey] === rowData?.[dataKey]
                      ) > -1)
                ? `${styles.table_body_row} ${styles.selected}`
                : styles.table_body_row
            }
            key={index}
          >
            {selectionMode?.length > 0 && (
              <td
                className={
                  showGridLines
                    ? `${styles.table_body_row_column_data} ${styles.activate_grid}`
                    : styles.table_body_row_column_data
                }
              >
                {selectionMode === "checkbox" ? (
                  <Checkbox
                    checked={
                      selection?.findIndex(
                        (selectedItem: { [x: string]: any }) =>
                          selectedItem?.[dataKey] === rowData?.[dataKey]
                      ) > -1
                    }
                    onChange={() => handleRowSelection(rowData)}
                    id={`checkbox_row${dataKey}`}
                  />
                ) : (
                  <RadioButton
                    id={`radioButton_row${dataKey}`}
                    name={rowData[dataKey]}
                    value={rowData[dataKey]}
                    checked={selection?.[dataKey] === rowData?.[dataKey]}
                    onChange={() => handleRowSelection(rowData)}
                  />
                )}
              </td>
            )}

            {expandRows && (
              <td
                className={
                  showGridLines
                    ? `${styles.table_body_row_column_data} ${styles.activate_grid}`
                    : styles.table_body_row_column_data
                }
              >
                <Button
                  icon={expand_right}
                  className={styles.row_toggler}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                    expandRow(event, rowData[dataKey])
                  }
                  style={{
                    border:
                      (stripedRows && index % 2) === 0 && "1px solid #fff",
                  }}
                />
              </td>
            )}

            {tableColumns
              ?.filter((item: Column) =>
                Object.prototype.hasOwnProperty.call(item, "visible")
                  ? item.visible
                  : item
              )
              .map((col: Column, index: number) => {
                const cellData = bodyTemplate
                  ? bodyTemplate(rowData, col)
                  : rowData?.[col?.field];
                return (
                  <td
                    className={
                      showGridLines
                        ? `${styles.table_body_row_column_data} ${styles.activate_grid}`
                        : styles.table_body_row_column_data
                    }
                    key={index}
                  >
                    {cellData}
                  </td>
                );
              })}
          </tr>
          {rowExpand?.[rowData?.[dataKey]] && (
            <tr className={styles.expansion_template}>
              <td colSpan={colSpan}>{rowExpansionTemplate?.(rowData)}</td>
            </tr>
          )}
        </Fragment>
      ))
    ) : (
      <Fragment>
        <tr>
          <td colSpan={colSpan}>
            <span
              className={styles.message_container}
              style={{ height: "430px", minHeight: "430px" }}
            >
              {typeof emptyMessage === "string" && emptyMessage.length > 0
                ? emptyMessage
                : "No records found"}
            </span>
          </td>
        </tr>
      </Fragment>
    );
  }, [
    data,
    stripedRows,
    highlightSelectedRow,
    selectionMode,
    selection,
    dataKey,
    showGridLines,
    expandRows,
    tableColumns,
    rowExpand,
    colSpan,
    rowExpansionTemplate,
    bodyTemplate,
    emptyMessage,
  ]);

  return (
    <div className={styles.component_container}>
      {(columnReorder || columnVisibility) && (
        <div className={styles.dataTable_header_container}>
          <DataTableHeader
            tableColumns={tableColumns}
            setTableColumns={setTableColumns}
            columnReorder={columnReorder}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            handleColumnReorder={handleColumnReorder}
            handleColumnVisibility={handleColumnVisibility}
          />
        </div>
      )}
      <div
        className={`${styles.table_container} ${styles?.[className]}`}
        id="table_container"
      >
        <div
          className={styles.table_wrapper}
          style={{
            maxHeight: scrollable ? scrollHeight : "",
            height: scrollable ? scrollHeight : "",
          }}
        >
          <table
            className={styles.table}
            id={resizableColumns ? "table_resize" : ""}
          >
            <thead
              className={
                scrollable
                  ? `${styles.table_header} ${styles.scrollable}`
                  : styles.table_header
              }
            >
              {simpleTableHeader}
            </thead>
            <tbody className={styles.table_body}>
              {loading ? (
                <tr>
                  <td colSpan={colSpan}>
                    <span
                      className={styles.message_container}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        height: "430px",
                        minHeight: "430px",
                      }}
                    >
                      <Loader message="Loading..." />
                    </span>
                  </td>
                </tr>
              ) : status === "error" ? (
                <tr>
                  <td colSpan={colSpan}>
                    <span
                      className={styles.message_container}
                      style={{ height: "430px", minHeight: "430px" }}
                    >
                      {errorTemplate ? errorTemplate : "Some Error Occurred"}
                    </span>
                  </td>
                </tr>
              ) : (
                simpleTableBody
              )}
            </tbody>
            {infinitescroll &&
              status !== "error" &&
              data.length > 0 &&
              !loading &&
              data.length < totalRecords && (
                <tfoot ref={handleInfiniteRef}>
                  {infiniteLoading && (
                    <tr>
                      <td colSpan={colSpan} style={{ padding: "15px 0 0 0" }}>
                        {<Loader message="Loading..." />}
                      </td>
                    </tr>
                  )}
                </tfoot>
              )}
          </table>
        </div>
      </div>
    </div>
  );
};
