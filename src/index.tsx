import { useState } from "react";

// Custom Components
import { DataTable } from "./components/data_table";
import Pagination from "./components/pagination";

// Constants
import {
  DATA,
  FILTERS,
  RECORDPERPAGE,
  SQL_DATA_COLUMNS,
} from "../sample/newConstant";

interface Sorting {
  sortOrder: 0 | 1 | -1;
  sortBy: string;
}

export default function DataContent() {
  const [columns, setColumns] = useState(SQL_DATA_COLUMNS);
  const [filters, setFilters] = useState<any>(FILTERS);

  const getFormattedData = (data: any) => {
    const tdata: any = [];
    [...(data || [])].forEach((d, index) => {
      if (d?.doc) {
        d.doc.id = index;
        tdata.push(d.doc);
      }
    });
    return { tdata };
  };

  const handleStoreColumns = (data: any) => {
    setColumns(data);
  };

  const errorTemplate = (
    <span style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      Error Occurred
    </span>
  );

  const handleSort = (data: Sorting[]) => {
    console.log("sort", data);
  };

  const handleFilter = (field: string, value: any) => {
    let _filters = structuredClone(filters);
    _filters[field] = value;
    setFilters(_filters);
  };

  return (
    <div className="search_page_section">
      <DataTable
        dataKey={"EXPERIMENT_ID"}
        data={getFormattedData(DATA?.hits)?.tdata || []}
        columns={columns}
        loading={false}
        status="success"
        errorTemplate={errorTemplate}
        stripedRows={true}
        showGridLines={true}
        sortable
        sortMode="multi"
        handleSort={handleSort}
        resizableColumns={true}
        handleColumnResize={handleStoreColumns}
        columnReorder={true}
        columnVisibility={true}
        handleColumnReorder={handleStoreColumns}
        handleColumnVisibility={handleStoreColumns}
        totalRecords={43}
        emptyMessage="Currently no records to display"
        filterable={true}
        filters={filters}
        filterValue={(field: any, value: any) => handleFilter(field, value)}
        filterLimit={5}
      />

      <Pagination
        options={RECORDPERPAGE}
        totalRow={25}
        totalRecords={217}
        onPageChange={(data: number) => console.log("page", data)}
        onRowChange={(data: number) => console.log("row", data)}
      />
    </div>
  );
}
