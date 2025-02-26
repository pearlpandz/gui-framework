import React, { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

// Custom Components
import InputText from "../input";
import Checkbox from "../checkbox";

// Styles
import styles from "./multiSelect.module.scss";

// Assets
import DOWN from "../assets/chevron-down.svg";
import UP from "../assets/chevron-up.svg";
import CLEAR from "../assets/clear.svg";
import SEARCH from "../assets/simple-search.svg";

interface Option {
  disable?: boolean;
  [key: string]: any;
}

interface MultiSelectProps {
  label?: string;
  value: any;
  onChange: any;
  options: string[] | number[] | Option[];
  filter?: boolean;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  className?: string;
  selectionLimit?: number;
  showSelectAll?: boolean;
  emptyMessage?: string;
  [key: string]: any;
}

const MultiSelect: React.FC<MultiSelectProps> = (props) => {
  const {
    label,
    value = [],
    onChange,
    options = [],
    filter = true,
    optionLabel = "label",
    optionValue = "value",
    placeholder = "Select values",
    emptyMessage = "No options available",
    className,
    selectionLimit = 0,
    showSelectAll = typeof selectionLimit === "number" && selectionLimit > 0
      ? false
      : true,
    ...others
  } = props;

  const wrapperRef = useRef<any>(null);
  const positionRef = useRef<any>(null);
  const [show, setShow] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<{
    top: number | string;
    left: number | string;
    width: number | string;
  }>({ top: 0, left: 0, width:0 });

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        show &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        positionRef.current &&
        !positionRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [show, wrapperRef, positionRef]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaX !== undefined && event.deltaX !== 0) {
        setShow(false);
        setQuery("");
      }
    };

    const handleScroll = (event: Event) => {
      const target = event.currentTarget as any;
      if (target.scrollX > 0) {
        setShow(false);
        setQuery("");
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

  const handleRowSelection = (
    event: React.MouseEvent<HTMLDivElement>,
    option: string | number | Option,
    type: string
  ) => {
    event.preventDefault();
    let _selectedValue = structuredClone(value);
    let index = 0;
    if (type === "simple") {
      index = _selectedValue.findIndex(
        (item: string | number) => item === option
      );
    } else {
      if (typeof option === "object") {
        index = _selectedValue.findIndex(
          (item: Option) => item?.[optionValue] === option?.[optionValue]
        );
      }
    }
    // Uncheck
    if (index > -1) {
      _selectedValue.splice(index, 1);
      onChange(event, _selectedValue);
    }
    // Check
    else {
      if (selectionLimit === 0) {
        onChange(event, [...(_selectedValue || []), option]);
      } else if (selectionLimit !== 0 && value.length < selectionLimit) {
        onChange(event, [...(_selectedValue || []), option]);
      }
    }
  };

  const handleAllSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (value.length !== options.length) {
      onChange(event, options);
    } else {
      onChange(event, []);
    }
  };

  useEffect(() => {
    // Calculate position whenever query changes
    if (show && positionRef.current) {
      calculatePosition(positionRef.current, "change");
    }
  }, [query]);

  const calculatePosition = (dropdown: any, type: string) => {
    const elemRect = dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - elemRect.bottom;
    const requiredHeight =
      document.getElementById("dropdown_list")?.clientHeight;

    // If space below is less than 200px, open the list above the div
    if (spaceBelow < 200) {
      if (
        type === "change" &&
        typeof requiredHeight === "number" &&
        requiredHeight
      ) {
        let _requiredHeight = requiredHeight > 150 ? 0 : requiredHeight / 2 - 10;
        setPage({
          top: elemRect.top + window.scrollY - 205 + _requiredHeight,
          left: elemRect.left,
          width:elemRect.width,
        });
      } else {
        setPage({
          top: elemRect.top + window.scrollY - 205,
          left: elemRect.left,
          width:elemRect.width,
        });
      }
    } else {
      // Otherwise, open the list below the div
      setPage({
        top: elemRect.bottom + window.scrollY + 5,
        left: elemRect.left,
        width:elemRect.width,
      });
    }
  };

  const handleClickDropdown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setShow(!show);
    setQuery("");
    calculatePosition(positionRef.current, "still"); // Calculate position when clicked
  };

  const handleClear = () => {
    setShow(true);
    setQuery("");
  };

  const filteredOptions = options?.filter((option: string | number | Option) =>
    typeof option === "string" || typeof option === "number"
      ? option.toString().toLowerCase().includes(query?.toLowerCase())
      : option?.[optionLabel]
          .toString()
          .toLowerCase()
          ?.includes(query?.toLowerCase())
  );

  return (
    <div className={styles.multiselect_container} {...others}>
      {label && <label className={styles.label}>{label}</label>}
      <div
        className={`${styles.multiSelect} ${className}`}
        onClick={(event: React.MouseEvent<HTMLDivElement>) =>handleClickDropdown(event)}
        ref={positionRef}
      >
        <p className={styles.value}>
          {value.length > 0
            ? `${value?.length} ${
                value.length === 1 ? "item" : "items"
              } selected`
            : placeholder}
        </p>
        <Image src={show ? UP : DOWN} alt={show ? "up-arrow" : "down-arrow"} />
      </div>

      {show && (
        <Fragment>
          {createPortal(
            <div
              className={styles.items}
              id="dropdown_list"
              style={{
                top: page.top,
                left: page.left,
                minWidth:page.width,
              }}
              ref={wrapperRef}
            >
              {filter && (
                <div className={styles.search} ref={wrapperRef}>
                  <InputText
                    placeholder="Search..."
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setQuery(event.target.value)
                    }
                    className={styles.multiSelect_input}
                    value={query}
                    inputAdornment={
                      query.length > 0 ? (
                        <Image
                          src={CLEAR}
                          alt="clear"
                          onClick={() => handleClear()}
                          height={18}
                          width={18}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <Image src={SEARCH} alt="search" />
                      )
                    }
                  />
                </div>
              )}
              <ul className={styles.list}>
                {showSelectAll && (
                  <div className={styles.item} style={{ cursor: "default" }}>
                    {
                      <Checkbox
                        checked={value.length === options.length}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => handleAllSelection(event)}
                        style={{ cursor: "pointer" }}
                      />
                    }
                  </div>
                )}
                {filteredOptions.length > 0 ? (
                  filteredOptions?.map(
                    (option: string | number | Option, index: number) => (
                      <div
                        className={
                          typeof option === "string" ||
                          typeof option === "number"
                            ? value?.findIndex(
                                (item: string | number) => item === option
                              ) > -1
                              ? `${styles.item} ${styles.active}`
                              : styles.item
                            : value?.findIndex(
                                (item: Option) =>
                                  item[optionValue] === option[optionValue]
                              ) > -1
                            ? `${styles.item} ${styles.active}`
                            : styles.item
                        }
                        key={index}
                        onClick={(event) =>
                          handleRowSelection(
                            event,
                            option,
                            typeof option === "string" ||
                              typeof option === "number"
                              ? "simple"
                              : ""
                          )
                        }
                      >
                        {typeof option === "string" ||
                        typeof option === "number" ? (
                          <Checkbox
                            checked={
                              value?.findIndex(
                                (item: string | number) => item === option
                              ) > -1
                            }
                            readOnly
                          />
                        ) : (
                          <Checkbox
                            checked={
                              value?.findIndex(
                                (item: Option) =>
                                  item?.[optionValue] === option?.[optionValue]
                              ) > -1
                            }
                            readOnly
                          />
                        )}
                        <label className={styles.content}>
                          {typeof option === "string" ||
                          typeof option === "number"
                            ? option
                            : option?.[optionLabel]}
                        </label>
                      </div>
                    )
                  )
                ) : (
                  <p
                    style={{
                      padding: "15px",
                      color: "#05171a",
                      fontSize: "16px",
                      fontWeight: "400",
                    }}
                  >
                    {emptyMessage}
                  </p>
                )}
              </ul>
            </div>,
            document.getElementsByTagName("body")[0]
          )}
        </Fragment>
      )}
    </div>
  );
};

export default MultiSelect;
