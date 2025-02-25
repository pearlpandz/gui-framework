"use client";
import React, { forwardRef, ReactNode, useState } from "react";
import Image from "next/image";

// Styles
import styles from "./inputText.module.scss";

interface InputTextProps {
  icon?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  size?: "small" | "normal" | "large";
  value: string;
  disabled?: boolean;
  rounded?: boolean;
  helperText?: string;
  floatLabel?: string;
  error?: boolean;
  autoComplete?: boolean;
  required?: boolean;
  inputAdornment?: string | ReactNode;
  readOnly?: boolean;
  type?:string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>((props, ref) => {
  const {
    icon,
    label = "",
    placeholder = "",
    className = "",
    size = "normal",
    value = "",
    disabled = false,
    rounded = false,
    helperText = "",
    floatLabel = "",
    error = false,
    autoComplete = false,
    required = false,
    inputAdornment = null,
    readOnly = false,
    onChange,
    type = "text",
    ...others
  } = props;

  const [focused, setFocused] = useState<boolean>(false);

  return (
    <div className={`${styles.input_container} ${className}`}>
      {label.length > 0 && (
        <label className={styles.label}>
          {required ? `${label} *` : label}
        </label>
      )}
      {floatLabel?.length > 0 && (value?.length > 0 || focused) && (
        <label
          className={`${styles.float_label} ${
            error ? styles.error_float_label : ""
          }`}
        >
          {required ? `${floatLabel} *` : floatLabel}
        </label>
      )}
      <div
        className={`${styles.input_box} ${rounded ? styles.rounded : ""} ${
          disabled ? styles.disabled : ""
        } ${error ? styles.error : ""}`}
      >
        <input
          className={`${styles.input} ${styles[size]}`}
          {...others}
          disabled={disabled}
          value={value}
          type={type}
          placeholder={
            floatLabel && !placeholder && !focused
              ? floatLabel
              : (!floatLabel && placeholder && !focused) ||
                (floatLabel && placeholder && !focused)
              ? placeholder
              : ""
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete ? "on" : "off"}
          ref={ref}
          readOnly={readOnly}
          required={required}
          onChange={onChange}
        />
        {icon && !inputAdornment && (
          <Image
            className={styles.input_image}
            src={icon}
            alt="icon"
            {...others}
          />
        )}

        {inputAdornment && inputAdornment}
      </div>
      {helperText?.length > 0 && (
        <small
          className={`${styles.helper_text} ${error ? styles.error_text : ""}`}
        >
          {helperText}
        </small>
      )}
    </div>
  );
});

export default InputText;
