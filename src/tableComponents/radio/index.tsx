import React from "react";

import styles from "./radio.module.scss";

interface RadioButtonProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checked: boolean;
  disabled?: boolean;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

const RadioButton: React.FC<RadioButtonProps> = (props) => {
  const {
    name = "",
    value = "",
    onChange,
    checked = false,
    disabled = false,
    ...others
  } = props;
  return (
    <div className={styles.radio_container}>
      <input
        className={`${styles.radio_input} ${disabled && styles.disabled}`}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...others}
      />
      <div
        className={
          checked && !disabled
            ? `${styles.radio_box} ${styles.checked}`
            : (checked && disabled) || disabled
            ? `${styles.radio_box} ${styles.disabled}`
            : styles.radio_box
        }
      >
        <div
          className={
            checked && !disabled
              ? `${styles.radio_box_icon} ${styles.checked}`
              : (checked && disabled) || disabled
              ? `${styles.radio_box_icon} ${styles.disabled}`
              : styles.radio_box_icon
          }
        ></div>
      </div>
    </div>
  );
};

export default RadioButton;
