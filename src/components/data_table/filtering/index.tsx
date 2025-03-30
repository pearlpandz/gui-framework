import {
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// Third party Components
import { Calendar } from "primereact/calendar";

// Custom Components
import Button from "../../button";
import Dropdown from "../../dropdown";
import InputText from "../../input";

// Utils
import { generateUID } from "./utils";

// Constants
import {
  ALL_MATCH_MODE,
  BOOLEAN_MATCH_MODE,
  DATE_MATCH_MODE,
  NUM_MATCH_MODE,
  OPERATOR,
  STR_MATCH_MODE,
} from "./constant";

// Interface
import {
  FILTERVALUE,
  ICONSTRAINTS,
  IFILTERMATCHMODE,
  IOPTIONS,
} from "./filterInterface";

// Styles
import styles from "./columnFilter.module.scss";
import "./calendar.css";

// Assets
import defaultFilter from "../../assets/filter-default.svg";
import activeFilter from "../../assets/filter-active.svg";
import ADD from "../../assets/add-active.svg";
import DELETE from "../../assets/delete.svg";

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

interface ColumnFilteringProps {
  column: Column;
  clearFilter: (col: string, remove: any) => any;
  applyFilter: (col: string, apply: any) => any;
  constraintsValue: ICONSTRAINTS[];
  setConstraintsValue: React.Dispatch<React.SetStateAction<ICONSTRAINTS[]>>;
  filteredColValue: any;
  filterLimit: number;
}

interface CONSTRAINTSOBJECT {
  value: FILTERVALUE;
  matchMode: IFILTERMATCHMODE;
}

const ColumnFiltering = (props: ColumnFilteringProps) => {
  const {
    column,
    applyFilter,
    clearFilter,
    constraintsValue,
    setConstraintsValue,
    filteredColValue,
    filterLimit,
  } = props;

  const wrapperRef = useRef<any>(null);
  const positionRef = useRef<any>(null);
  const [page, setPage] = useState<{
    top: number | string;
    left: number | string;
  }>({ top: 0, left: 0 });
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [operatorSelected, setOperatorSelected] = useState<IOPTIONS>(
    OPERATOR[0]
  );
  const filteredCol: boolean = filteredColValue[column.field].constraints.some(
    (a: CONSTRAINTSOBJECT) => a.value
  );

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      const calendarElement = document.querySelector(".p-datepicker");
      const clickedInsideCalendar =
        calendarElement && calendarElement.className.includes("p-datepicker");
      if (
        showFilter &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        positionRef.current &&
        !positionRef.current.contains(event.target) &&
        !clickedInsideCalendar
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showFilter, wrapperRef, positionRef]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaX !== undefined && event.deltaX !== 0) {
        setShowFilter(false);
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as any;
      if (target.scrollX > 0) {
        setShowFilter(false);
      }
    };

    // Add event listeners for wheel and scroll
    window.addEventListener("wheel", handleWheel, { passive: true });
    document.body.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup the event listeners
    return () => {
      window.removeEventListener("wheel", handleWheel);
      document.body.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const calculatePosition = (dropdown: any) => {
    const elemRect = dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - elemRect.bottom;
    const spaceSide = viewportWidth - elemRect.left;

    if (spaceSide < 250) {
      setPage({
        top: elemRect.top + window.scrollY + 20,
        left: elemRect.left - 225,
      });
    }
    // If space below is less than 200px, open the list above the div
    else if (spaceBelow < 200) {
      setPage({
        top: elemRect.top + window.scrollY - 205,
        left: elemRect.left,
      });
    } else {
      // Otherwise, open the list below the div
      setPage({
        top: elemRect.bottom + window.scrollY + 5,
        left: elemRect.left,
      });
    }
  };

  const matchModes = useMemo(() => {
    switch (column.filterType) {
      case "date":
        return {
          id: generateUID(),
          matchMode: "dateIs",
          query: null,
          column: column.field,
        };

      case "number":
        return {
          id: generateUID(),
          matchMode: "equals",
          query: "",
          column: column.field,
        };
      case "boolean":
        return {
          id: generateUID(),
          matchMode: "equals",
          query: true,
          column: column.field,
        };
      default:
        return {
          id: generateUID(),
          matchMode: "contains",
          query: "",
          column: column.field,
        };
    }
  }, [column]);

  const handleFilterShow = () => {
    setShowFilter(!showFilter);
    calculatePosition(positionRef.current);
  };

  const defaultModeOptions = (column: Column) => {
    switch (column.filterType) {
      case "string":
        return STR_MATCH_MODE;
      case "number":
        return NUM_MATCH_MODE;
      case "date":
        return DATE_MATCH_MODE;
      case "boolean":
        return BOOLEAN_MATCH_MODE;
      default:
        return STR_MATCH_MODE;
    }
  };

  const handleOperatorSelection = (event: any, selectedOperator: IOPTIONS) => {
    event.stopPropagation();
    event.preventDefault();
    setOperatorSelected(selectedOperator);
  };

  const operatorSection: ReactNode = useMemo(() => {
    return (
      <div className={styles.operator_container} ref={wrapperRef}>
        <Dropdown
          value={operatorSelected}
          options={OPERATOR}
          optionLabel="label"
          optionValue="value"
          onChange={(event: any, value: IOPTIONS) =>
            handleOperatorSelection(event, value)
          }
          filter={false}
          className={styles.operator_selection_section}
        />
      </div>
    );
  }, [operatorSelected]);

  const handleModeSelection = (
    event: any,
    selectedMode: IOPTIONS,
    uniqueId: string
  ) => {
    event.stopPropagation();
    event.preventDefault();
    let _constraintsValue = structuredClone(constraintsValue);
    const selectedItem: ICONSTRAINTS | undefined = _constraintsValue.find(
      (a: ICONSTRAINTS) => a.id === uniqueId
    );
    if (selectedItem) {
      if (column.filterType === "boolean") {
        selectedItem.query = selectedMode.value;
        selectedItem.matchMode = "equals";
      } else {
        selectedItem.matchMode = selectedMode.value;
      }
      setConstraintsValue(_constraintsValue);
    }
  };

  const handleInputValue = (
    event: React.ChangeEvent<HTMLInputElement>,
    uniqueId: string
  ) => {
    let _constraintsValue = structuredClone(constraintsValue);
    const selectedItem: ICONSTRAINTS | undefined = _constraintsValue.find(
      (a: ICONSTRAINTS) => a.id === uniqueId
    );
    if (selectedItem) {
      selectedItem.query = event.target.value;
      setConstraintsValue(_constraintsValue);
    }
  };

  const handleDateSelection = (event: any, uniqueId: string) => {
    event.stopPropagation();
    event.preventDefault();
    let _constraintsValue = structuredClone(constraintsValue);
    const selectedItem: ICONSTRAINTS | undefined = _constraintsValue.find(
      (a: ICONSTRAINTS) => a.id === uniqueId
    );
    if (selectedItem) {
      selectedItem.query = event.value;
      setConstraintsValue(_constraintsValue);
    }
  };

  const selectedMode = (value: FILTERVALUE) => {
    return ALL_MATCH_MODE.find((item) => item.value === value);
  };

  const removeRule = (uniqueId: string) => {
    const _constraintsValue = structuredClone(constraintsValue);
    const index = _constraintsValue.findIndex(
      (a: ICONSTRAINTS) => a.id === uniqueId
    );
    _constraintsValue.splice(index, 1);
    setConstraintsValue(_constraintsValue);
  };

  const constraintsSection: ReactNode = useMemo(() => {
    return (
      <div ref={wrapperRef}>
        {constraintsValue
          ?.filter((a: ICONSTRAINTS) => a.column === column.field)
          ?.map((item: ICONSTRAINTS) => (
            <div
              className={styles.constraints_container}
              ref={wrapperRef}
              key={item.id}
            >
              <div className={styles.matchmode_section}>
                <Dropdown
                  value={selectedMode(
                    column.filterType === "boolean"
                      ? item.query
                      : item.matchMode
                  )}
                  options={defaultModeOptions(column)}
                  optionLabel="label"
                  optionValue="value"
                  onChange={(event: any, value: IOPTIONS) =>
                    handleModeSelection(event, value, item.id)
                  }
                  filter={false}
                  className={styles.operator_selection_section}
                />
              </div>

              {column.filterType === "string" && (
                <InputText
                  value={item.query}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputValue(event, item.id)
                  }
                  onKeyDown={(event: any) => handleKeyDown(event)}
                  placeholder="Enter Value"
                />
              )}

              {column.filterType === "number" && (
                <InputText
                  value={item.query}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputValue(event, item.id)
                  }
                  type="number"
                  onKeyDown={(event: any) => handleKeyDown(event)}
                  placeholder="Enter Number"
                />
              )}

              {column.filterType === "date" && (
                <div ref={wrapperRef}>
                  <Calendar
                    value={item.query instanceof Date ? item?.query : null}
                    onChange={(e) => handleDateSelection(e, item.id)}
                    dateFormat="dd/mm/yy"
                    inputId="start_date"
                    maxDate={new Date()}
                    className={styles.calendar_input}
                    placeholder="Enter date dd/mm/yy"
                  />
                </div>
              )}

              {column.filterType !== "boolean" &&
                constraintsValue.filter(
                  (a: ICONSTRAINTS) => a.column === column.field
                )?.length > 1 && (
                  <div
                    className={styles.remove_rule_container}
                    key={item.id}
                    ref={wrapperRef}
                  >
                    <Button
                      label="Remove Rule"
                      size="small"
                      className={styles.remove_text}
                      icon={DELETE}
                      onClick={() => removeRule(item.id)}
                    />
                  </div>
                )}
            </div>
          ))}
      </div>
    );
  }, [column, constraintsValue]);

  const addRule = (
    event: React.MouseEvent<HTMLButtonElement>,
    constraintsValue: ICONSTRAINTS[]
  ) => {
    event.stopPropagation();
    event.preventDefault();
    if (
      filterLimit === 0 ||
      constraintsValue.filter((a: ICONSTRAINTS) => a.column === column.field)
        .length < filterLimit
    ) {
      setConstraintsValue((prevConstraintsValue: ICONSTRAINTS[]) => [
        ...prevConstraintsValue,
        { ...matchModes, id: generateUID() },
      ]);
    }
  };

  const addRuleSection: ReactNode = useMemo(() => {
    return (
      <div
        className={styles.add_rule_container}
        ref={wrapperRef}
        style={{
          display:
            filterLimit === 0 ||
            constraintsValue.filter(
              (a: ICONSTRAINTS) => a.column === column.field
            ).length < filterLimit
              ? "flex"
              : "none",
        }}
      >
        <Button
          label="Add Rule"
          size="small"
          className={styles.add_rule}
          severity="outlined"
          icon={ADD}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            addRule(event, constraintsValue)
          }
        />
      </div>
    );
  }, [constraintsValue]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      applyFilter(
        column.field,
        handleApplyFilter(constraintsValue, operatorSelected)
      );
    }
  };

  const handleApplyFilter = (
    constraintsValue: ICONSTRAINTS[],
    operatorSelected: IOPTIONS
  ) => {
    setShowFilter(false);
    return {
      operator: operatorSelected.value,
      constraints: constraintsValue
        ?.filter((a: ICONSTRAINTS) => a.column === column.field)
        ?.map((item: ICONSTRAINTS) => ({
          value: item.query,
          matchMode: item.matchMode,
        })),
    };
  };

  const handleClearFilter = (constraintsValue: ICONSTRAINTS[]) => {
    const _finalMatchmode: ICONSTRAINTS[] = [];
    let originalConstraintsValue = structuredClone(constraintsValue);
    const _matchModeSelected = constraintsValue
      ?.filter((a: ICONSTRAINTS) => a.column === column.field)
      ?.map((a: ICONSTRAINTS) => ({
        id: generateUID(),
        matchMode:
          column.filterType === "string"
            ? "contains"
            : column.filterType === "date"
            ? "dateIs"
            : "equals",
        query:
          column.filterType === "boolean"
            ? true
            : column.filterType === "date"
            ? null
            : "",
        column: a.column,
      }))?.[0];
    let clonedMatchmode = structuredClone([_matchModeSelected]);
    originalConstraintsValue?.forEach((a: ICONSTRAINTS) => {
      let index = clonedMatchmode?.findIndex((b) => a.column === b.column);
      if (index === -1) {
        _finalMatchmode?.push(a);
      }
    });
    let final = [..._finalMatchmode, ...clonedMatchmode];
    setConstraintsValue(final);
    return {
      operator: "AND",
      constraints: [matchModes],
    };
  };

  const footerSection: ReactNode = useMemo(() => {
    return (
      <div className={styles.footer_container} ref={wrapperRef}>
        <Button
          label="Clear"
          size="small"
          outlined={true}
          className={styles.footer_text}
          onClick={() =>
            clearFilter(column.field, handleClearFilter(constraintsValue))
          }
        />
        <Button
          label="Apply"
          size="small"
          severity="primary"
          className={styles.footer_text}
          onClick={() =>
            applyFilter(
              column.field,
              handleApplyFilter(constraintsValue, operatorSelected)
            )
          }
        />
      </div>
    );
  }, [column, constraintsValue, operatorSelected]);

  return (
    <div className={styles.filter_section}>
      <Button
        iconOnly={true}
        icon={filteredCol ? activeFilter : defaultFilter}
        className={styles.filter_icon}
        onClick={() => handleFilterShow()}
        ref={positionRef}
      />

      {showFilter && (
        <Fragment>
          {createPortal(
            <div
              className={styles.filter_container}
              ref={wrapperRef}
              style={{
                top: page.top,
                left: page.left,
              }}
            >
              {column.filterType !== "boolean" && operatorSection}
              {constraintsSection}
              {column.filterType !== "boolean" && addRuleSection}
              {footerSection}
            </div>,
            document.getElementsByTagName("body")[0]
          )}
        </Fragment>
      )}
    </div>
  );
};

export default ColumnFiltering;
