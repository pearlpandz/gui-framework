import React, { useEffect, useRef, useState } from "react";

// Shared Components
import Button from "../../button";
import Checkbox from "../../checkbox";
import InputText from "../../input";

// Styles
import styles from "./dataTableHeader.module.scss";

// Assets
import gear from "../../assets/settings.svg";
import order from "../../assets/menu.svg";
import search from "../../assets/simple-search.svg";

interface Column {
  field: string;
  display_name: string;
  sort?: boolean;
  visible?: boolean;
  width?: number;
  [key: string]: any;
}

interface DataTableHeaderProps {
  tableColumns: Column[];
  setTableColumns: any;
  columnReorder?: boolean;
  columnVisibility?: boolean;
  totalRecords: number;
  handleColumnReorder?: (data: Column[]) => void;
  handleColumnVisibility?: (data: Column[]) => void;
}

const DataTableHeader: React.FC<DataTableHeaderProps> = (props) => {
  const {
    tableColumns = [],
    setTableColumns,
    columnReorder = false,
    columnVisibility = false,
    totalRecords = 0,
    handleColumnReorder,
    handleColumnVisibility,
  } = props;

  const wrapperRef = useRef<any>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showOptions &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showOptions, wrapperRef]);

  const handleDragStart = (
    event: React.DragEvent<HTMLImageElement>,
    index: number
  ) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    event.preventDefault();
    if (dragIndex === index) return;

    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = () => {
    // The useage of exclamatory at certain lines says the variable won't be null or undefined . Since Typescript not able to identify
      const newColumns = structuredClone(tableColumns);
      const draggedItem = newColumns[dragIndex!];
      newColumns.splice(dragIndex!, 1);
      newColumns.splice(dragOverIndex!, 0, draggedItem);
      setTableColumns(newColumns);
      setDragIndex(null);
      setDragOverIndex(null);
      handleColumnReorder?.(newColumns);
  };

  const handleTableColumnsVisibility = (event: React.ChangeEvent<HTMLInputElement>, item: Column) => {
    let requiredData = tableColumns.map((selectedItem: Column) => {
      if (selectedItem.field === item.field) {
        return { ...selectedItem, visible: event.target.checked };
      }
      return selectedItem;
    });
    setTableColumns(requiredData);
    handleColumnVisibility?.(requiredData);
  };

  const handleGearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setShowOptions(!showOptions);
    setQuery("");
  };

  return (
    <div className={styles.header_container}>
      {totalRecords && (
        <div className={styles.result_container}>
          {totalRecords} records found
        </div>
      )}
      <div className={styles.gear_section} ref={wrapperRef}>
        <Button
          icon={gear}
          label="Customise Columns"
          onClick={(event:React.MouseEvent<HTMLButtonElement>) => handleGearClick(event)}
          className={styles.gear_icon}
          ref={wrapperRef}
          outlined={true}
        />
      </div>
      {showOptions && (
        <div className={styles.list_container} ref={wrapperRef}>
          {tableColumns?.length > 0 ? (
            <div className={styles.search}>
              <InputText
                icon={search}
                placeholder="Search Columns..."
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
                className={styles.column_input}
                value={query}
              />
            </div>
          ) : (
            <div className={styles.empty_message}>No Columns Available</div>
          )}
          {tableColumns
            ?.filter((item: Column) =>
              (item?.display_name || item?.field)
                ?.toLowerCase()
                ?.includes(query?.toLowerCase())
            )
            .map((item: Column, index: number) => (
              <div
                key={item.field}
                className={`${styles.column_item} ${
                  dragIndex === index && styles.dragging
                } ${dragOverIndex === index && styles.draggingOver}`}
                onDragOver={(event: React.DragEvent<HTMLDivElement>) =>
                  handleDragOver(event, index)
                }
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <span className={styles.column_action_section}>
                  {columnReorder && (
                    <img
                      src={order}
                      alt="grabber"
                      className={`${styles.grabber} ${
                        dragIndex === index && styles.dragging
                      }`}
                      onDragStart={(event: React.DragEvent<HTMLImageElement>) =>
                        handleDragStart(event, index)
                      }
                      draggable={columnReorder}
                    />
                  )}
                  {columnVisibility && (
                    <Checkbox
                      checked={
                        Object.prototype.hasOwnProperty.call(item, "visible") &&
                        typeof item.visible === "boolean"
                          ? item.visible
                          : true
                      }
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        handleTableColumnsVisibility(event, item)
                      }
                    />
                  )}
                </span>
                <span>
                  <p>{item.display_name}</p>
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DataTableHeader;
