import React, {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// Custom Components
import InputText from "../input";

// Styles
import styles from "./dropdown.module.scss";

// Assets
import DOWN from "../assets/chevron-down.svg";
import UP from "../assets/chevron-up.svg";
import CLEAR from "../assets/clear.svg";
import SEARCH from "../assets/simple-search.svg";

interface Option {
  disable?: boolean;
  [key: string]: any;
}

interface DropdownProps {
  label?: string;
  value: any;
  onChange: (event: any, data: any) => void;
  options: string[] | number[] | Option[];
  filter?: boolean;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
  disabled?:boolean;
  [key: string]: any;
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  const {
    label = "",
    value,
    onChange,
    options = [],
    filter = true,
    optionLabel = "label",
    optionValue = "value",
    placeholder = "Select a value",
    className,
    emptyMessage = "No options available",
    disabled = false,
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
  }>({ top: 0, left: 0, width: 0 });

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

  const handleSelection = (
    event: React.MouseEvent<HTMLLIElement>,
    option: string | number | Option
  ) => {
    if (typeof option === "string" || typeof option === "number") {
      onChange(event, option);
    } else {
      if (!option?.disable) {
        onChange(event, option);
      }
    }
    setShow(false);
    setQuery("");
  };

  useLayoutEffect(() => {
    // Calculate position whenever query changes
    if (positionRef.current) {
      calculatePosition(positionRef.current);
    }
  }, [query, show]);

  const calculatePosition = (dropdown: any) => {
    const elemRect = dropdown.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    const spaceBelow = viewportHeight - elemRect.bottom;
    const dropdownHeight =
      document.getElementById("dropdown_list")?.clientHeight || 195;

    // If space below is less than 200px, open the list above the div
    if (spaceBelow < 200) {
      setPage({
        top: elemRect.top + window.scrollY - dropdownHeight - 10,
        left: elemRect.left,
        width: elemRect.width,
      });
    } else {
      // Otherwise, open the list below the div
      setPage({
        top: elemRect.bottom + window.scrollY + 5,
        left: elemRect.left,
        width: elemRect.width,
      });
    }
  };

  const handleClickDropdown = (event: React.MouseEvent<HTMLDivElement>) => {
    if(disabled) return 
    event.stopPropagation();
    event.preventDefault();
    setShow(!show);
    setQuery("");
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
    <div className={styles.dropdown_container} {...others}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={`${styles.dropdown} ${className} ${disabled && styles.disabled}`}
        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
          handleClickDropdown(event)
        }
        ref={positionRef}
      >
        <p className={styles.value}>
          {value
            ? typeof value === "string" || typeof value === "number"
              ? value
              : value?.[optionLabel]
            : placeholder}
        </p>
        <img src={show ? UP : DOWN} alt={show ? "up-arrow" : "down-arrow"} />
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
                minWidth: page.width,
                maxWidth: "250px",
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
                    className={styles.dropdown_input}
                    value={query}
                    inputAdornment={
                      query.length > 0 ? (
                        <img
                          src={CLEAR}
                          alt="clear"
                          onClick={() => handleClear()}
                          height={18}
                          width={18}
                          style={{ cursor: "pointer" }}
                        />
                      ) : (
                        <img src={SEARCH} alt="search" />
                      )
                    }
                  />
                </div>
              )}
              <ul className={styles.list}>
                {filteredOptions.length > 0 ? (
                  filteredOptions?.map((option: string | number | Option , index:number) => (
                    <li
                      className={`${styles.item} ${
                        typeof option === "string" || typeof option === "number"
                          ? option === value
                            ? styles.active
                            : ""
                          : option?.[optionValue] === value?.[optionValue]
                          ? styles.active
                          : ""
                      } ${
                        typeof option === "object" && option?.disable
                          ? styles.disable
                          : ""
                      }`}
                      key={
                        typeof option === "string" || typeof option === "number"
                          ? `${option} ${index}`
                          : `${option[optionValue]} ${index}`
                      }
                      onClick={(event) => handleSelection(event, option)}
                    >
                      <p className={styles.content}>
                        {typeof option === "string" ||
                        typeof option === "number"
                          ? option
                          : option?.[optionLabel]}
                      </p>
                    </li>
                  ))
                ) : (
                  <p className={styles.emptyMessage}>{emptyMessage}</p>
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

export default Dropdown;