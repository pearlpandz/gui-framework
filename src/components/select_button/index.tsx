import React, { useCallback } from "react";

import styles from "./select_button.module.scss";

interface OPTION {
  name: string;
  disabled?: boolean;
  field?: string;
}

interface SelectButtonProps {
  options: OPTION[] | string[];
  value: string;
  onChange: (e: any, selectedItem: any) => void;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

const SelectButton: React.FC<SelectButtonProps> = (props) => {
  const {
    options = [],
    value = "",
    onChange,
    ...others
  } = props;

  const onButtonSelection = (event: any, selectedItem: string | OPTION) => {
    onChange(event, selectedItem);
  };

  const requiredClassName = useCallback((item: string | OPTION) => {
    let activeClassName: string = `${styles.button_selection} ${styles.active}`;
    let disabledClassName: string = `${styles.button_selection} ${styles.disable}`;
    let defaultClassName: string = `${styles.button_selection}`;
    if (typeof item === "string") {
      if (item === value) {
        return activeClassName;
      } else {
        return defaultClassName;
      }
    } else if (typeof item === "object") {
      if (item?.name || item?.field === value) {
        return activeClassName;
      } else if (item.disabled) {
        return disabledClassName;
      } else {
        return defaultClassName;
      }
    }
  }, [value]);

  return (
    <div className={styles.button_section} {...others}>
      {options?.map((item) => (
        <div
          className={requiredClassName(item)}
          key={typeof item === "string" ? item : item.name || item.field}
          onClick={(event) => onButtonSelection(event, item)}
        >
          <p className={styles.button_name}>
            {typeof item === "string" ? item : item?.name}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SelectButton;
