import React from "react";

// Styles
import styles from "./loader.module.scss";

interface LoaderProps {
  message?: string;
  pageLoader?: boolean;
  className?: string;
  [key: string]: any; // Allow additional props to be passed (e.g., className, id)
}

const Loader: React.FC<LoaderProps> = (props) => {
  const { message = "", pageLoader = false, className, ...others } = props;
  return (
    <div
      className={`${styles.progress_loader_container} ${className} ${
        pageLoader && styles.pageLoader
      }`}
      {...others}
    >
      <div className={styles.loader}></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Loader;
