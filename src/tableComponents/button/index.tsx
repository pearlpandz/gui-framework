import React, { forwardRef, Fragment, ReactNode, useMemo } from "react";
import Image from "next/image";

// Styles
import styles from "./button.module.scss";

interface ButtonProps {
  size?: "small" | "medium" | "large";
  severity?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  disabled?: boolean;
  className?: string;
  rounded?: boolean;
  icon?: string;
  label?: string;
  outlined?: boolean;
  text?: boolean;
  iconOnly?: boolean;
  children?: ReactNode;
  [key: string]: any;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    size = "medium",
    severity = "",
    disabled = false,
    className = "",
    rounded = false,
    icon,
    label = "",
    outlined = false,
    text = false,
    iconOnly = false,
    children,
    ...others
  } = props;

  const handleButton = useMemo(() => {
    if (iconOnly) {
      return (
        <Image
          src={icon}
          alt={label || "button-icon"}
          className={styles.button_icon}
        />
      );
    } else if (text) {
      return <p className={styles.text}>{label}</p>;
    } else {
      return (
        <Fragment>
          {icon && (
            <Image src={icon} alt={label} className={styles.button_icon} />
          )}
          {label && <p className={styles.text}>{label}</p>}
          {children}
        </Fragment>
      );
    }
  }, [children, icon, iconOnly, label, text]);

  return (
    <button
      disabled={disabled}
      className={`
            ${styles.button_container} 
            ${size && styles?.[size]} 
            ${severity && !iconOnly && styles?.[severity]} 
            ${rounded && styles?.rounded} 
            ${outlined && styles.outlined} 
            ${text && styles?.text}
            ${disabled && styles.disabled}
            ${className}
            `}
      {...others}
      ref={ref}
    >
      {handleButton}
    </button>
  );
});

export default Button;
